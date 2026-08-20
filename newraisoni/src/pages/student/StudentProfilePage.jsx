import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { authService } from '../../services/authService';
import { ResumeUploader } from '../../components/student/ResumeUploader';
import { DEFAULT_DEPARTMENTS } from '../../constants/departments';
import { User, BookOpen, Award, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [studentProfile, setStudentProfile] = useState(null);
  const [completeness, setCompleteness] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    rollNumber: '',
    departmentId: '',
    year: '3',
    semester: '5',
    cgpa: '',
    skillsInput: '',
  });

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      // Load active departments
      const depts = await authService.fetchDepartments();
      setDepartments(depts || DEFAULT_DEPARTMENTS);

      // Load profile
      const prof = await profileService.getStudentProfile(user.id);
      setStudentProfile(prof);

      if (prof) {
        setFormData({
          fullName: prof.full_name || '',
          phone: prof.phone || '',
          rollNumber: prof.roll_number || '',
          departmentId: prof.department_id || (depts?.[0]?.id || ''),
          year: prof.year ? String(prof.year) : '3',
          semester: prof.semester ? String(prof.semester) : '5',
          cgpa: prof.cgpa !== null && prof.cgpa !== undefined ? String(prof.cgpa) : '',
          skillsInput: Array.isArray(prof.skills) ? prof.skills.join(', ') : '',
        });

        const score = profileService.calculateProfileCompleteness(prof);
        setCompleteness(score);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validation Rules
    if (formData.cgpa !== '') {
      const parsedCgpa = parseFloat(formData.cgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        setError('CGPA must be a valid number between 0.00 and 10.00');
        return;
      }
    }

    try {
      setSaving(true);
      const updated = await profileService.updateStudentProfile(user.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        rollNumber: formData.rollNumber,
        departmentId: formData.departmentId,
        year: formData.year,
        semester: formData.semester,
        cgpa: formData.cgpa,
        skills: formData.skillsInput,
      });

      setStudentProfile(updated);
      const score = profileService.calculateProfileCompleteness(updated);
      setCompleteness(score);

      setMessage('Student profile updated successfully in live database!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeSuccess = (newUrl) => {
    setStudentProfile((prev) => {
      const updated = { ...prev, resume_url: newUrl };
      const score = profileService.calculateProfileCompleteness(updated);
      setCompleteness(score);
      return updated;
    });
  };

  return (
    <PortalLayout title="Student Academic Profile" roleLabel="Student">
      {/* Header Banner & Completeness Indicator */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#18201B]">Academic & Institutional Profile</h2>
          <p className="text-sm text-[#66706A] mt-1">
            Maintain your verified academic metrics, skills, and resume document for placement eligibility.
          </p>
        </div>

        {/* Profile Completeness Score */}
        <div className="bg-[#F5FAF6] border border-[#E1E7E2] p-4 rounded-xl min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-[#66706A]">Profile Completeness</span>
            <span className="text-[#2F8F46] font-extrabold text-sm">{completeness}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#E1E7E2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2F8F46] transition-all duration-500 rounded-full"
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-[#66706A] mt-1.5 block">
            {completeness === 100 ? '✓ Complete Profile Verified' : 'Complete all fields for eligibility'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] flex items-center justify-center text-[#2F8F46]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E1E7E2]">
                <User className="w-5 h-5 text-[#2F8F46]" />
                <h3 className="text-base font-bold text-[#18201B]">Academic Credentials</h3>
              </div>

              {message && (
                <div className="flex items-center gap-2 p-3 text-xs bg-[#EAF4EC] text-[#1F6B32] border border-[#2F8F46]/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-[#2F8F46] shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#18201B] mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#66706A] mb-1">Email (Account Read-only)</label>
                  <input
                    type="email"
                    value={studentProfile?.email || user?.email}
                    disabled
                    className="w-full px-3 py-2 text-sm bg-[#F8FAF9] text-[#66706A] border border-[#E1E7E2] rounded-lg cursor-not-allowed"
                  />
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#18201B] mb-1">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 2024-CSE-042"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#18201B] mb-1">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-semibold text-[#18201B] mb-1">Academic Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-[#18201B] mb-1">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={String(s)}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic CGPA */}
                <div>
                  <label className="block text-xs font-semibold text-[#18201B] mb-1">Current Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="e.g. 8.50"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#18201B] mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <label className="block text-xs font-semibold text-[#18201B] mb-1">
                  Technical Skills (Comma separated)
                </label>
                <input
                  type="text"
                  name="skillsInput"
                  value={formData.skillsInput}
                  onChange={handleChange}
                  placeholder="React, Python, SQL, Node.js, Machine Learning"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E1E7E2] rounded-lg focus:outline-none focus:border-[#2F8F46]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-[#E1E7E2] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold text-sm rounded-lg transition-colors shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Resume Uploader */}
          <div className="space-y-6">
            <ResumeUploader
              userId={user?.id}
              currentResumeUrl={studentProfile?.resume_url}
              onUploadSuccess={handleResumeSuccess}
            />
          </div>
        </div>
      )}
    </PortalLayout>
  );
};
