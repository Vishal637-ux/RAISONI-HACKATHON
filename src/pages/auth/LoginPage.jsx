import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../layouts/AuthLayout';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';
import { Checkbox } from '../../components/common/Checkbox';
import { Button } from '../../components/common/Button';
import { loginSchema } from '../../utils/validation/loginSchema';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.signIn(data);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <Card className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@college.edu"
            icon={Mail}
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1">
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex items-center justify-between mt-1.5">
              <Checkbox label="Remember Me" />
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs font-medium text-[#A874F7] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In
          </Button>

          <div className="text-center mt-1 text-xs text-[#6B7280]">
            Are you a student looking to register?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-semibold text-[#A874F7] hover:underline"
            >
              Register Here
            </Link>
          </div>
        </form>

        {/* Real World Testing Credentials Guide */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <details className="text-xs text-slate-500 cursor-pointer group">
            <summary className="font-semibold text-slate-600 hover:text-[#A874F7] flex items-center justify-between py-1 select-none">
              <span>🔑 Official Portal Test Logins (Email & Password)</span>
              <span className="text-[10px] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2.5 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">🎓 Student:</span>
                <code className="text-[#A874F7] bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[10px]">student@raisoni.edu</code>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">👨‍🏫 Faculty:</span>
                <code className="text-[#A874F7] bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[10px]">faculty@raisoni.edu</code>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">🏢 Company:</span>
                <code className="text-[#A874F7] bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[10px]">company@raisoni.edu</code>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">💼 TPO Officer:</span>
                <code className="text-[#A874F7] bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[10px]">tpo@raisoni.edu</code>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">🏛️ HOD:</span>
                <code className="text-[#A874F7] bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[10px]">hod@raisoni.edu</code>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-slate-700">🛡️ Admin:</span>
                <code className="text-[#A874F7] bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[10px]">admin@raisoni.edu</code>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 pt-1.5 border-t border-slate-200 text-center">
                Password for test accounts: <strong className="text-slate-700 font-mono">Password123</strong>
              </p>
            </div>
          </details>
        </div>
      </Card>
    </AuthLayout>
  );
};
