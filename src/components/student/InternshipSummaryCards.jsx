import React from 'react';
import { Card } from '../common/Card';
import { Briefcase, FileSpreadsheet, Activity, UserCheck } from 'lucide-react';

export const InternshipSummaryCards = ({ activeInternship, applications = [] }) => {
  const activeTitle = activeInternship?.companyName || activeInternship?.title || 'None';
  const applicationsCount = applications.length;
  const currentStatus = activeInternship?.status || (applicationsCount > 0 ? 'Application Pending' : 'None');

  const facultyAssigned = activeInternship?.facultyMentor?.name && activeInternship.facultyMentor.name !== 'Not assigned';
  const companyAssigned = activeInternship?.companyMentor?.name && activeInternship.companyMentor.name !== 'Not assigned';

  let mentorsText = 'Not Assigned Yet';
  if (facultyAssigned && companyAssigned) mentorsText = 'Faculty & Company';
  else if (facultyAssigned) mentorsText = 'Faculty Mentor Only';
  else if (companyAssigned) mentorsText = 'Company Mentor Only';

  const metrics = [
    {
      label: 'Active Internship',
      value: activeTitle,
      icon: Briefcase,
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      iconColor: 'text-[#A874F7]',
      isText: true,
    },
    {
      label: 'Applications Submitted',
      value: applicationsCount,
      icon: FileSpreadsheet,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Current Status',
      value: currentStatus,
      icon: Activity,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      iconColor: 'text-emerald-600',
      isText: true,
    },
    {
      label: 'Assigned Mentors',
      value: mentorsText,
      icon: UserCheck,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      iconColor: 'text-amber-600',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.label} className={`${m.bg} border ${m.border} p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 rounded-2xl`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{m.label}</span>
              <div className="p-2 rounded-xl bg-white/80 shadow-2xs">
                <Icon size={18} className={m.iconColor} />
              </div>
            </div>
            <div>
              <p className={`font-extrabold text-[#171717] truncate ${m.isText ? 'text-base' : 'text-2xl'}`}>
                {m.value}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
