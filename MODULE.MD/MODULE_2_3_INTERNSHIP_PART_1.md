# MODULE_2_3_INTERNSHIP_PART_1

# Module 2.3 – Internship

**Project:** AI-Powered Internship Management & Verification System

**Phase:** 2 – Student Portal

**Module Type:** Core Student Module

---

# 1. Module Overview

## Purpose

Allow authenticated students to view their assigned internship details, track internship status, view assigned faculty and company mentors, and monitor internship timelines throughout the internship lifecycle.

## Objectives

- View assigned internship details (`internship_title`, `start_date`, `end_date`, `status`)
- Track internship status (`Applied`, `Approved`, `Ongoing`, `Completed`, `Rejected`)
- View assigned company information (`company_name`, `industry`, `address`, `website`, `hr_email`, `contact_number`)
- View assigned faculty mentor and company mentor details
- Track submitted internship application status

## Scope

- Active Internship Details
- Internship Status Tracking
- Internship Applications Overview
- Assigned Mentor & Company Overview

---

# 2. User Roles

## Student

### Permissions

- View assigned internship details
- Track current internship status
- View submitted internship application details
- View assigned faculty mentor and company mentor information

### Restrictions

- Cannot alter internship status
- Cannot assign or modify faculty mentors or company mentors
- Cannot create, modify, or delete company records
- Cannot access another student's internship records or applications

---

# 3. Pages / Screens

## Student Internship Page

**Route**

`/student/internship`

**Purpose**

View assigned internship details, track internship status, view assigned mentors, and monitor application records.

---

# 4. Screen Details

## Active Internship Card

### Displays

- Internship Title
- Company Name
- Industry
- Faculty Mentor Name
- Company Mentor Name
- Start Date
- End Date
- Internship Status (`Applied`, `Approved`, `Ongoing`, `Completed`, `Rejected`)

### Tables Used

- `internships`
- `companies`
- `faculty_mentors`
- `company_mentors`
- `users`

---

## Internship Application Status

### Displays

- Company Name
- Industry
- Date Applied (`applied_at`)
- Application Status (`Applied`, `Approved`, `Rejected`)

### Tables Used

- `internship_applications`
- `companies`

---

# 5. React Components

## Page Components

- `StudentInternshipPage`

## Layout Components

- `StudentLayout`
- `Sidebar`
- `Header`

## Feature Components

- `ActiveInternshipCard`
- `InternshipApplicationsCard`
- `MentorDetailsCard`

## Common Components

- `Card`
- `Button`
- `Input`
- `Badge`
- `LoadingSpinner`
- `EmptyState`

---

# 6. Database

## Tables Used

### internships

- `id`
- `student_id`
- `company_id`
- `faculty_id`
- `company_mentor_id`
- `internship_title`
- `start_date`
- `end_date`
- `status`

### internship_applications

- `id`
- `student_id`
- `company_id`
- `applied_at`
- `status`

### companies

- `id`
- `company_name`
- `industry`
- `address`
- `website`
- `hr_email`
- `contact_number`

### faculty_mentors

- `id`
- `user_id`
- `department`
- `designation`

### company_mentors

- `id`
- `company_id`
- `user_id`
- `designation`

### users

- `id`
- `full_name`
- `email`
- `role`
- `phone`
- `status`
- `created_at`
- `updated_at`

---

# 7. Database Relationships

```text
users.id
  │
  ├────────► internship_applications.student_id
  │
  └────────► internships.student_id

companies.id
  │
  ├────────► internship_applications.company_id
  │
  └────────► internships.company_id

faculty_mentors.id ──────► internships.faculty_id

company_mentors.id ──────► internships.company_mentor_id
```

---

# 8. Supabase Storage

Not applicable for this module.

---

# 9. Validation

- Enforce authenticated student access restriction via protected route guards.
- Verify ownership to ensure students can access only their own assigned internship data (`student_id === authenticatedUser.id`).

---

# 10. Module Boundary

This module manages only student internship information and status tracking.

Students cannot approve, reject, assign, or modify internship status. Those actions belong to authorized roles in other modules.

This module does NOT manage:

- Attendance submission (Module 2.4)
- Work logs (Module 2.5)
- Tasks (Module 2.6)
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

# End of Module 2.3 – Part 1
