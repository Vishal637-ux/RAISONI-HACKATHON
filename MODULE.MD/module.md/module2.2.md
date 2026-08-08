MODULE_2_2_MY_PROFILE_PART_1_FINAL

Module 2.2 – My Profile

Project: AI-Powered Internship Management & Verification System

Phase: 2 – Student Portal

Module Type: Core Student Module

1. Module Overview

Purpose

Allow students to view and manage their personal, academic, and professional profile information while keeping their profile up to date throughout the internship lifecycle.

Objectives

View profile information

Update profile information

Upload resume

Upload profile photo (only if supported by the database schema)

View profile completion status

Maintain accurate student information

Scope

View Profile

Edit Profile

Personal Information

Contact Information

Academic Information

Resume

Profile Completion Indicator

Profile Preview

2. User Roles

Student

Permissions

View own profile

Edit own profile

Upload resume

Upload profile photo (if supported)

Restrictions

Cannot access another student's profile

Cannot edit another student's profile

3. Pages / Screens

My Profile

Route

/student/profile

Purpose

View and update the authenticated student's profile.

4. Screen Details

Profile Completion

Displays

Completion Percentage

Completed Fields

Missing Fields

Example

80% Complete

Missing Resume

Missing Profile Photo (if applicable)

Personal Information

Displays

Student Name

Student ID / Roll Number

Account Status

Tables Used

users

student_profiles

Contact Information

Displays

Email

Phone Number

Tables Used

users

Academic Information

Displays

Department

Academic Year

Semester

CGPA

Skills

Tables Used

student_profiles

Resume

Displays

Resume Preview

Resume File Name

Last Updated

Actions

Upload Resume

Replace Resume

Preview Resume

Storage

Student Resumes

Profile Photo

Displays

Current Profile Photo

Actions

Upload Photo

Replace Photo

Remove Photo

Note: Implement only if the Architecture database includes a profile photo column.

Profile Actions

Edit Profile

Save Changes

Cancel Changes

5. React Components

Page Components

StudentProfilePage

Layout Components

StudentLayout

Sidebar

Header

Form Components

PersonalInfoForm

AcademicInfoForm

ResumeUploadForm

ProfilePhotoUploadForm

Profile Components

ProfileHeader

ProfileCompletionCard

ProfileCard

PersonalInfoCard

ContactInfoCard

AcademicInfoCard

SkillsCard

ResumeCard

ProfileInfoSection

ResumeUploader

ProfilePhotoUploader

UploadButton

Common Components

Card

Button

Input

Avatar

LoadingSpinner

EmptyState

6. Database

Tables Used

users

id

full_name

email

phone

status

created_at

updated_at

student_profiles

id

user_id

roll_number

department

year

semester

cgpa

skills

resume_url

7. Database Relationships

users.id
│
└────────► student_profiles.user_id

student_profiles.resume_url
│
└────────► Supabase Storage (Student Resumes)

8. Supabase Storage

Storage Buckets

Student Resumes

Profile Photos (if supported)

Used For

Resume Upload

Resume Preview

Profile Photo Upload (if supported)

9. Validation

Use Zod validation before saving profile updates.

Only authenticated students can update their own profile.

Validate uploaded file type and size.

10. Module Boundary

This module manages only the authenticated student's profile.

It does not manage:

Internship

Attendance

Work Logs

Tasks

Feedback

Certificates

11. Navigation

Student Sidebar

Dashboard

My Profile

Internship

Attendance

Work Logs

Tasks

Feedback

Certificate

Logout

End of Module 2.2 – Part 1 (Final)
