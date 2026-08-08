# MODULE_2_3_INTERNSHIP_PART_2

# Module 2.3 – Internship

**Project:** AI-Powered Internship Management & Verification System

**Phase:** 2 – Student Portal

**Module Type:** Core Student Module

---

# PART 2 – Supabase Operations → Business Rules

---

# 7. Supabase Operations

The Internship module performs database read and insert operations on Supabase PostgreSQL.

---

## Database Operations Summary

### Fetch Active Internship

**Supabase Client Operation**

- Query `internships` table
- SELECT `id, student_id, company_id, faculty_id, company_mentor_id, internship_title, start_date, end_date, status`
- JOIN with `companies` (`company_name, industry`)
- FILTER `.eq('student_id', studentId)`

---

### Fetch Student Applications

**Supabase Client Operation**

- Query `internship_applications` table
- SELECT `id, student_id, company_id, applied_at, status`
- JOIN with `companies` (`company_name, industry`)
- FILTER `.eq('student_id', studentId)`
- ORDER BY `applied_at` DESC

---

### Fetch Available Companies

**Supabase Client Operation**

- Query `companies` table
- SELECT `id, company_name, industry, address, website, hr_email, contact_number`

---

### Apply For Internship

**Supabase Client Operation**

- INSERT into `internship_applications`:
  - `student_id`: Authenticated User ID
  - `company_id`: Selected Company ID
  - `applied_at`: Current Timestamp
  - `status`: `'Applied'`

---

# 8. Validation Rules

All form validation must be implemented using **React Hook Form** and **Zod**.

---

## Application Validation

### Company Selection

- Required
- Must be a valid company ID from the registered `companies` table.

---

# 9. Business Rules

The following business rules are derived from PRD.md and ARCHITECTURE.md:

---

## Application Rules

- Only authenticated students can submit internship applications.
- Submitted applications initialize with status `'Applied'`.
- Students can view all submitted applications and their current statuses (`Applied`, `Approved`, `Rejected`).

---

## Internship Rules

- An internship becomes active when its status is `'Approved'` or `'Ongoing'`.
- Students can view details of their assigned internship, including assigned faculty and company mentors, title, and timeline.
- Students cannot modify company records, application statuses, or mentor assignments.

---

## Session & Access Rules

- Every operation requires a valid authenticated student session.
- Students can view and manage only their own internship applications and records.

---

**End of Part 2**
