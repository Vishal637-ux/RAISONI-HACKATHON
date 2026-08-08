# MODULE_2_4_ATTENDANCE_PART_1

# Module 2.4 – Attendance

**Project:** AI-Powered Internship Management & Verification System

**Phase:** Phase 2 – Student Portal

**Module Type:** Core Student Module

---

# 1. Module Overview

## Purpose

The Attendance Module allows authenticated students with an active internship to submit daily attendance records, view their attendance history, and track verification status updated by their assigned company mentor.

## Attendance Lifecycle

```text
Student Submission
        │
        ▼
Pending Verification
        │
        ▼
Company Mentor Verification
        │
        ▼
Present / Absent / Leave
```

> [!IMPORTANT]
> Students must never be allowed to modify verified attendance.

## Objectives

- Enable students to submit daily attendance (`attendance_date`, `status`).
- Display initial submission status as `Pending Verification`.
- Display final verification status (`Present`, `Absent`, `Leave`) verified by the company mentor.
- Display verification details including remarks (`remarks`) and mentor verifier (`verified_by`).
- Provide an overview of attendance records linked to the student's active internship.
- Render clean `EmptyState` components when no active internship exists or no attendance records have been submitted.

## Scope

- Daily Attendance Submission
- Attendance History & Status Tracking
- Attendance Summary Metrics
- Verification Remarks Display
- EmptyState Handling

---

# 2. User Roles

## Student

### Permissions

- View attendance history for their active internship.
- Submit daily attendance record (`attendance_date`, `status`).
- View attendance status (`Pending Verification`, `Present`, `Absent`, `Leave`).
- View verification remarks provided by the company mentor.

### Restrictions

- Cannot verify or approve own attendance.
- Cannot modify verified attendance records.
- Cannot submit attendance for other students.
- Cannot edit `verified_by` or `remarks` fields.
- Cannot submit attendance without an active internship (`Approved` or `Ongoing` status).

## Company Mentor (Context Boundary)

- Responsible for verifying student attendance records (Handled in Company Mentor Portal - Module 3).

## Faculty Mentor / TPO / HOD / Admin (Context Boundary)

- Read-only access to attendance records and reports (Handled in respective portal modules).

---

# 3. Pages / Screens

## Student Attendance Page

**Route**

`/student/attendance`

**Purpose**

Submit daily attendance, track attendance status, view historical attendance records, and review mentor verification details.

---

# 4. Screen Details

## Attendance Submission Card

### Displays

- Attendance Date Picker (`attendance_date`)
- Status Selection Dropdown (`Present`, `Absent`, `Leave`)
- Submit Attendance Button

### Tables Used

- `attendance`
- `internships`

---

## Attendance Summary Card

### Displays

- Total Days Logged
- Days Present
- Days Absent
- Days On Leave
- Pending Verification Count

### Tables Used

- `attendance`

---

## Attendance History Table

### Displays

- Attendance Date (`attendance_date`)
- Attendance Status via `AttendanceStatusBadge` (`Pending Verification`, `Present`, `Absent`, `Leave`)
- Verified By (`verified_by` - Company Mentor Name)
- Verification Remarks (`remarks`)

### Tables Used

- `attendance`
- `users`

---

## EmptyState Behavior

### Trigger 1: No Active Internship Exists

When a student does not have an internship record with status `Approved` or `Ongoing`:

- Hide the Attendance Submission Card.
- Display `EmptyState` component with message: *"No Active Internship Found. You must have an approved active internship to submit attendance."*

### Trigger 2: No Attendance Records Exist

When a student has an active internship but has not submitted any attendance entries yet:

- Display Attendance Submission Card.
- Display `EmptyState` inside the Attendance History section with message: *"No attendance records logged yet. Use the form above to submit your daily attendance."*

---

# 5. React Components

## Page Components

- `StudentAttendancePage`

## Layout Components

- `StudentLayout`
- `Sidebar`
- `Header`

## Feature Components

- `AttendanceSubmissionCard`
- `AttendanceSummaryCard`
- `AttendanceHistoryTable`
- `AttendanceStatusBadge`

## Common Components

- `Card`
- `Button`
- `Input`
- `Select`
- `Badge`
- `LoadingSpinner`
- `EmptyState`

---

# 6. Database

## Tables Used

### attendance

- `id` (UUID, Primary Key)
- `internship_id` (UUID, Foreign Key → `internships.id`)
- `attendance_date` (DATE)
- `status` (TEXT: `Present`, `Absent`, `Leave`, `Pending Verification`)
- `verified_by` (UUID, Foreign Key → `users.id`)
- `remarks` (TEXT)

### internships

- `id` (UUID, Primary Key)
- `student_id` (UUID, Foreign Key → `users.id`)
- `company_id` (UUID, Foreign Key → `companies.id`)
- `faculty_id` (UUID, Foreign Key → `faculty_mentors.id`)
- `company_mentor_id` (UUID, Foreign Key → `company_mentors.id`)
- `internship_title` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `status` (TEXT: `Applied`, `Approved`, `Ongoing`, `Completed`, `Rejected`)

### users

- `id` (UUID, Primary Key)
- `full_name` (TEXT)
- `email` (TEXT)
- `role` (TEXT)
- `phone` (TEXT)
- `status` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### audit_logs

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → `users.id`)
- `action` (TEXT)
- `module` (TEXT)
- `timestamp` (TIMESTAMP)

---

# 7. Database Relationships

```text
users.id (Student)
  │
  └──► internships.student_id
         │
         └──► attendance.internship_id

users.id (Company Mentor)
  │
  └──► attendance.verified_by
```

---

# 8. Supabase Storage

Not applicable for this module. Attendance data consists entirely of structured database records.

---

# 9. Validation

- Authenticated student access restriction enforced via protected route guards.
- Active internship validation (`internships.status === 'Approved'` or `'Ongoing'`).
- Record ownership verification (`internships.student_id === authenticatedUser.id`).
- Student can submit attendance only once for the same `attendance_date`.
- Form input validation using React Hook Form & Zod for date selection and attendance status choices.

---

# 10. Module Boundary

This module manages student daily attendance submission and viewing of attendance verification status.

Attendance verification is performed only by the Company Mentor module.

Students must never be allowed to modify verified attendance records, mentor remarks, or verifier fields.

This module does NOT manage:

- Internship details & applications (Module 2.3)
- Work logs submission (Module 2.5)
- Task submission & review (Module 2.6)
- Mentor feedback (Module 2.7)
- Certificates (Module 2.8)

---

# 11. Navigation

## Student Navigation

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

# End of Module 2.4 – Part 1
