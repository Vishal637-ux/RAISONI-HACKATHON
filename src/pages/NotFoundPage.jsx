import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ROUTES } from '../constants/routes';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-auth-gradient flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
          <HelpCircle size={28} />
        </div>
        <h1 className="text-xl font-bold text-[#171717]">404 - Page Not Found</h1>
        <p className="text-sm text-[#6B7280]">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="w-full mt-2">
          <Link to={ROUTES.LOGIN}>
            <Button variant="primary" className="w-full">
              Go to Home / Login
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
