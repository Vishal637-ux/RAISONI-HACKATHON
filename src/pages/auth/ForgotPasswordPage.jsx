import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../layouts/AuthLayout';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { forgotPasswordSchema } from '../../utils/validation/forgotPasswordSchema';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.sendPasswordResetEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email.');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset link"
    >
      <Card>
        {isSubmitted ? (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-[#22C55E] flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-lg font-bold text-[#171717]">Reset Link Sent</h2>
            <p className="text-sm text-[#6B7280]">
              We have sent a password reset email. Please check your inbox and follow the link.
            </p>
            <Link to={ROUTES.LOGIN} className="w-full mt-2">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
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

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>

            <div className="text-center mt-2">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#171717]"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
};
