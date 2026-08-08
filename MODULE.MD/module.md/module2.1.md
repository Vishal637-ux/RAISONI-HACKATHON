# MODULE_2_1_STUDENT_DASHBOARD_PART_1

# Module 2.1 – Student Dashboard

**Project:** AI-Powered Internship Management & Verification System

**Phase:** 2 – Student Portal

**Module Type:** Core Student Module

---

# 1. Module Overview

## Purpose

Provide students with a centralized dashboard immediately after successful authentication. The dashboard serves as the home page of the Student Portal and provides an overview of internship progress, attendance, pending tasks, notifications, and quick access to all student features.

## Objectives

- Display student overview
- Display internship status
- Display attendance summary
- Display pending tasks
- Display recent notifications
- Provide quick navigation
- Display profile summary

## Scope

- Student Dashboard
- Dashboard Statistics
- Quick Actions
- Internship Summary
- Attendance Summary
- Task Summary
- Notifications Preview

---

# 2. User Roles

## Student

### Permissions

- View dashboard
- View personal statistics
- View internship summary
- View notifications
- Navigate to other student pages

### Restrictions

- Cannot modify dashboard statistics
- Cannot view another student's dashboard

---

# 3. Pages / Screens

## Student Dashboard

**Route**

`/student/dashboard`

**Purpose**

Landing page after successful student login.

---

# 4. Screen Details

## Dashboard Cards

- Profile Completion
- Internship Status
- Attendance Percentage
- Pending Tasks
- Notifications

---

## Welcome Card

### Displays

- Profile Photo
- Student Name
- Roll Number
- Department
- Academic Year
- Semester
- Welcome Message

### Tables Used

- users
- student_profiles

---

## Internship Summary

### Displays

- Internship Title
- Company Name
- Internship Status
- Faculty Mentor
- Company Mentor
- Start Date
- End Date

### Tables Used

- internships
- companies
- faculty_mentors
- company_mentors

---

## Attendance Summary

### Displays

- Total Working Days
- Present Days
- Absent Days
- Attendance Percentage

### Table Used

- attendance

---

## Pending Tasks

### Displays

- Pending Tasks
- Completed Tasks
- Upcoming Due Date

### Table Used

- tasks

---

## Notifications Preview

### Displays

- Latest Notifications
- Total Notifications
- Unread Notifications

### Table Used

- notifications

---

## Quick Actions

- View Profile
- Internship
- Attendance
- Work Logs
- Tasks
- Feedback
- Certificate

---

# 5. React Components

## Page Components

- StudentDashboardPage

## Layout Components

- StudentLayout
- Sidebar
- Header

## Dashboard Components

- WelcomeCard
- DashboardStatsCard
- InternshipSummaryCard
- AttendanceSummaryCard
- PendingTasksCard
- NotificationCard
- NotificationList
- QuickActionsCard
- QuickActionButton
- SectionTitle

## Common Components

- Card
- Button
- Badge
- Avatar
- LoadingSpinner
- EmptyState

---

# 6. Database

## Tables Used

### users

- id
- full_name
- email

### student_profiles

- department
- year
- semester

### internships

- internship_title
- company_id
- status
- start_date
- end_date

### companies

- company_name

### faculty_mentors

- id
- designation

### company_mentors

- id
- designation

### attendance

- internship_id
- attendance_date
- status

### tasks

- id
- internship_id
- title
- due_date

### notifications

- id
- user_id
- title
- message
- is_read
- created_at

---

# 7. Database Relationships

```text
users
   │
student_profiles

users
   │
notifications

student_profiles
   │
internships
   │
companies
   │
faculty_mentors
   │
company_mentors

internships
   ├── attendance
   ├── tasks
   └── work_logs
```

---

# 8. Supabase Storage

## Storage Used

- Student Profile Photos
- Student Resumes

**Note**

Dashboard only previews uploaded files.

No upload functionality is provided in this module.

---

# 9. Sidebar Navigation

- Dashboard
- My Profile
- Internship
- Attendance
- Work Logs
- Tasks
- Feedback
- Certificate
- Logout

---

# 10. Module Boundary

This module is read-only.

Students can only view dashboard summaries.

All editing actions are implemented in their respective modules.

This module does not perform create, update, or delete operations.

---

# End of Module 2.1 – Part 1
