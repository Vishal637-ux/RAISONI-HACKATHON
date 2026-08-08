import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, Hash, BookOpen, Award, Wrench, Linkedin, Github } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../layouts/AuthLayout';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';
import { Button } from '../../components/common/Button';
import { registerSchema } from '../../utils/validation/registerSchema';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';

export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      rollNumber: '',
      department: '',
      year: '',
      semester: '',
      cgpa: '',
      skills: '',
      linkedinUrl: '',
      githubUrl: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.signUpStudent(data);
      toast.success('Registration successful! Please verify your email.');
      navigate(ROUTES.VERIFY_EMAIL);
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Student Registration"
      subtitle="Create an account to manage your internship"
    >
      <Card className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            icon={User}
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="student@college.edu"
              icon={Mail}
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              icon={Phone}
              required
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Roll Number"
              placeholder="CS2024-001"
              icon={Hash}
              required
              error={errors.rollNumber?.message}
              {...register('rollNumber')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#171717]">
                Department <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <select
                  className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all duration-200 ${
                    errors.department ? 'border-[#EF4444]' : ''
                  }`}
                  {...register('department')}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                </select>
              </div>
              {errors.department && (
                <p className="text-xs text-[#EF4444] font-medium">{errors.department.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#171717]">
                Academic Year <span className="text-[#EF4444]">*</span>
              </label>
              <select
                className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all duration-200 ${
                  errors.year ? 'border-[#EF4444]' : ''
                }`}
                {...register('year')}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {errors.year && (
                <p className="text-xs text-[#EF4444] font-medium">{errors.year.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#171717]">
                Semester <span className="text-[#EF4444]">*</span>
              </label>
              <select
                className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all duration-200 ${
                  errors.semester ? 'border-[#EF4444]' : ''
                }`}
                {...register('semester')}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="text-xs text-[#EF4444] font-medium">{errors.semester.message}</p>
              )}
            </div>
          </div>

          {/* Academic Credentials: CGPA & Technical Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current CGPA (Optional)"
              placeholder="e.g. 8.75"
              icon={Award}
              error={errors.cgpa?.message}
              {...register('cgpa')}
            />

            <Input
              label="Technical Skills (Optional)"
              placeholder="e.g. React, Python, SQL"
              icon={Wrench}
              error={errors.skills?.message}
              {...register('skills')}
            />
          </div>

          {/* Social Profiles: LinkedIn & GitHub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="LinkedIn Profile (Optional)"
              placeholder="https://linkedin.com/in/username"
              icon={Linkedin}
              error={errors.linkedinUrl?.message}
              {...register('linkedinUrl')}
            />

            <Input
              label="GitHub Portfolio (Optional)"
              placeholder="https://github.com/username"
              icon={Github}
              error={errors.githubUrl?.message}
              {...register('githubUrl')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="••••••••"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Create Account
          </Button>

          <div className="text-center mt-2 text-xs text-[#6B7280]">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-[#A874F7] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
};
