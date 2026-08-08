import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../utils/validation/profileSchema';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../hooks/useAuth';
import { ProfileCompletionCard } from '../../components/student/ProfileCompletionCard';
import { PersonalInfoCard } from '../../components/student/PersonalInfoCard';
import { ContactInfoCard } from '../../components/student/ContactInfoCard';
import { AcademicInfoCard } from '../../components/student/AcademicInfoCard';
import { ResumeCard } from '../../components/student/ResumeCard';
import { ProfilePhotoUploader } from '../../components/student/ProfilePhotoUploader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  UserCheck,
  Edit3,
  X,
  Save,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Globe,
  Linkedin,
  Github,
  FileCheck,
  Award,
  CreditCard,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
  });

  const loadProfile = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await profileService.fetchStudentProfile(user.id);
      setProfile(data);
      reset({
        fullName: data?.fullName || '',
        phone: data?.phone || '',
        rollNumber: data?.rollNumber || '',
        department: data?.department || '',
        year: data?.year || '',
        semester: data?.semester || '',
        cgpa: data?.cgpa || '',
        skills: data?.skills || '',
        linkedinUrl: data?.linkedinUrl || '',
        githubUrl: data?.githubUrl || '',
      });
      // Enable edit mode by default if essential fields are incomplete so inputs are active
      if (!data?.fullName || !data?.rollNumber || !data?.phone || !data?.department) {
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setFetchError('Unable to load profile information. Please try again.');
      toast.error('Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const onSaveProfile = async (formData) => {
    if (!user?.id) return;
    try {
      setIsSaving(true);
      await profileService.updateStudentProfile(user.id, formData);
      toast.success('Profile updated successfully.');

      // Refresh local profile state
      const updatedData = await profileService.fetchStudentProfile(user.id);
      setProfile(updatedData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        rollNumber: profile.rollNumber || '',
        department: profile.department || '',
        year: profile.year || '',
        semester: profile.semester || '',
        cgpa: profile.cgpa || '',
        skills: profile.skills || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
      });
    }
    setIsEditing(false);
  };

  const handlePhotoUploaded = async (file) => {
    if (!user?.id) return;
    try {
      const newPhotoUrl = await profileService.uploadProfilePhoto(user.id, file);
      setProfile((prev) => (prev ? { ...prev, profilePhotoUrl: newPhotoUrl } : prev));
      toast.success('Profile photo updated successfully.');
    } catch {
      toast.error('Failed to upload profile photo.');
    }
  };

  const handlePhotoRemoved = async () => {
    if (!user?.id) return;
    try {
      await profileService.removeProfilePhoto(user.id);
      setProfile((prev) => (prev ? { ...prev, profilePhotoUrl: null } : prev));
      toast.success('Profile photo removed.');
    } catch {
      // Ignore
    }
  };

  const handleResumeUploaded = async (file) => {
    if (!user?.id) return;
    try {
      const { resumeUrl } = await profileService.uploadResume(user.id, file);
      setProfile((prev) => (prev ? { ...prev, resumeUrl } : prev));
      toast.success('Resume uploaded successfully.');
    } catch {
      toast.error('Failed to upload resume.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6 animate-pulse">
        <div className="h-48 bg-[#F3EDFF]/60 rounded-3xl border border-[#E9DDFE]" />
        <div className="h-28 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
          <div className="h-64 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-lg font-bold text-[#171717]">{fetchError}</h3>
        <Button onClick={loadProfile} variant="primary" className="mt-4">
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* 1. Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#A874F7] p-6 sm:p-8 text-white shadow-xl">
        {/* Background Accents */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-purple-900/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Key Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <ProfilePhotoUploader
              currentPhotoUrl={profile?.profilePhotoUrl}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoRemoved={handlePhotoRemoved}
              isEditing={isEditing}
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-purple-100 border border-white/25">
                  <UserCheck size={13} />
                  Verified Student
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 backdrop-blur-md text-[11px] font-semibold border border-emerald-400/30">
                  <ShieldCheck size={13} />
                  Status: {profile?.status || 'Active'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile?.fullName || 'Student Name'}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-purple-100/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-purple-200" />
                  {profile?.department || 'Select Department'}
                </span>
                <span>•</span>
                <span>Roll: {profile?.rollNumber || 'Not Added'}</span>
                {profile?.year && (
                  <>
                    <span>•</span>
                    <span>Year {profile.year}, Sem {profile.semester || 1}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Save Changes & Cancel when editing, Edit Profile otherwise */}
          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:scale-[1.02] transition-all"
                >
                  <X size={14} />
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={handleSubmit(onSaveProfile)}
                  className="bg-white text-[#5B21B6] hover:bg-purple-50 font-bold border-none hover:scale-[1.02] transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-white text-[#5B21B6] hover:bg-purple-50 font-bold border-none hover:scale-[1.02] transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Profile Completion Card */}
      <ProfileCompletionCard profile={profile} />

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-6">
        {/* Row 1: Personal Information & Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="h-full">
            <PersonalInfoCard
              register={register}
              errors={errors}
              isEditing={isEditing}
              profile={profile}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoRemoved={handlePhotoRemoved}
              onEdit={() => setIsEditing(true)}
            />
          </div>

          <div className="h-full">
            <ContactInfoCard
              register={register}
              errors={errors}
              isEditing={isEditing}
              profile={profile}
              onEdit={() => setIsEditing(true)}
            />
          </div>
        </div>

        {/* Row 2: Academic Information & Resume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="h-full">
            <AcademicInfoCard
              register={register}
              errors={errors}
              isEditing={isEditing}
              profile={profile}
              onEdit={() => setIsEditing(true)}
            />
          </div>

          <div className="h-full">
            <ResumeCard
              resumeUrl={profile?.resumeUrl}
              onResumeUploaded={handleResumeUploaded}
            />
          </div>
        </div>

        {/* Row 3: Social & Professional Links + Document Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Social & Professional Links */}
          <Card className="p-6 border border-[#E9DDFE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDFE]">
              <h3 className="text-base font-bold text-[#171717] flex items-center gap-2">
                <Globe size={18} className="text-[#A874F7]" />
                <span>Professional Handles & Social Links</span>
              </h3>
              <span className="text-[10px] font-bold text-[#A874F7] bg-purple-50 px-2 py-0.5 rounded-full">
                Public Portfolio
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* LinkedIn Profile */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Linkedin size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#171717] block">LinkedIn Profile</span>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-white border border-[#E9DDFE] text-xs rounded-lg px-2.5 py-1 mt-1 text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#A874F7]"
                        {...register('linkedinUrl')}
                      />
                    ) : (
                      <span className="text-[11px] text-[#6B7280] truncate block">
                        {profile?.linkedinUrl || 'Not linked yet'}
                      </span>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  profile?.linkedinUrl ? (
                    <a
                      href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 border border-sky-200"
                    >
                      View <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded shrink-0">
                      Not Linked
                    </span>
                  )
                )}
              </div>

              {/* GitHub Portfolio */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <Github size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#171717] block">GitHub Portfolio</span>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="https://github.com/username"
                        className="w-full bg-white border border-[#E9DDFE] text-xs rounded-lg px-2.5 py-1 mt-1 text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#A874F7]"
                        {...register('githubUrl')}
                      />
                    ) : (
                      <span className="text-[11px] text-[#6B7280] truncate block">
                        {profile?.githubUrl || 'Not linked yet'}
                      </span>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  profile?.githubUrl ? (
                    <a
                      href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 border border-slate-300"
                    >
                      View <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded shrink-0">
                      Not Linked
                    </span>
                  )
                )}
              </div>
            </div>
          </Card>

          {/* Student Academic Credentials & Documents */}
          <Card className="p-6 border border-[#E9DDFE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDFE]">
              <h3 className="text-base font-bold text-[#171717] flex items-center gap-2">
                <FileCheck size={18} className="text-[#A874F7]" />
                <span>Verified Credentials & Documents</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Official
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50 space-y-1">
                <div className="flex items-center gap-2 text-[#5B21B6] font-bold">
                  <CreditCard size={16} />
                  <span>College ID</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Verified Student ID</p>
                <span className="text-[10px] font-bold text-purple-700">
                  {profile?.rollNumber || 'Not Added'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Award size={16} />
                  <span>Transcript</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  CGPA: {profile?.cgpa || 'Not Added'}
                </p>
                <span className={`text-[10px] font-bold ${profile?.cgpa ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {profile?.cgpa ? 'Verified' : 'Pending CGPA'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sticky/Floating Bottom Actions Bar when Editing */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-white border border-[#E9DDFE] shadow-lg flex items-center justify-between gap-4 sticky bottom-4 z-20">
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <Sparkles size={16} className="text-[#A874F7]" />
              <span>Editing Student Profile Details – Make sure to save your changes.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-1.5"
              >
                <X size={14} />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                className="flex items-center gap-1.5 shadow-sm"
              >
                <Save size={14} />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
