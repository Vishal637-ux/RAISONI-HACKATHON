# ARCHITECTURE.MD

# PART 2

---

# 5. Database Schema

## 5.1 users

Stores authentication and user role information.

| Column     | Type      | Description                                |
|------------|-----------|--------------------------------------------|
| id         | UUID (PK) | User ID                                    |
| email      | TEXT      | Login Email                                |
| full_name  | TEXT      | Full Name                                  |
| role       | TEXT      | student, faculty, company, tpo, hod, admin |
| phone      | TEXT      | Mobile Number                              |
| status     | TEXT      | Active / Inactive                          |
| created_at | TIMESTAMP | Account Creation Time                      |
| updated_at | TIMESTAMP | Last Profile Update Time                   |


## 5.2 student_profiles

| Column            | Type                 | Description                           |
| ----------------- | -------------------- | ------------------------------------- |
| id                | UUID (PK)            | Student Profile ID                    |
| user_id           | UUID (FK → users.id) | Linked User ID                        |
| roll_number       | TEXT                 | Student Roll Number                   |
| department        | TEXT                 | Department Name                       |
| year              | INTEGER              | Academic Year                         |
| semester          | INTEGER              | Current Semester                      |
| cgpa              | DECIMAL              | Current CGPA                          |
| skills            | TEXT                 | Student Skills                        |
| resume_url        | TEXT                 | Resume File URL                       |
| profile_photo_url | TEXT                 | Student Profile Photo URL             |

---

## 5.3 companies

| Column         | Type      |
| -------------- | --------- |
| id             | UUID (PK) |
| company_name   | TEXT      |
| industry       | TEXT      |
| address        | TEXT      |
| website        | TEXT      |
| hr_email       | TEXT      |
| contact_number | TEXT      |

---

## 5.4 faculty_mentors

| Column      | Type      |
| ----------- | --------- |
| id          | UUID (PK) |
| user_id     | UUID (FK) |
| department  | TEXT      |
| designation | TEXT      |

---

## 5.5 company_mentors

| Column      | Type      |
| ----------- | --------- |
| id          | UUID (PK) |
| company_id  | UUID (FK) |
| user_id     | UUID (FK) |
| designation | TEXT      |

---

## 5.6 internships

Stores internship information for each student.

| Column             | Type                 | Description                             |
| ------------------ | -------------------- | --------------------------------------- |
| id                 | UUID (PK)            | Internship ID                           |
| student_id         | UUID (FK → users.id) | Student assigned to the internship      |
| company_id         | UUID (FK → companies.id) | Assigned Company                    |
| faculty_id         | UUID (FK → faculty_mentors.id) | Assigned Faculty Mentor      |
| company_mentor_id  | UUID (FK → company_mentors.id) | Assigned Company Mentor      |
| internship_title   | TEXT                 | Internship Title                        |
| start_date         | DATE                 | Internship Start Date                   |
| end_date           | DATE                 | Internship End Date                     |
| status             | TEXT                 | Current Internship Status               |

### Status Values

- Applied
- Approved
- Ongoing
- Completed
- Rejected

---

## 5.7 internship_applications

| Column     | Type      |
| ---------- | --------- |
| id         | UUID (PK) |
| student_id | UUID (FK) |
| company_id | UUID (FK) |
| applied_at | TIMESTAMP |
| status     | TEXT      |

---
## 5.8 attendance

Stores daily internship attendance records.

| Column            | Type                         | Description                              |
| ----------------- | ---------------------------- | ---------------------------------------- |
| id                | UUID (PK)                    | Attendance Record ID                     |
| internship_id     | UUID (FK → internships.id)   | Associated Internship                    |
| attendance_date   | DATE                         | Attendance Date                          |
| status            | TEXT                         | Attendance Status                        |
| verified_by       | UUID (FK → users.id)         | Company Mentor who verified attendance   |
| remarks           | TEXT                         | Verification Remarks                     |

### Status Values

- Present
- Absent
- Leave
- Pending Verification

---

## 5.9 work_logs

| Column        | Type      |
| ------------- | --------- |
| id            | UUID (PK) |
| internship_id | UUID (FK) |
| description   | TEXT      |
| submitted_at  | TIMESTAMP |

---

## 5.10 tasks

