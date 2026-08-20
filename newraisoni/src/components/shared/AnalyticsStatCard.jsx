import React from 'react';

export const AnalyticsStatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'bg-[#EAF4EC] text-[#1F6B32] border-[#C5E3CC]',
    amber: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
    blue: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
    purple: 'bg-[#F3E8FF] text-[#9333EA] border-[#E9D5FF]',
  };

  const activeColor = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-[#66706A] block">{title}</span>
        <p className="text-2xl font-black text-[#18201B] mt-1.5">{value}</p>
        {subtitle && (
          <p className="text-xs font-medium text-[#2F8F46] mt-1">{subtitle}</p>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl border ${activeColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};
