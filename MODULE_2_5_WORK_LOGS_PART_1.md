# MODULE_2_5_WORK_LOGS_PART_1

# Module 2.5 – Work Logs

**Project:** AI-Powered Internship Management & Verification System

**Phase:** Phase 2 – Student Portal

**Module Type:** Core Student Module

---

# 1. Module Overview

## Purpose

The Work Logs Module allows authenticated students with an active internship to submit daily and weekly work logs describing their completed internship tasks, progress, and activities, and to view their history of submitted work logs.

## Objectives

- Enable students to submit daily/weekly work logs with a detailed description (`description`).
- Automatically attach submission timestamps (`submitted_at`).
- Provide an overview of all work log entries linked to the student's active internship.
- Render clean `EmptyState` components when no active internship exists or no work logs have been submitted.

## Scope

- Work Log Submission (`description`, `submitted_at`)
- Work Log History & Overview
- EmptyState Handling

---

# 2. User Roles

## Student

### Permissions

- View submitted work log history for their active internship.
- Submit work log entries (`description`).

### Restrictions

- Cannot submit work logs without an active internship (`Approved` or `Ongoing` status).
- Cannot submit work logs for other students.
- Cannot modify or delete previously submitted work logs once created.

## Faculty Mentor / Company Mentor (Context Boundary)

- Review student work logs (Handled in Faculty Mentor and Company Mentor Portals).

## TPO / HOD / Admin (Context Boundary)

- Read-only access to work log records (Handled in respective portal modules).

---

# 3. Pages / Screens

## Student Work Logs Page

**Route**

`/student/work-logs`

**Purpose**

Submit daily/weekly work logs and view historical work log submissions.

---

# 4. Screen Details

## Work Log Submission Card

### Displays

- Work Log Description Textarea (`description`)
- Submit Work Log Button

### Tables Used

- `work_logs`
- `internships`

---

## Work Log History List

### Displays

- Submission Timestamp (`submitted_at`)
- Work Log Description (`description`)

### Tables Used

- `work_logs`

---

## EmptyState Behavior

### Trigger 1: No Active Internship Exists

When a student does not have an internship record with status `Approved` or `Ongoing`:

- Hide the Work Log Submission Card.
- Display `EmptyState` component with message: *"No Active Internship Found. You must have an approved active internship to submit work logs."*

### Trigger 2: No Work Logs Exist

When a student has an active internship but has not submitted any work log entries yet:

- Display Work Log Submission Card.
- Display `EmptyState` inside the Work Log History section with message: *"No work logs submitted yet. Use the form above to submit your daily or weekly work log."*

---

# 5. React Components

## Page Components

- `StudentWorkLogsPage`

## Layout Components

- `StudentLayout`
- `Sidebar`
- `Header`

## Feature Components

- `WorkLogSubmissionCard`
- `WorkLogHistoryList`

## Common Components

- `Card`
- `Button`
- `Input`
- `Loader`
- `EmptyState`

---

# 6. Database

## Tables Used

### work_logs

- `id` (UUID, Primary Key)
- `internship_id` (UUID, Foreign Key → `internships.id`)
- `description` (TEXT)
- `submitted_at` (TIMESTAMP)

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
         └──► work_logs.internship_id
```

---

# 8. Supabase Storage

Not applicable for this module. Work log data consists entirely of structured database records (`description`, `submitted_at`).

---

# 9. Validation

- Authenticated student access restriction enforced via protected route guards.
- Active internship validation (`internships.status === 'Approved'` or `'Ongoing'`).
- Record ownership verification (`internships.student_id === authenticatedUser.id`).
- Form input validation using React Hook Form & Zod for `description` field.

---

# 10. Module Boundary

This module manages student daily/weekly work log submissions and viewing of historical work log entries.

This module does NOT manage:

- Internship details & applications (Module 2.3)
- Daily attendance submission & verification (Module 2.4)
- Task assignment & submission (Module 2.6)
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

# End of Module 2.5 – Part 1
