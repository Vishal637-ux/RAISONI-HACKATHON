import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No Data Available',
  description = 'There are no items to display at this time.',
  icon: Icon = Inbox,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center border border-dashed border-[#E9DDFE] rounded-xl bg-[#F3EDFF]/30 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center mb-3">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-semibold text-[#171717]">{title}</h4>
      <p className="text-xs text-[#6B7280] max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