| Column        | Type      |
| ------------- | --------- |
| id            | UUID (PK) |
| internship_id | UUID (FK) |
| title         | TEXT      |
| description   | TEXT      |
| due_date      | DATE      |
| assigned_by   | UUID      |

---

## 5.11 task_submissions

| Column       | Type      |
| ------------ | --------- |
| id           | UUID (PK) |
| task_id      | UUID (FK) |
| student_id   | UUID (FK) |
| file_url     | TEXT      |
| remarks      | TEXT      |
| submitted_at | TIMESTAMP |

---

## 5.12 mentor_feedback

Stores feedback submitted by faculty mentors or company mentors for an internship.

| Column        | Type                             | Description                              |
| ------------- | -------------------------------- | ---------------------------------------- |
| id            | UUID (PK)                        | Feedback ID                              |
| internship_id | UUID (FK → internships.id)       | Associated Internship                     |
| mentor_id     | UUID (FK → users.id)             | Mentor who submitted the feedback         |
| rating        | INTEGER                          | Performance Rating                        |
| feedback      | TEXT                             | Mentor Feedback Comments                  |
| created_at    | TIMESTAMP                        | Feedback Submission Time                  |

### Rating Scale

- 1 – Poor
- 2 – Fair
- 3 – Good
- 4 – Very Good
- 5 – Excellent

---

## 5.13 certificates

| Column          | Type        |
| --------------- | ----------- |
| id              | UUID (PK)   |
| internship_id   | UUID (FK)   |
| certificate_id  | TEXT UNIQUE |
| qr_code         | TEXT        |
| certificate_url | TEXT        |
| generated_at    | TIMESTAMP   |

---

## 5.14 analytics

| Column            | Type      |
| ----------------- | --------- |
| id                | UUID (PK) |
| internship_id     | UUID (FK) |
| attendance_score  | DECIMAL   |
| task_score        | DECIMAL   |
| performance_score | DECIMAL   |
| placement_score   | DECIMAL   |
| ai_summary        | TEXT      |

---

## 5.15 notifications

Stores system notifications sent to users.

| Column     | Type                   | Description                           |
| ---------- | ---------------------- | ------------------------------------- |
| id         | UUID (PK)              | Notification ID                       |
| user_id    | UUID (FK → users.id)   | User who receives the notification    |
| title      | TEXT                   | Notification Title                    |
| message    | TEXT                   | Notification Message                  |
| is_read    | BOOLEAN                | Read Status                           |
| created_at | TIMESTAMP              | Notification Creation Time            |

### Notification Types

- Internship Application Updates
- Attendance Verification
- Task Assignment
- Task Review
- Mentor Feedback
- Internship Completion
- Certificate Generation

---
## 5.16 audit_logs

Stores audit records for important user activities performed within the system.

| Column     | Type                   | Description                          |
| ---------- | ---------------------- | ------------------------------------ |
| id         | UUID (PK)              | Audit Log ID                         |
| user_id    | UUID (FK → users.id)   | User who performed the action        |
| action     | TEXT                   | Action Performed                     |
| module     | TEXT                   | Module where the action occurred     |
| timestamp  | TIMESTAMP              | Date and Time of the Action          |

### Example Actions

- User Login
- Internship Application Submitted
- Attendance Verified
- Task Submitted
- Task Reviewed
- Mentor Feedback Submitted
- Internship Approved
- Certificate Generated
- Certificate Verified
- User Profile Updated

---
## 5.17 departments

| Column          | Type      |
| --------------- | --------- |
| id              | UUID (PK) |
| department_name | TEXT      |
| hod_id          | UUID (FK) |

---

# 6. Database Relationships

```text
Users
│
├── Student Profiles
├── Faculty Mentors
├── Company Mentors
├── Notifications
└── Audit Logs

Companies
│
├── Company Mentors
├── Internship Applications
└── Internships

Internships
│
├── Attendance
├── Work Logs
├── Tasks
├── Task Submissions
├── Mentor Feedback
├── Certificates
└── Analytics

Departments
│
└── HOD
```

---

# 7. Authentication & Authorization

Authentication Provider

- Supabase Authentication

Authentication Method

- Email & Password
- Email Verification
- Password Reset

Session Management

- JWT Tokens
- Secure Session Management

Authorization

- Role-Based Access Control (RBAC)

---

## Roles

- Student
- Faculty Mentor
- Company Mentor
- Training & Placement Officer (TPO)
- Head of Department (HOD)
- College Administrator

