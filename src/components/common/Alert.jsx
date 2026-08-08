import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const variantStyles = {
  info: 'bg-[#F3EDFF] text-[#7C3AED] border-[#E9DDFE]',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
};

export const Alert = ({ type = 'info', title, children, className = '' }) => {
  const Icon = icons[type] || Info;

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed ${variantStyles[type]} ${className}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        {title && <span className="font-semibold">{title}</span>}
        <div>{children}</div>
      </div>
    </div>
  );
};
