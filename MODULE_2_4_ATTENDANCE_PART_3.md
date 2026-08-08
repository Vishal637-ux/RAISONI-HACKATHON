# MODULE_2_4_ATTENDANCE_PART_3

# Module 2.4 – Attendance

**Project:** AI-Powered Internship Management & Verification System

**Phase:** Phase 2 – Student Portal

**Module Type:** Core Student Module

---

# 10. Edge Cases

- Student has no active internship record (`internships` record is missing or status is not `Approved`/`Ongoing`) → Triggers No Active Internship `EmptyState`.
- Student has an active internship but 0 attendance entries logged → Triggers No Attendance Records `EmptyState`.
- Attendance submission attempted after internship `end_date` or before `start_date`.
- Student attempts to submit attendance for a date that already has a submitted attendance record.
- Student attempts to submit attendance for a future date.
- Attendance submission interrupted by network disconnection.
- User session expires while completing attendance form submission.
- Unauthorized access attempt to `/student/attendance` route by an unauthenticated user or non-student role.
- Supabase database service unavailable or timing out during submission.
- Database insertion failure into `attendance` or `audit_logs` table.

---

# 11. Error Handling

Display clear and actionable error messages for:

## Attendance Errors

- Unable to load active internship details.
- Unable to fetch attendance history.
- Failed to submit attendance record.

## Validation Errors

- Please select a valid date.
- Attendance date cannot be in the future.
- Attendance date must fall within internship start date and end date.
- Attendance for this date has already been submitted.
- Please select an attendance status (`Present`, `Absent`, or `Leave`).

## Authentication Errors

- Session expired. Please login again.
- Unauthorized access.

## Network Errors

- Internet connection lost.
- Unable to connect to server.

---

# 12. Notifications

## Success

- Attendance submitted successfully. Pending verification by company mentor.

## Warning

- Attendance record for the selected date already exists.

## Error

- Attendance submission failed. Please try again.
- Failed to load attendance records.
- Network error occurred.

---

# 13. Loading States & Display Behavior

- `LoadingSpinner` appears while attendance data is loading.
- `EmptyState` appears only after loading completes and no records exist.
- Displays loading state during:
  - Fetching active internship status
  - Fetching attendance history records
  - Submitting daily attendance record
  - Refreshing attendance table and summary metrics

---

# 14. Security

- Supabase Authentication required for access.
- Role-Based Access Control (RBAC) enforced for Student role (`/student/attendance`).
- Row Level Security (RLS) on `attendance` table restricting reads and writes to the student's own `internship_id`.
- Zod schema validation for input data integrity.
- Automatic audit log creation (`audit_logs`) for attendance submission activities.
- Secure HTTPS communication.

---

# 15. Build Order

1. Configure Student Attendance Route (`/student/attendance`) in React Router.
2. Create `attendanceService.js` for database operations (`fetchActiveInternship`, `fetchAttendanceRecords`, `submitAttendance`).
3. Create `attendanceSchema.js` using Zod for date and status validation.
4. Build `AttendanceStatusBadge` reusable component (`Pending Verification`, `Present`, `Absent`, `Leave`).
5. Build `AttendanceSummaryCard` component to calculate and display total logged, present, absent, leave, and pending days.
6. Build `AttendanceSubmissionCard` form component using React Hook Form & Zod.
7. Build `AttendanceHistoryTable` component using `AttendanceStatusBadge` and handling `EmptyState` when no logs exist.
8. Create `StudentAttendancePage` component assembling submission, summary, history, and `EmptyState` views with `LoadingSpinner`.
9. Integrate Loading States and Toast Notifications (`react-hot-toast`).
10. Responsive UI Verification (Test layouts on mobile, tablet, and desktop screens).
11. Update `StudentLayout` sidebar navigation links.
12. Conduct Functional, Validation, Permission, and Security Testing.

---

# 16. Dependencies

Required before implementation:

- Module 1 – Authentication
- Module 2.1 – Student Dashboard
- Module 2.3 – Internship (active internship record required)
- Student Layout (`StudentLayout`, `Sidebar`, `Header`)
- React Router DOM
- React Hook Form
- Zod
- React Hot Toast
- Lucide React
- Supabase Client
- `users` table
- `internships` table
- `attendance` table
- `audit_logs` table

---

# 17. Testing Checklist

## Functional Testing

- View Attendance summary metrics (Total, Present, Absent, Leave, Pending).
- View Attendance history table with dates, `AttendanceStatusBadge`, verified by, and remarks.
- Select date and status (`Present`, `Absent`, `Leave`) and submit attendance.
- Verify submitted status defaults to `Pending Verification` with `verified_by = NULL` and `remarks = NULL`.

## Validation Testing

- Verify future date submission is blocked.
- Verify date outside internship `start_date` and `end_date` is blocked.
- Verify duplicate date submission for the same student is blocked.
- Form validation error messages display properly.

## Permission & Lifecycle Testing

- Student can view/submit attendance only for their own active internship.
- Verify students MUST NEVER be allowed to modify verified attendance records.
- Unauthenticated users and non-student roles are redirected away from `/student/attendance`.

## Component & State Testing

- **`AttendanceStatusBadge` renders correct status** (`Pending Verification`, `Present`, `Absent`, `Leave`).
- **`EmptyState` appears when no active internship exists.**
- **`EmptyState` appears when no attendance records exist.**
- **`LoadingSpinner` appears while attendance data is loading** and hides before displaying `EmptyState` or content.

## UI & Responsive Testing

- Responsive UI Verification: Test grid layout, cards, and history table on mobile, tablet, and desktop viewports.
- Success and Error toast notifications trigger accurately.

## Security Testing

- Authenticated session enforcement verified.
- RBAC verification for Student role.
- RLS verification on `attendance` table.

---

# End of Module 2.4 – Part 3
