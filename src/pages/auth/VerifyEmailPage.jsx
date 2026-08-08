import React from 'react';
import { MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';

export const VerifyEmailPage = () => {
  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="Email Verification Sent"
    >
      <Card className="text-center flex flex-col items-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
          <MailCheck size={28} />
        </div>

        <p className="text-sm text-[#6B7280]">
          We have sent a verification email to your registered email address. Please click the link inside to activate your account.
        </p>

        <div className="w-full mt-2">
          <Link to={ROUTES.LOGIN}>
            <Button variant="primary" className="w-full">
              Continue to Login
            </Button>
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
};
