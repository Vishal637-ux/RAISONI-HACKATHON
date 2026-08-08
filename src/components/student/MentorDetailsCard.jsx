import React from 'react';
import { Card } from '../common/Card';
import { UserCheck, Building, Mail, Award } from 'lucide-react';

export const MentorDetailsCard = ({ facultyMentor, companyMentor }) => {
  const isFacultyAssigned = Boolean(facultyMentor?.name && facultyMentor.name !== 'Not assigned');
  const isCompanyAssigned = Boolean(companyMentor?.name && companyMentor.name !== 'Not assigned');

  return (
    <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white mb-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
      <div className="flex flex-col gap-6">
        {/* Section Header */}
        <div className="border-b border-[#E9DDFE] pb-4 mb-2">
          <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
            <UserCheck size={20} className="text-[#A874F7]" />
            Assigned Mentors
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">Contact details of your designated institutional & industry mentors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Faculty Mentor Card */}
          <div className="p-5 bg-[#F3EDFF]/30 border border-[#E9DDFE] rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A874F7] uppercase tracking-wider">
                <Award size={16} />
                Faculty Mentor
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isFacultyAssigned ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {isFacultyAssigned ? 'Assigned' : 'Not Assigned Yet'}
              </span>
            </div>

            <h4 className="text-base font-bold text-[#171717]">
              {isFacultyAssigned ? facultyMentor.name : 'Not Assigned Yet'}
            </h4>

            <div className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-[#171717]">Department:</span>{' '}
                {isFacultyAssigned ? facultyMentor.department : 'Not Assigned Yet'}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-[#171717]">Designation:</span>{' '}
                {isFacultyAssigned ? facultyMentor.designation : 'Not Assigned Yet'}
              </span>
              {isFacultyAssigned && facultyMentor.email && facultyMentor.email !== 'N/A' ? (
                <span className="flex items-center gap-1.5 text-[#171717] font-medium mt-1">
                  <Mail size={13} className="text-[#A874F7]" />
                  {facultyMentor.email}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#9CA3AF] mt-1">
                  <Mail size={13} className="text-[#9CA3AF]" />
                  Not Assigned Yet
                </span>
              )}
            </div>
          </div>

          {/* Company Mentor Card */}
          <div className="p-5 bg-[#F3EDFF]/30 border border-[#E9DDFE] rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A874F7] uppercase tracking-wider">
                <Building size={16} />
                Company Mentor
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isCompanyAssigned ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {isCompanyAssigned ? 'Assigned' : 'Not Assigned Yet'}
              </span>
            </div>

            <h4 className="text-base font-bold text-[#171717]">
              {isCompanyAssigned ? companyMentor.name : 'Not Assigned Yet'}
            </h4>

            <div className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-[#171717]">Designation:</span>{' '}
                {isCompanyAssigned ? companyMentor.designation : 'Not Assigned Yet'}
              </span>
              {isCompanyAssigned && companyMentor.email && companyMentor.email !== 'N/A' ? (
                <span className="flex items-center gap-1.5 text-[#171717] font-medium mt-1">
                  <Mail size={13} className="text-[#A874F7]" />
                  {companyMentor.email}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#9CA3AF] mt-1">
                  <Mail size={13} className="text-[#9CA3AF]" />
                  Not Assigned Yet
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