---

## Public Routes

- /login
- /register
- /forgot-password
- /verify-certificate/:certificateId

---

## Protected Routes

- /student/\*
- /faculty/\*
- /company/\*
- /tpo/\*
- /hod/\*
- /admin/\*

---

# 8. Main Modules

## Authentication

- Login
- Registration
- Forgot Password

---

## Student Portal

- Dashboard
- Internship
- Attendance
- Work Logs
- Tasks
- Feedback
- Certificate

---

## Faculty Mentor Portal

- Dashboard
- Assigned Students
- Attendance Review
- Task Review
- Feedback
- Performance

---

## Company Mentor Portal

- Dashboard
- Assigned Interns
- Attendance Verification
- Task Assignment
- Performance Review

---

## TPO Portal

- Dashboard
- Internship Records
- Certificate Verification
- Reports
- Placement Analytics

---

## HOD Portal

- Dashboard
- Department Analytics
- Student Reports

---

## College Admin Portal

- Dashboard
- User Management
- Company Management
- Analytics
- Reports
- Settings

---

## Notification Module

- Notifications
- Announcements

---

# 9. Key Data Flows

## Flow 1

Student → Internship Application → Faculty Approval → Company Allocation → Internship Started

---

## Flow 2

Student → Attendance Submission → Company Verification → Attendance Updated → Analytics Updated

---

## Flow 3

Student → Task Submission → Company Review → Faculty Review → Feedback Generated

---

## Flow 4

Faculty Approval → Company Approval → Internship Completed → Certificate Generated

---

## Flow 5

QR Scan → Certificate ID → Database Lookup → Verified / Invalid

---

## Flow 6

Attendance + Tasks + Feedback

↓

AI Performance Analysis

↓

Performance Score

↓

Placement Readiness Score

---

## Flow 7

Task Assigned

↓

Notification Created

↓

Student Dashboard

↓

Student Notified

---

# 10. CRUD Operations

## Users

- Create
- Read
- Update
- Disable

---

## Internship

- Create
- Read
- Update
- Delete (Admin Only)

---

## Attendance

- Create
- Read
- Verify
- Update

---

## Tasks

- Create
- Assign
- Submit
- Review
- Update

---

## Feedback

- Create
- Read
- Update

---

## Certificates

- Generate
- Verify
- Download

---

## Analytics

- Generate
- Read

---

## Notifications

- Create
- Read
- Update
- Delete

---

# 11. Security Architecture

Authentication

- Supabase Authentication

Authorization

- Role-Based Access Control (RBAC)

Database Security

- Row Level Security (RLS)

Validation

- Zod Validation

API Security

- HTTPS
- Secure Environment Variables

File Security

- Secure Supabase Storage
- File Upload Validation

Certificate Security

- QR Code Verification
- Unique Certificate ID

Audit

- All important actions stored in audit_logs

Session Security

- JWT Session Validation
- Automatic Session Expiry

---

# 12. Environment Variables

```env
VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=

VITE_QR_BASE_URL=
```

---

# 13. Deployment Architecture

Frontend

- Vercel

Backend

- Supabase


Database

PostgreSQL (Supabase)

Storage

- Supabase Storage

CI/CD

GitHub

↓

Vercel

Production

- HTTPS Enabled
- Custom Domain (Optional)

---

# 14. Development Roadmap

## Phase 1

- Authentication
- Student Registration
- Login
- RBAC

---

## Phase 2

- Student Portal
- Internship
- Attendance
- Tasks
- Work Logs

---

## Phase 3

- Faculty Mentor Portal
- Attendance Review
- Task Review
- Feedback

---

## Phase 4

- Company Mentor Portal
- Intern Management
-Performance Evaluation

---

## Phase 5

- Training & Placement Officer Portal
- Reports
- Certificate Verification
- Placement Analytics

---

## Phase 6

- HOD Portal
- Department Reports
- Institution Analytics

---

## Phase 7

- College Admin Portal
- User Management
- Company Management
- System Analytics

---

## Phase 8

- AI Analytics
- Performance Score
- Skill Gap Analysis
- Placement Readiness

---

## Phase 9

- Testing
- Bug Fixing
- Production Deployment

---

## Phase 10

- Performance Optimization
- Security Testing
- Documentation Review
- Final Production Release

---

# End of PART 2
