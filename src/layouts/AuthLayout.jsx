import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-auth-gradient flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#A874F7] text-white flex items-center justify-center shadow-md">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-[#171717]">Internship Portal</span>
            <span className="text-xs text-[#6B7280]">Verification System</span>
          </div>
        </div>

        {/* Auth Box Header */}
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && <h1 className="text-2xl font-bold text-[#171717]">{title}</h1>}
            {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
          </div>
        )}

        {/* Children Form */}
        <div className="w-full">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-[#6B7280]">
          &copy; {new Date().getFullYear()} AI-Powered Internship Management System
        </footer>
      </div>
    </div>
  );
};
