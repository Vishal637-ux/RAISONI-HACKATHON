import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../layouts/AuthLayout';
import { Card } from '../../components/common/Card';
import { PasswordInput } from '../../components/common/PasswordInput';
import { Button } from '../../components/common/Button';
import { resetPasswordSchema } from '../../utils/validation/resetPasswordSchema';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';

export const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.updateUserPassword(data.password);
      toast.success('Password updated successfully! Please login with your new password.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error(error.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter a new password for your account"
    >
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <PasswordInput
            label="New Password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="••••••••"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Update Password
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
};
