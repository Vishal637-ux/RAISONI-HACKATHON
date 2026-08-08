import React from 'react';

export const Checkbox = ({ label, id, className = '', error, ...props }) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id={checkboxId}
          className={`w-4 h-4 rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7] focus:ring-offset-0 transition-all cursor-pointer ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-xs font-medium text-[#171717] cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  );
};
