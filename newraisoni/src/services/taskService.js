import { supabase } from '../supabase/client.js';

export const taskService = {
  /**
   * Assign a new task to an active internship (Company or Faculty Mentor)
   * @param {string} mentorUserId - Authenticated mentor user UUID
   * @param {string} internshipId - Master active internship UUID
   * @param {object} taskData - { title, description, dueDate }
   */
  async createTask(mentorUserId, internshipId, taskData) {
    if (!mentorUserId || !internshipId || !taskData) {
      throw new Error('Mentor User ID, Internship ID, and Task Data are required.');
    }

    const { title, description, dueDate } = taskData;
    if (!title || !title.trim()) {
      throw new Error('Task title is required.');
    }
    if (!description || !description.trim()) {
      throw new Error('Task description is required.');
    }
    if (!dueDate) {
      throw new Error('Task due date is required.');
    }

    // Future Due Date Validation: due_date > today
    const todayStr = new Date().toISOString().split('T')[0];
    if (dueDate <= todayStr) {
      throw new Error('Task due date must be a future date.');
    }

    try {
      // 1. Verify master active internship record
      const { data: internship, error: intErr } = await supabase
        .from('internships')
        .select('id, status, company_id, faculty_id')
        .eq('id', internshipId)
        .single();

      if (intErr || !internship) {
        throw new Error('Active internship record not found.');
      }

      if (internship.status !== 'ACTIVE') {
        throw new Error(`Cannot assign task for non-ACTIVE internship (current status: '${internship.status}').`);
      }

      // 2. Insert row into public.tasks
      const payload = {
        internship_id: internshipId,
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate,
        assigned_by: mentorUserId,
      };

      const { data: createdTask, error: insErr } = await supabase
        .from('tasks')
        .insert(payload)
        .select()
        .single();

      if (insErr) {
        console.error('Error inserting task:', insErr.message);
        throw insErr;
      }

      return createdTask;
    } catch (err) {
      console.error('taskService.createTask error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch assigned tasks and deliverable submissions for a student candidate
   * @param {string} studentUserId - Authenticated student user UUID
   */
  async getStudentTasks(studentUserId) {
    if (!studentUserId) return [];
    try {
      const { data: internship } = await supabase
        .from('internships')
        .select('id, internship_title, companies:company_id(company_name)')
        .eq('student_id', studentUserId)
        .maybeSingle();

      if (!internship) return [];

      const { data: tasks, error: tErr } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:assigned_by (full_name, email)
        `)
        .eq('internship_id', internship.id)
        .order('created_at', { ascending: false });

      if (tErr) throw tErr;
      if (!tasks || tasks.length === 0) return [];

      const taskIds = tasks.map((t) => t.id);

      // Fetch task submissions for this student
      const { data: submissions } = await supabase
        .from('task_submissions')
        .select('*')
        .in('task_id', taskIds)
        .eq('student_id', studentUserId);

      const subMap = new Map((submissions || []).map((s) => [s.task_id, s]));

      return tasks.map((task) => ({
        ...task,
        internship,
        submission: subMap.get(task.id) || null,
      }));
    } catch (err) {
      console.error('taskService.getStudentTasks error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch tasks created/assigned for company mentor's interns
   * @param {string} companyUserId - Authenticated company mentor user ID
   */
  async getCompanyTasks(companyUserId) {
    if (!companyUserId) return [];
    try {
      const { data: mentor } = await supabase
        .from('company_mentors')
        .select('company_id')
        .eq('user_id', companyUserId)
        .maybeSingle();

      if (!mentor?.company_id) return [];

      // Query internships for this company
      const { data: internships } = await supabase
        .from('internships')
        .select('id, student_id, internship_title, users:student_id(full_name, email)')
        .eq('company_id', mentor.company_id);

      if (!internships || internships.length === 0) return [];

      const internshipIds = internships.map((i) => i.id);
      const internshipMap = new Map(internships.map((i) => [i.id, i]));

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .in('internship_id', internshipIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!tasks || tasks.length === 0) return [];

      const taskIds = tasks.map((t) => t.id);
      const { data: submissions } = await supabase
        .from('task_submissions')
        .select('*')
        .in('task_id', taskIds);

      const subMap = new Map((submissions || []).map((s) => [s.task_id, s]));

      return tasks.map((task) => ({
        ...task,
        internship: internshipMap.get(task.internship_id),
        submission: subMap.get(task.id) || null,
      }));
    } catch (err) {
      console.error('taskService.getCompanyTasks error:', err.message || err);
      throw err;
    }
  },

  /**
   * Submit task deliverable file/URL for a student
   * @param {string} studentUserId - Authenticated student user UUID
   * @param {string} taskId - Assigned task UUID
   * @param {object} submissionData - { fileUrl, remarks }
   */
  async submitTaskDeliverable(studentUserId, taskId, submissionData) {
    if (!studentUserId || !taskId || !submissionData) {
      throw new Error('Student User ID, Task ID, and Submission Data are required.');
    }

    const { fileUrl, remarks } = submissionData;
    if (!fileUrl || !fileUrl.trim()) {
      throw new Error('Deliverable file URL or submission link is required.');
    }

    try {
      // 1. Verify task ownership via internship
      const { data: task, error: tErr } = await supabase
        .from('tasks')
        .select('id, internship_id, internships:internship_id(student_id)')
        .eq('id', taskId)
        .single();

      if (tErr || !task) {
        throw new Error('Task record not found.');
      }

      if (task.internships?.student_id !== studentUserId) {
        throw new Error('Unauthorized: Student does not match assigned task internship.');
      }

      // 2. Insert into public.task_submissions
      const payload = {
        task_id: taskId,
        student_id: studentUserId,
        file_url: fileUrl.trim(),
        remarks: remarks ? remarks.trim() : null,
        submitted_at: new Date().toISOString(),
      };

      const { data: submissionRow, error: insErr } = await supabase
        .from('task_submissions')
        .insert(payload)
        .select()
        .single();

      if (insErr) {
        console.error('Error submitting task deliverable:', insErr.message);
        throw insErr;
      }

      return submissionRow;
    } catch (err) {
      console.error('taskService.submitTaskDeliverable error:', err.message || err);
      throw err;
    }
  },

  /**
   * Mentor task submission review & grading (1.00 to 5.00 rating scale)
   * @param {string} mentorUserId - Authenticated mentor user ID
   * @param {string} submissionId - Task submission UUID
   * @param {object} gradeData - { gradeRating, feedbackRemarks }
   */
  async gradeTaskSubmission(mentorUserId, submissionId, gradeData) {
    if (!mentorUserId || !submissionId || !gradeData) {
      throw new Error('Mentor User ID, Submission ID, and Grade Data are required.');
    }

    const { gradeRating, feedbackRemarks } = gradeData;
    const numGrade = parseFloat(gradeRating);

    if (isNaN(numGrade) || numGrade < 1.0 || numGrade > 5.0) {
      throw new Error('Grade rating must be a numeric value between 1.00 and 5.00.');
    }

    try {
      const payload = {
        grade_rating: numGrade,
        remarks: feedbackRemarks ? feedbackRemarks.trim() : null,
      };

      const { data: updated, error } = await supabase
        .from('task_submissions')
        .update(payload)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) {
        console.error('Error grading task submission:', error.message);
        throw error;
      }

      return updated;
    } catch (err) {
      console.error('taskService.gradeTaskSubmission error:', err.message || err);
      throw err;
    }
  },
};
