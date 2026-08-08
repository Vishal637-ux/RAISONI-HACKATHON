import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-[#E9DDFE] rounded-xl shadow-sm p-6 sm:p-8 transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
};
