import React from 'react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { GraduationCap, Award, BookOpen, Wrench, Info } from 'lucide-react';

export const AcademicInfoCard = ({ register, errors, isEditing, profile, onEdit }) => {
  return (
    <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out h-full flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        {/* Section Header */}
        <div className="border-b border-[#E9DDFE] pb-4 mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
              <GraduationCap size={20} className="text-[#A874F7]" />
              Academic Information & Skills
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Keep your branch, current academic year, CGPA, and technical skills updated</p>
          </div>
          {!isEditing && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-xs font-semibold text-[#A874F7] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>

        {/* 4 Equal Column Grid for Academic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Department */}
          {isEditing ? (
            <Input
              label="Department"
              icon={BookOpen}
              required
              placeholder="e.g. Computer Science"
              error={errors.department?.message}
              {...register('department')}
            />
          ) : (
            <div>
              <span className="text-xs font-medium text-[#6B7280] block mb-1">Department</span>
              {profile?.department ? (
                <span className="text-sm font-semibold text-[#171717] block">
                  {profile.department}
                </span>
              ) : (
                <span className="text-sm font-normal text-[#9CA3AF] block">
                  Not Added Yet
                </span>
              )}
            </div>
          )}

          {/* Academic Year */}
          {isEditing ? (
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#171717]">
                Academic Year <span className="text-[#EF4444]">*</span>
              </label>
              <select
                className="w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                {...register('year')}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {errors.year?.message && (
                <p className="text-xs text-[#EF4444] font-medium">{errors.year?.message}</p>
              )}
            </div>
          ) : (
            <div>
              <span className="text-xs font-medium text-[#6B7280] block mb-1">Academic Year</span>
              {profile?.year ? (
                <span className="text-sm font-semibold text-[#171717] block">
                  Year {profile.year}
                </span>
              ) : (
                <span className="text-sm font-normal text-[#9CA3AF] block">
                  Not Added Yet
                </span>
              )}
            </div>
          )}

          {/* Semester */}
          {isEditing ? (
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#171717]">
                Semester <span className="text-[#EF4444]">*</span>
              </label>
              <select
                className="w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                {...register('semester')}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              {errors.semester?.message && (
                <p className="text-xs text-[#EF4444] font-medium">{errors.semester?.message}</p>
              )}
            </div>
          ) : (
            <div>
              <span className="text-xs font-medium text-[#6B7280] block mb-1">Semester</span>
              {profile?.semester ? (
                <span className="text-sm font-semibold text-[#171717] block">
                  Semester {profile.semester}
                </span>
              ) : (
                <span className="text-sm font-normal text-[#9CA3AF] block">
                  Not Added Yet
                </span>
              )}
            </div>
          )}

          {/* CGPA */}
          {isEditing ? (
            <Input
              label="Current CGPA"
              icon={Award}
              required
              placeholder="e.g. 8.75"
              error={errors.cgpa?.message}
              {...register('cgpa')}
            />
          ) : (
            <div>
              <span className="text-xs font-medium text-[#6B7280] block mb-1">CGPA</span>
              {profile?.cgpa ? (
                <span className="text-sm font-semibold text-[#A874F7] block">
                  {profile.cgpa}
                </span>
              ) : (
                <span className="text-sm font-normal text-[#9CA3AF] block">
                  Not Added Yet
                </span>
              )}
            </div>
          )}
        </div>

        {/* Technical Skills Section with Improved Spacing */}
        <div className="pt-4 border-t border-[#E9DDFE]">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                label="Skills (Comma Separated)"
                icon={Wrench}
                placeholder="e.g. React, Python, Node.js, SQL"
                error={errors.skills?.message}
                {...register('skills')}
              />
              <p className="text-[11px] text-[#6B7280] flex items-center gap-1.5 mt-1.5">
                <Info size={13} className="text-[#A874F7] shrink-0" />
                Add your technical skills (e.g. React, Python, SQL) to showcase your expertise to mentors and recruiters.
              </p>
            </div>
          ) : (
            <div>
              <span className="text-xs font-medium text-[#6B7280] block mb-2">Technical Skills</span>
              {profile?.skills ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-medium bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] rounded-lg shadow-2xs"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <span className="text-sm font-normal text-[#9CA3AF] block">
                    No Technical Skills Added Yet
                  </span>
                  <p className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                    <Info size={13} className="text-[#A874F7] shrink-0" />
                    Add your technical skills (e.g. React, Python, SQL) to showcase your expertise to mentors and recruiters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
