import React from 'react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';
import { User, CreditCard, ShieldCheck } from 'lucide-react';

export const PersonalInfoCard = ({ register, errors, isEditing, profile, onPhotoUploaded, onPhotoRemoved, onEdit }) => {
  return (
    <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out h-full flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
              <User size={20} className="text-[#A874F7]" />
              Personal Information
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your basic personal details and profile avatar</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {!isEditing && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-xs font-semibold text-[#A874F7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Edit
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck size={13} />
              Status: {profile?.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Profile Avatar & Details Section - Vertically Centered */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center">
            <ProfilePhotoUploader
              currentPhotoUrl={profile?.profilePhotoUrl}
              onPhotoUploaded={onPhotoUploaded}
              onPhotoRemoved={onPhotoRemoved}
              isEditing={isEditing}
            />
          </div>

          {/* Form Fields or Read-only Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {isEditing ? (
              <>
                <Input
                  label="Full Name"
                  icon={User}
                  required
                  placeholder="Enter full name"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  label="Roll Number / Student ID"
                  icon={CreditCard}
                  required
                  placeholder="Enter roll number"
                  error={errors.rollNumber?.message}
                  {...register('rollNumber')}
                />
              </>
            ) : (
              <>
                <div>
                  <span className="text-xs font-medium text-[#6B7280] block mb-1">Full Name</span>
                  {profile?.fullName ? (
                    <span className="text-sm font-semibold text-[#171717] block">
                      {profile.fullName}
                    </span>
                  ) : (
                    <span className="text-sm font-normal text-[#9CA3AF] block">
                      Not Added Yet
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium text-[#6B7280] block mb-1">Roll Number / Student ID</span>
                  {profile?.rollNumber ? (
                    <span className="text-sm font-semibold text-[#171717] block">
                      {profile.rollNumber}
                    </span>
                  ) : (
                    <span className="text-sm font-normal text-[#9CA3AF] block">
                      Not Added Yet
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
