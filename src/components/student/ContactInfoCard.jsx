import React from 'react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Mail, Phone } from 'lucide-react';

export const ContactInfoCard = ({ register, errors, isEditing, profile, onEdit }) => {
  return (
    <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out h-full flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Section Header */}
        <div className="border-b border-[#E9DDFE] pb-4 mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
              <Mail size={20} className="text-[#A874F7]" />
              Contact Information
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Your primary email and active phone number for notifications</p>
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

        {/* Read-Only Info Fields / Editable Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email Address - Clean Read-Only Info Field without input box styling */}
          <div>
            <span className="text-xs font-medium text-[#6B7280] block mb-1">Email Address</span>
            {profile?.email ? (
              <span className="text-sm font-semibold text-[#171717] flex items-center gap-2 truncate">
                <Mail size={15} className="text-[#A874F7] shrink-0" />
                <span className="truncate">{profile.email}</span>
              </span>
            ) : (
              <span className="text-sm font-normal text-[#9CA3AF] block">
                Not Available
              </span>
            )}
          </div>

          {/* Phone Number */}
          {isEditing ? (
            <Input
              label="Phone Number"
              icon={Phone}
              required
              placeholder="Enter 10-digit mobile number"
              error={errors.phone?.message}
              {...register('phone')}
            />
          ) : (
            <div>
              <span className="text-xs font-medium text-[#6B7280] block mb-1">Phone Number</span>
              {profile?.phone ? (
                <span className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                  <Phone size={15} className="text-[#A874F7] shrink-0" />
                  {profile.phone}
                </span>
              ) : (
                <span className="text-sm font-normal text-[#9CA3AF] block">
                  Not Added Yet
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
