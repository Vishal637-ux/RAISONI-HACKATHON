import React from 'react';

export const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#F3EDFF]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9DDFE] border-t-[#A874F7]"></div>
        <p className="text-sm font-medium text-[#6B7280]">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#E9DDFE] border-t-[#A874F7]"></div>
      <p className="text-xs font-medium text-[#6B7280]">{text}</p>
    </div>
  );
};
