import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm text-center">
        <div className="w-16 h-16 bg-[#EAF4EC] text-[#2F8F46] rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#18201B]">404 — Page Not Found</h1>
        <p className="text-sm text-[#66706A] mt-2 leading-relaxed">
          The page you requested could not be found. Please check the web address or return to the main entry page.
        </p>

        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
