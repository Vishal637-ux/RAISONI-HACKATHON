# MODULE_2_4_ATTENDANCE_PART_2

# Module 2.4 – Attendance

**Project:** AI-Powered Internship Management & Verification System

**Phase:** Phase 2 – Student Portal

**Module Type:** Core Student Module

---

# PART 2 – Supabase Operations → Business Rules

---

# 7. Supabase Operations

The Attendance module performs database read and insert operations on Supabase PostgreSQL.

---

## Database Operations Summary

### Fetch Active Internship ID

**Supabase Client Operation**

- Query `internships` table
- SELECT `id, student_id, start_date, end_date, status`
- FILTER `.eq('student_id', studentId)`
- FILTER `.in('status', ['Approved', 'Ongoing'])`

---

### Fetch Attendance Records

**Supabase Client Operation**

- Query `attendance` table
- SELECT `id, internship_id, attendance_date, status, verified_by, remarks`
- JOIN with `users` (`full_name`) via `verified_by`
- FILTER `.eq('internship_id', internshipId)`
- ORDER BY `attendance_date` DESC

---

### Submit Daily Attendance

**Supabase Client Operation**

- INSERT into `attendance`:
  - `internship_id`: Active Internship ID
  - `attendance_date`: Selected Date
  - `status`: `'Pending Verification'`
  - `verified_by`: `NULL`
  - `remarks`: `NULL`

---

### Create Audit Log Entry

**Supabase Client Operation**

- INSERT into `audit_logs`:
  - `user_id`: Authenticated User ID
  - `action`: `'Attendance Submitted'`
  - `module`: `'Attendance'`
  - `timestamp`: Current Timestamp

---

# 8. Validation Rules

All form validation must be implemented using **React Hook Form** and **Zod**.

---

## Attendance Submission Validation

### Attendance Date

- Required field.
- Must be a valid date format (`YYYY-MM-DD`).
- Cannot be a future date.
- Attendance date must fall within internship `start_date` and `end_date`.

### Attendance Status Selection

- Required field.
- Must be one of the allowed options: `Present`, `Absent`, `Leave`.

### Duplicate Date Validation

- Student can submit attendance only once for the same `attendance_date` (cannot submit duplicate attendance for a date that already has an existing record for the same `internship_id`).

---

# 9. Business Rules

The following business rules are derived strictly from PRD.md and ARCHITECTURE.md:

---

## Attendance Lifecycle Rules

The attendance process follows a strict multi-step lifecycle:

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

1. **Student Submission:** Only authenticated students with an active internship (`Approved` or `Ongoing`) can submit attendance.
2. **Initial Record Fields:** Newly created attendance records have:
   - `status = Pending Verification`
   - `verified_by = NULL`
   - `remarks = NULL`
   until verified by the Company Mentor.
3. **Company Mentor Verification:** Attendance verification is performed only by the Company Mentor module. The assigned company mentor reviews the record, updating `status` to `Present`, `Absent`, or `Leave`, and setting `verified_by` and optional `remarks`.
4. **Immutability After Verification:** Students must never be allowed to modify verified attendance records.

---

## Loading & EmptyState Behaviour Rules

- **Loading Behaviour:** `LoadingSpinner` appears while attendance data is loading.
- **EmptyState Trigger:** `EmptyState` appears only after loading completes and no records exist.
- **No Active Internship:** If no active internship (`Approved` or `Ongoing`) is found after loading completes, the submission form is hidden, and an `EmptyState` component is rendered.
- **No Attendance Records:** If an active internship exists but no attendance logs have been recorded after loading completes, the submission form remains accessible, and an `EmptyState` component is rendered inside the history section.

---

## Session & Access Rules

- Every operation requires a valid authenticated student session.
- Students can view and submit attendance records only for their own assigned active internship (`internships.student_id === authenticatedUser.id`).
- All submission actions create an entry in `audit_logs` for traceability.

---

**End of Part 2**
