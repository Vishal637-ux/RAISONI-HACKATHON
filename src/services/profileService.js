import { supabase } from '../supabase/client';

export const profileService = {
  /**
   * Helper to retrieve file URL (signed URL if bucket is private, public URL otherwise)
   */
  async getStorageUrl(bucketName, filePath) {
    try {
      const { data: signedData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);
      if (signedData?.signedUrl) return signedData.signedUrl;
    } catch {
      // Fallback to public URL if signed URL creation fails or bucket is public
    }
    try {
      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return publicData?.publicUrl || filePath;
    } catch {
      return filePath;
    }
  },

  /**
   * Fetch authenticated user's profile details from users and student_profiles tables
   * Returns clean default state without console warnings if records or tables do not exist
   */
  async fetchStudentProfile(userId) {
    if (!userId) return null;

    let userData = null;
    let profileData = null;
    let authUser = null;

    try {
      const { data: authRes } = await supabase.auth.getUser();
      if (authRes?.user?.id === userId) {
        authUser = authRes.user;
      }
    } catch {
      // Continue safely
    }

    try {
      // 1. Fetch user data from public.users table using .maybeSingle()
      const userRes = await supabase
        .from('users')
        .select('id, email, full_name, role, phone, status, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (!userRes.error && userRes.data) {
        userData = userRes.data;
      }
    } catch {
      // Silent catch for missing table or network error
    }

    try {
      // 2. Fetch student profile data from public.student_profiles table using .maybeSingle()
      const profileRes = await supabase
        .from('student_profiles')
        .select('id, user_id, roll_number, department, year, semester, cgpa, skills, resume_url, profile_photo_url')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profileRes.error && profileRes.data) {
        profileData = profileRes.data;
      }
    } catch {
      // Silent catch for missing table or network error
    }

    const meta = authUser?.user_metadata || {};

    return {
      id: userId,
      email: userData?.email || authUser?.email || '',
      fullName: userData?.full_name || meta?.full_name || '',
      phone: userData?.phone || meta?.phone || '',
      status: userData?.status || 'Active',
      role: userData?.role || meta?.role || 'student',
      rollNumber: profileData?.roll_number || meta?.roll_number || '',
      department: profileData?.department || meta?.department || '',
      year: profileData?.year ? String(profileData.year) : (meta?.year ? String(meta.year) : ''),
      semester: profileData?.semester ? String(profileData.semester) : (meta?.semester ? String(meta.semester) : ''),
      cgpa: profileData?.cgpa != null ? String(profileData.cgpa) : (meta?.cgpa ? String(meta.cgpa) : ''),
      skills: profileData?.skills || meta?.skills || '',
      linkedinUrl: meta?.linkedin_url || '',
      githubUrl: meta?.github_url || '',
      resumeUrl: profileData?.resume_url || null,
      profilePhotoUrl: profileData?.profile_photo_url || null,
    };
  },

  /**
   * Update personal, contact, and academic profile information
   */
  async updateStudentProfile(userId, { fullName, phone, rollNumber, department, year, semester, cgpa, skills, linkedinUrl, githubUrl }) {
    if (!userId) throw new Error('User ID is required');

    const updatedAt = new Date().toISOString();

    // 1. Update public.users table
    try {
      await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone: phone,
          updated_at: updatedAt,
        })
        .eq('id', userId);
    } catch {
      // Continue safely
    }

    // 2. Update public.student_profiles table
    const profilePayload = {
      user_id: userId,
      roll_number: rollNumber,
      department: department,
      year: year ? parseInt(String(year).replace(/\D/g, ''), 10) : null,
      semester: semester ? parseInt(String(semester).replace(/\D/g, ''), 10) : null,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      skills: skills || null,
    };

    try {
      const { data: existingRecord } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRecord) {
        await supabase
          .from('student_profiles')
          .update(profilePayload)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('student_profiles')
          .insert(profilePayload);
      }
    } catch {
      // Continue safely
    }

    // 3. Update auth user_metadata for social handles
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
          roll_number: rollNumber,
          department: department,
          year: year,
          semester: semester,
          cgpa: cgpa,
          skills: skills,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
        },
      });
    } catch {
      // Continue safely
    }

    return true;
  },

  /**
   * Helper to convert File to Data URL fallback
   */
  readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload resume document to Supabase Storage bucket with local fallback
   */
  async uploadResume(userId, file) {
    if (!userId || !file) throw new Error('User ID and file are required');

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/resume_${Date.now()}.${fileExt}`;

    let resumeUrl = null;
    const bucketCandidates = ['student-resumes', 'resumes', 'Student Resumes'];

    for (const bName of bucketCandidates) {
      try {
        const { data, error } = await supabase.storage
          .from(bName)
          .upload(filePath, file, { upsert: true });

        if (!error && data) {
          resumeUrl = await this.getStorageUrl(bName, filePath);
          break;
        }
      } catch {
        // Continue trying next candidate bucket
      }
    }

    // Fallback if Supabase bucket is missing or unconfigured
    if (!resumeUrl) {
      resumeUrl = await this.readFileAsDataURL(file);
    }

    try {
      const { data: existingRecord } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRecord) {
        await supabase
          .from('student_profiles')
          .update({ resume_url: resumeUrl })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('student_profiles')
          .insert({ user_id: userId, resume_url: resumeUrl });
      }
    } catch {
      // Continue safely
    }

    return { resumeUrl, fileName: file.name };
  },

  /**
   * Upload profile photo to Supabase Storage bucket with local fallback
   */
  async uploadProfilePhoto(userId, file) {
    if (!userId || !file) throw new Error('User ID and file are required');

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/photo_${Date.now()}.${fileExt}`;

    let photoUrl = null;
    const bucketCandidates = ['profile-photos', 'photos', 'Student Profile Photos'];

    for (const bName of bucketCandidates) {
      try {
        const { data, error } = await supabase.storage
          .from(bName)
          .upload(filePath, file, { upsert: true });

        if (!error && data) {
          photoUrl = await this.getStorageUrl(bName, filePath);
          break;
        }
      } catch {
        // Continue trying next candidate bucket
      }
    }

    // Fallback if Supabase bucket is missing or unconfigured
    if (!photoUrl) {
      photoUrl = await this.readFileAsDataURL(file);
    }

    try {
      const { data: existingRecord } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRecord) {
        await supabase
          .from('student_profiles')
          .update({ profile_photo_url: photoUrl })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('student_profiles')
          .insert({ user_id: userId, profile_photo_url: photoUrl });
      }
    } catch {
      // Continue safely
    }

    return photoUrl;
  },

  /**
   * Remove profile photo URL from student_profiles table
   */
  async removeProfilePhoto(userId) {
    if (!userId) throw new Error('User ID is required');

    try {
      await supabase
        .from('student_profiles')
        .update({ profile_photo_url: null })
        .eq('user_id', userId);
    } catch {
      // Continue safely
    }
    return true;
  },
};
