# MODULE_2_5_WORK_LOGS_PART_2

# Module 2.5 – Work Logs

**Project:** AI-Powered Internship Management & Verification System

**Phase:** Phase 2 – Student Portal

**Module Type:** Core Student Module

---

# PART 2 – Supabase Operations → Business Rules

---

# 7. Supabase Operations

The Work Logs module performs database read and insert operations on Supabase PostgreSQL.

---

## Database Operations Summary

### Fetch Active Internship ID

**Supabase Client Operation**

- Query `internships` table
- SELECT `id, student_id, status`
- FILTER `.eq('student_id', studentId)`
- FILTER `.in('status', ['Approved', 'Ongoing'])`

---

### Fetch Work Log Records

**Supabase Client Operation**

- Query `work_logs` table
- SELECT `id, internship_id, description, submitted_at`
- FILTER `.eq('internship_id', internshipId)`
- ORDER BY `submitted_at` DESC

---

### Submit Work Log

**Supabase Client Operation**

- INSERT into `work_logs`:
  - `internship_id`: Active Internship ID
  - `description`: Form Text Input
  - `submitted_at`: Current Timestamp (`new Date().toISOString()`)

---

### Create Audit Log Entry

**Supabase Client Operation**

- INSERT into `audit_logs`:
  - `user_id`: Authenticated User ID
  - `action`: `'Work Log Submitted'`
  - `module`: `'Work Logs'`
  - `timestamp`: Current Timestamp

---

# 8. Validation Rules

All form validation must be implemented using **React Hook Form** and **Zod**.

---

## Work Log Submission Validation

### Description

- Required field.
- Must be a non-empty string describing daily/weekly activities.
- Minimum length: 10 characters.

---

# 9. Business Rules

The following business rules are derived strictly from PRD.md and ARCHITECTURE.md:

---

## Work Log Submission Rules

- Only authenticated students with an active internship (`Approved` or `Ongoing`) can submit work logs.
- Work logs are recorded with `description` and `submitted_at` timestamp.
- Work log approval status or verifier columns: **Not Defined in PRD/ARCHITECTURE** (the `work_logs` table schema in ARCHITECTURE.md consists strictly of `id`, `internship_id`, `description`, `submitted_at`).
- All work log submissions record an entry in `audit_logs` for auditing purposes.

---

## Loading & EmptyState Behaviour Rules

- **Loading Behaviour:** `Loader` appears while work log data is loading.
- **EmptyState Trigger:** `EmptyState` appears only after loading completes and no records exist.
- **No Active Internship:** If no active internship (`Approved` or `Ongoing`) is found after loading completes, the submission form is hidden, and an `EmptyState` component is rendered explaining that an active internship is required.
- **No Work Logs:** If an active internship exists but no work logs have been submitted after loading completes, the submission form remains accessible, and an `EmptyState` component is rendered inside the history section.

---

## Session & Access Rules

- Every operation requires a valid authenticated student session.
- Students can view and submit work logs only for their own assigned active internship (`internships.student_id === authenticatedUser.id`).

---

**End of Part 2**
