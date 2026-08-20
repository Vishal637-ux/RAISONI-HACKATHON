import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { UserPlus, Mail, Lock, User, Phone, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    rollNumber: '',
    departmentId: '',
    year: '3',
    semester: '5',
    cgpa: '',
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authService.fetchDepartments().then((data) => {
      setDepartments(data || []);
      if (data && data.length > 0) {
        setFormData((prev) => ({ ...prev, departmentId: data[0].id }));
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.signUpStudent(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
      <div className="bg-white max-w-lg w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm my-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#2F8F46] text-white font-bold text-xl rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            IT
          </div>
          <h1 className="text-2xl font-bold text-[#18201B] tracking-tight">Student Registration</h1>
          <p className="text-xs text-[#66706A] mt-1">
            Create an InterTrack student profile linked to your academic department
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-[#EAF4EC] border border-[#2F8F46] rounded-xl flex items-center gap-3 text-[#1F6B32] text-xs font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#18201B] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@student.edu"
                className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="2024-CSE-042"
                className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Department *
              </label>
              <div className="relative">
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] font-medium focus:ring-2 focus:ring-[#2F8F46] focus:bg-white outline-none appearance-none transition-all cursor-pointer pr-10"
                  required
                >
                  {departments.length === 0 && (
                    <option value="" disabled>Select Department</option>
                  )}
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="text-[#18201B] bg-white py-1">
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#66706A]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">Semester</label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">CGPA</label>
              <input
                type="text"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="8.5"
                className="w-full px-3 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Create Student Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#66706A]">
          Already registered?{' '}
          <Link to={ROUTES.LOGIN} className="text-[#2F8F46] font-bold hover:text-[#1F6B32]">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
