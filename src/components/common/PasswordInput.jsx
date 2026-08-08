import React, { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef(({
  label,
  error,
  placeholder = '••••••••',
  className = '',
  required = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#171717]">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-[#6B7280] pointer-events-none">
          <Lock size={18} />
        </div>
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all duration-200 placeholder:text-[#6B7280] ${
            error ? 'border-[#EF4444] focus:ring-[#EF4444]' : ''
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3.5 text-[#6B7280] hover:text-[#171717] focus:outline-none transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-[#EF4444] font-medium mt-0.5">{error}</p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
