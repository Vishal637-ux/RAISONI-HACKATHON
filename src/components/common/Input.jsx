import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = '',
  className = '',
  icon: Icon,
  required = false,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#171717]">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#6B7280] pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl py-2.5 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all duration-200 placeholder:text-[#6B7280] ${
            error ? 'border-[#EF4444] focus:ring-[#EF4444]' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-[#EF4444] font-medium mt-0.5">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
