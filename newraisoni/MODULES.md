# MODULES.md — InterTrack Complete Module & Phase Execution Plan

**Document Version:** 2.0  
**Status:** Operational Implementation Source of Truth  
**Project:** InterTrack — AI-Powered Internship Management & Verification Platform  

---

## 1. Document Purpose

`MODULES.md` defines **WHAT** will be built and in **WHICH EXACT ORDER**.

- **PRD.md:** Product Requirements Source of Truth (What the product must achieve).
- **ARCHITECTURE.md:** Technical Architecture Source of Truth (How the system is technically structured and secured).
- **MODULES.md (This Document):** Execution Roadmap defining the 15 implementation phases, their exact component/service dependencies, and acceptance criteria.
- **PROGRESS.md:** Dynamic verification log recording what has been implemented and empirically tested against Supabase PostgreSQL.

### Phase-by-Phase Implementation Philosophy
Development occurs **strictly one phase at a time**. No phase is initiated until the prior phase achieves complete database persistence, passing automated build checks, RLS security validation, and explicit user acceptance.

---

## 2. Product Module Map

```text
Identity & Profile Domain
  │
  ▼
Academic Eligibility Evaluation Engine
  │
  ▼
Opportunity Posting & Browsing
  │
  ▼
Application & Shortlisting Pipeline
  │
  ▼
Company Selection & Offer Letter Management
  │
  ▼
TPO Offer Verification
  │
  ▼
Faculty Mentorship Allocation
  │
  ▼
Active Internship Engine
  ├── Real-time GPS Geofenced Attendance (Single Source of Truth)
  ├── Daily Work Logs
  └── Task Deliverables & Assignments
  │
  ▼
Weekly & Monthly Progress Aggregator
  │
  ▼
Dual Evaluation Engine (Company Mentor + Faculty Mentor)
  │
  ▼
Completion Approval & Digital QR Certificate Generation
  │
  ▼
External AI Certificate Verification (Advisory AI + Human Review)
  │
  ▼
PPO (Pre-Placement Offer) Tracking
  │
  ▼
Institutional & Departmental Analytics (TPO / HOD / Admin)
```

### 6 User Role Portals
1. **Student:** Profile, eligibility, applications, GPS check-in, work logs, tasks, progress, certificates, PPO.
2. **Company Mentor:** Opportunities, applicants, selection, offer letters, intern monitoring, attendance verification, task grading, company evaluation.
3. **Faculty Mentor:** Assigned mentees, attendance monitoring, work log review, task review, faculty evaluation, completion approval.
4. **Training & Placement Officer (TPO):** Institutional offer verification, mentor assignment, placement readiness oversight, institutional analytics.
5. **Head of Department (HOD):** Department-scoped student, internship, attendance, progress, and completion oversight.
6. **College Administrator:** User management, role assignment, system governance, audit log inspection.

---

## 3. Phase Dependency Graph

```text
Phase 0: Database Contract & Schema Audit
  ↓
Phase 1: Auth, RBAC & Department Scope Enforcers
  ↓
Phase 2: Student Profile & Academic Eligibility Engine
  ↓
Phase 3: Company Opportunity Posting & Application Pipeline
  ↓
Phase 4: Selection, Offer Letter & TPO Verification
  ↓
Phase 5: Faculty Mentorship Assignment Workflow
  ↓
Phase 6: Active Internship Engine — GPS Geofenced Attendance
  ↓
Phase 7: Work Logs & Task Submission Engine
  ↓
Phase 8: Weekly & Monthly Progress Aggregator
  ↓
Phase 9: Dual Evaluation Engine (Company Mentor + Faculty Mentor)
  ↓
Phase 10: Completion Approval, PPO Tracking & Digital Certificate Generation
  ↓
Phase 11: AI Certificate Verification & Trust Engine (Existing Integration)
  ↓
Phase 12: Gemini AI Integration — Monthly Summaries & Risk Monitor
  ↓
Phase 13: Institutional & Departmental Analytics (TPO / HOD / Admin)
  ↓
Phase 14: End-to-End Audit, RLS Verification & Hackathon Demo Readiness
```

---

# PHASE 0 — Database Contract & Schema Refinement

## 0.1 Objective
Inspect the existing database schema, audit existing Supabase migrations, and establish the exact PostgreSQL database contract without mutating production data.

## 0.2 Business Purpose
Prevents schema drift, missing foreign key constraints, or missing RLS policies before application code is executed.

## 0.3 User Roles
Admin, TPO (System setup phase).

## 0.4 Features
### Must Have
- Audit of existing PostgreSQL tables against PRD domain specifications.
- Schema contract definition for `users`, `student_profiles`, `companies`, `faculty_mentors`, `company_mentors`, `internship_postings`, `internship_applications`, `offer_letters`, `internships`, `work_locations`, `attendance`, `work_logs`, `tasks`, `task_submissions`, `weekly_monthly_progress`, `company_evaluations`, `faculty_evaluations`, `certificates`, `external_certificates`, `ml_certificate_dataset`, `ppo_records`, `audit_logs`.
### Optional / Future
- Auto-generated schema ERD documentation.

## 0.5 User Journey
N/A (Developer / System initialization phase).

## 0.6 Pages / Screens
N/A (Database level).

## 0.7 Components
- EXISTING: `supabase_migration.sql`, `supabase_certificates_migration.sql`, `supabase_external_certificates_migration.sql`, `supabase_ml_dataset_migration.sql`.

## 0.8 Services
- EXISTING: `src/supabase/supabaseClient.js`.

## 0.9 Database Dependencies
- Audit status for all 23 database entities.

## 0.10 RLS / Security
- Verify service role vs anonymous client RLS boundaries on Supabase.

## 0.11 API / Backend Requirements
- Direct Supabase PostgREST API audit query execution.

## 0.12 Dependencies
- None.

## 0.13 Data Flow
`PostgreSQL Schema Inspection` ──► `Contract Verification` ──► `Audit Report`.

## 0.14 Validation Rules
- All master tables MUST enforce `PRIMARY KEY` and appropriate `FOREIGN KEY` constraints.

## 0.15 Error / Empty / Loading States
- PGRST205 (Schema Cache Missing) error handling.

## 0.16 Testing Requirements
- Live table presence audit against remote Supabase instance.

## 0.17 Acceptance Criteria
- [ ] All 23 logical domain tables audited and categorized as EXISTS/PARTIAL/MISSING.
- [ ] SQL DDL scripts verified against PostgreSQL syntax standards.

## 0.18 Definition of Done
Complete database schema contract documented and verified against live Supabase project.

## 0.19 Protected Areas
Existing database schema tables (`public.users`, `public.external_certificates`, `public.ml_certificate_dataset`).

---

# PHASE 1 — Authentication, RBAC & Department Scope

## 1.1 Objective
Enforce robust authentication, session persistence, role-based route guards, and RLS policies for 6 roles.

## 1.2 Business Purpose
Guarantees strict security, preventing students, mentors, or HODs from viewing unauthorized data.

## 1.3 User Roles
Student, Company Mentor, Faculty Mentor, TPO, HOD, Admin.

## 1.4 Features
### Must Have
- User login, registration, password reset.
- JWT session state managed in `AuthContext.jsx`.
- Role-based route protection (`ProtectedRoute.jsx`).
- Dynamic HOD department RLS isolation.

## 1.5 User Journey
User enters credentials ──► Supabase Auth validates ──► Role claims extracted ──► Redirected to role-specific dashboard shell.

## 1.6 Pages / Screens
- `/login`, `/register`, `/forgot-password`, `/unauthorized`.

## 1.7 Components
- EXISTING: `Input.jsx`, `PasswordInput.jsx`, `Button.jsx`, `Alert.jsx`.

## 1.8 Services
- EXISTING: `authService.js`.

## 1.9 Database Dependencies
- `public.users` (id, email, role, status).

## 1.10 RLS / Security
- PostgreSQL RLS policy restricting `users` read/update access to `auth.uid()`.

## 1.11 API / Backend Requirements
- `supabase.auth.signInWithPassword()`, `supabase.auth.signUp()`.

## 1.12 Dependencies
- Phase 0.

## 1.13 Data Flow
`Client Form` ──► `authService.js` ──► `Supabase Auth` ──► `AuthContext` ──► `Guarded Layout`.

## 1.14 Validation Rules
- Email format validation, password length >= 6 characters, mandatory role selection.

## 1.15 Error / Empty / Loading States
- Invalid credentials alert, loading spinner during auth request.

## 1.16 Testing Requirements
- Unit tests for `AuthContext`, Supabase auth login simulation.

## 1.17 Acceptance Criteria
- [ ] All 6 roles log in cleanly and route to proper layouts.
- [ ] Unauthenticated users redirected to `/login`.
- [ ] HOD access strictly scoped by department ID.

## 1.18 Definition of Done
Role authentication and layout routing functioning 100% with real Supabase Auth tokens.

## 1.19 Protected Areas
`src/context/AuthContext.jsx`, `src/routes/ProtectedRoute.jsx`.

---

# PHASE 2 — Student Profile & Academic Eligibility

## 2.1 Objective
Manage complete student academic profiles and implement the rule-based eligibility evaluation engine.

## 2.2 Business Purpose
Allows students to maintain academic records (CGPA, backlogs, department) and verify internship eligibility transparently.

## 2.3 User Roles
Student, TPO, Admin.

## 2.4 Features
### Must Have
- Student profile view and edit screen.
- Academic metrics tracking (CGPA, backlogs, semester, year, department).
- Skills, certifications, experience, and resume upload to Supabase Storage.
- Automatic eligibility evaluation output (`Eligible` / `Not Eligible` with reason breakdown).

## 2.5 User Journey
Student fills profile details ──► Uploads resume ──► System saves profile to DB ──► Eligibility engine evaluates profile against posting criteria.

## 2.6 Pages / Screens
- `/student/profile`, `/student/eligibility`.

## 2.7 Components
- EXISTING: `Card.jsx`, `Input.jsx`, `Button.jsx`.
- NEW: `EligibilityCard.jsx`, `ResumeUploader.jsx`.

## 2.8 Services
- EXISTING: `profileService.js`.

## 2.9 Database Dependencies
- `public.student_profiles` (user_id, roll_number, department, year, semester, cgpa, skills, resume_url).

## 2.10 RLS / Security
- Students can update ONLY their own `student_profile` record (`user_id = auth.uid()`).

## 2.11 API / Backend Requirements
- `profileService.getProfile()`, `profileService.updateProfile()`, `supabase.storage.from('resumes')`.

## 2.12 Dependencies
- Phase 1.

## 2.13 Data Flow
`Profile Form` ──► `profileService` ──► `student_profiles Table` ──► `Eligibility Calculator` ──► `UI Results`.

## 2.14 Validation Rules
- CGPA between 0.0 and 10.0, backlogs >= 0, PDF format for resumes (< 5MB).

## 2.15 Error / Empty / Loading States
- Incomplete profile warnings, loading placeholders.

## 2.16 Testing Requirements
- Eligibility calculation unit tests (CGPA boundary conditions, backlog checks).

## 2.17 Acceptance Criteria
- [ ] Student can save profile and upload resume to Supabase Storage.
- [ ] System accurately flags eligibility based on CGPA and backlogs.

## 2.18 Definition of Done
Profile CRUD operational with verified eligibility calculation and Storage resume uploads.

## 2.19 Protected Areas
`src/services/profileService.js`.

---

# PHASE 3 — Company Internship Posting & Application

## 3.1 Objective
Enable Company Mentors to create internship opportunities and allow eligible Students to discover and apply.

## 3.2 Business Purpose
Digitizes job postings and application submissions, eliminating paper/Google Form workflows.

## 3.3 User Roles
Company Mentor, Student.

## 3.4 Features
### Must Have
- Company creation of internship listings (Title, mode, stipend, duration, vacancies, location, criteria).
- Student internship opportunity feed (Filtered by eligibility status).
- One-click internship application submission.
- Application status tracker for students.

## 3.5 User Journey
Company posts opportunity ──► System saves to DB ──► Student views feed ──► System checks eligibility ──► Student submits application.

## 3.6 Pages / Screens
- `/company/postings/create`, `/student/internships/browse`, `/student/applications`.

## 3.7 Components
- EXISTING: `Button.jsx`, `Card.jsx`, `EmptyState.jsx`.
- NEW: `InternshipPostingCard.jsx`, `ApplicationTrackerTable.jsx`.

## 3.8 Services
- EXISTING: `companyService.js`, `internshipService.js`.

## 3.9 Database Dependencies
- `public.internship_postings`, `public.internship_applications`.

## 3.10 RLS / Security
- Company can update ONLY postings created by their company (`company_id`). Students can insert applications ONLY for themselves.

## 3.11 API / Backend Requirements
- `internshipService.getAvailableInternships()`, `internshipService.applyForInternship()`.

## 3.12 Dependencies
- Phase 2.

## 3.13 Data Flow
`Company Form` ──► `internship_postings` ──► `Student Feed` ──► `internship_applications`.

## 3.14 Validation Rules
- Student can have only ONE active application per posting; deadline checks enforced.

## 3.15 Error / Empty / Loading States
- "No postings available" empty states, deadline passed alerts.

## 3.16 Testing Requirements
- Application submission integration test with Supabase DB.

## 3.17 Acceptance Criteria
- [ ] Company mentor successfully publishes an internship listing.
- [ ] Student applies and application persists in `internship_applications`.

## 3.18 Definition of Done
Postings and application workflows fully functioning with database persistence.

## 3.19 Protected Areas
`src/services/internshipService.js`.

---

# PHASE 4 — Selection, Offer Letter & TPO Verification

## 4.1 Objective
Manage candidate shortlisting, selection decisioning, offer letter upload, and mandatory TPO offer verification.

## 4.2 Business Purpose
Prevents unauthorized or unverified internships from being activated without college approval.

## 4.3 User Roles
Company Mentor, Student, Training & Placement Officer (TPO).

## 4.4 Features
### Must Have
- Company applicant review table (Shortlist / Select / Reject).
- Offer letter document upload by Company/Student.
- TPO Verification Queue for reviewing offer letters.
- TPO Approval / Evidence Request decisioning.

## 4.5 User Journey
Company selects student & uploads offer ──► Status becomes `OFFER_PENDING` ──► TPO inspects offer in queue ──► TPO approves ──► Status transitions to `TPO_VERIFIED`.

## 4.6 Pages / Screens
- `/company/applicants`, `/tpo/offer-verification`.

## 4.7 Components
- NEW: `ApplicantReviewTable.jsx`, `OfferVerificationDrawer.jsx`.

## 4.8 Services
- EXISTING: `tpoService.js`, `companyService.js`.

## 4.9 Database Dependencies
- `public.internship_applications`, `public.offer_letters`.

## 4.10 RLS / Security
- Only TPO role can update `offer_letters.verification_status` to `TPO_VERIFIED`.

## 4.11 API / Backend Requirements
- `tpoService.verifyOfferLetter()`, `supabase.storage.from('offer_letters')`.

## 4.12 Dependencies
- Phase 3.

## 4.13 Data Flow
`Company Selects` ──► `offer_letters` ──► `TPO Queue` ──► `TPO Approval` ──► `TPO_VERIFIED Status`.

## 4.14 Validation Rules
- Internship CANNOT transition to ACTIVE until offer letter is `TPO_VERIFIED`.

## 4.15 Error / Empty / Loading States
- Pending verification notices, PDF loading skeletons.

## 4.16 Testing Requirements
- State transition test ensuring unverified offers block active internship creation.

## 4.17 Acceptance Criteria
- [ ] Company selects candidate and uploads offer document.
- [ ] TPO approves offer letter and status updates in database.

## 4.18 Definition of Done
Offer letter upload and TPO verification pipeline operational and enforced.

## 4.19 Protected Areas
`src/services/tpoService.js`.

---

# PHASE 5 — Faculty Mentorship Assignment

## 5.1 Objective
Assign qualified Faculty Mentors to verified student internships before active check-in begins.

## 5.2 Business Purpose
Ensures every intern has an assigned academic mentor for continuous supervision.

## 5.3 User Roles
TPO, Admin, Faculty Mentor.

## 5.4 Features
### Must Have
- Faculty assignment panel for TPO/Admin.
- Department-matched faculty suggestion logic.
- Assigned mentees dashboard view for Faculty Mentors.

## 5.5 User Journey
TPO views `TPO_VERIFIED` internships ──► Selects Faculty Mentor from dropdown ──► Assigns mentor ──► Master `internships` record updated ──► Student appears in Faculty dashboard.

## 5.6 Pages / Screens
- `/tpo/faculty-assignment`, `/faculty/dashboard`.

## 5.7 Components
- EXISTING: `AssignedStudentsTable.jsx`.
- NEW: `FacultyAssignmentModal.jsx`.

## 5.8 Services
- EXISTING: `facultyService.js`, `tpoService.js`.

## 5.9 Database Dependencies
- `public.internships` (faculty_id), `public.faculty_mentors`.

## 5.10 RLS / Security
- Faculty mentors can query ONLY internships where `faculty_id` matches their profile ID.

## 5.11 API / Backend Requirements
- `tpoService.assignFacultyMentor()`, `facultyService.getAssignedMentees()`.

## 5.12 Dependencies
- Phase 4.

## 5.13 Data Flow
`TPO Selects Faculty` ──► `internships.faculty_id Updated` ──► `Faculty Mentee List Refreshed`.

## 5.14 Validation Rules
- Faculty mentor department must match student department.

## 5.15 Error / Empty / Loading States
- Unassigned faculty warning alerts.

## 5.16 Testing Requirements
- Mentee isolation RLS test for faculty user sessions.

## 5.17 Acceptance Criteria
- [ ] TPO assigns faculty mentor to verified internship.
- [ ] Assigned student instantly appears in Faculty Mentor portal.

## 5.18 Definition of Done
Faculty mentor allocation linked directly to master `internships` database record.

## 5.19 Protected Areas
`src/services/facultyService.js`.

---

# PHASE 6 — Active Internship Engine — GPS Geofenced Attendance

## 6.1 Objective
Enable real-time student GPS attendance check-in verified against configured work location geofences.

## 6.2 Business Purpose
Provides concrete, empirical proof of actual student presence at the assigned internship site.

## 6.3 User Roles
Student, Company Mentor, Faculty Mentor, HOD.

## 6.4 Features
### Must Have
- Browser Geolocation API integration (Lat, Long, Accuracy).
- Haversine distance calculation against work location coordinates.
- Status classification (`VERIFIED_GEOFENCE`, `OUT_OF_BOUNDS`, `LOCATION_UNAVAILABLE`).
- Daily duplicate check-in prevention.
- Single Source of Truth attendance table shared by Student, Mentors, and HOD.

## 6.5 User Journey
Student clicks "Mark Attendance" ──► Browser fetches GPS coords ──► Service computes Haversine distance ──► Saves single row to `attendance` table ──► Live record updates across all 4 dashboards.

## 6.6 Pages / Screens
- `/student/attendance`, `/company/attendance-verification`, `/faculty/attendance-logs`, `/hod/attendance`.

## 6.7 Components
- EXISTING: `AttendanceMarker.jsx`, `AttendanceVerificationTable.jsx`.

## 6.8 Services
- EXISTING: `attendanceService.js`, `companyAttendanceService.js`.

## 6.9 Database Dependencies
- `public.attendance`, `public.work_locations`.

## 6.10 RLS / Security
- Single `attendance` table with role-scoped policies (Student inserts own, Mentors update status).

## 6.11 API / Backend Requirements
- `attendanceService.markAttendance()`, `companyAttendanceService.verifyAttendance()`.

## 6.12 Dependencies
- Phase 5.

## 6.13 Data Flow
`GPS Coords` ──► `Haversine Calc` ──► `public.attendance DB Row` ──► `Shared Dashboard View`.

## 6.14 Validation Rules
- Max 1 check-in per student per date. Geofence radius tolerance default = 500m.

## 6.15 Error / Empty / Loading States
- GPS permission denied prompt, out-of-bounds warning toast.

## 6.16 Testing Requirements
- Haversine formula unit tests, duplicate check-in DB constraint test.

## 6.17 Acceptance Criteria
- [ ] Student marks attendance using real GPS and distance is calculated accurately.
- [ ] Duplicate check-in on the same date is blocked.
- [ ] Company and Faculty mentors see the exact same attendance record.

## 6.18 Definition of Done
GPS geofenced attendance system operational with single source of truth database persistence.

## 6.19 Protected Areas
`src/services/attendanceService.js`, `src/components/student/AttendanceMarker.jsx`.

---

# PHASE 7 — Work Logs & Task Submission

## 7.1 Objective
Support daily student work log logging and mentor task assignment, deliverables submission, and grading.

## 7.2 Business Purpose
Captures qualitative evidence of daily tasks completed during the internship.

## 7.3 User Roles
Student, Company Mentor, Faculty Mentor.

## 7.4 Features
### Must Have
- Daily work log submission form and log history timeline.
- Task creation modal for Company/Faculty mentors (Title, description, due date).
- Student task deliverable upload & status tracking.
- Task grading and feedback by mentors.

## 7.5 User Journey
Student writes daily work log ──► Saves to DB ──► Mentor assigns task ──► Student uploads solution file ──► Mentor reviews & grades (1-5 scale).

## 7.6 Pages / Screens
- `/student/work-logs`, `/student/tasks`, `/company/tasks`, `/faculty/work-logs`.

## 7.7 Components
- EXISTING: `WorkLogForm.jsx`, `TaskSubmissionModal.jsx`, `TaskAssignmentModal.jsx`.

## 7.8 Services
- EXISTING: `workLogService.js`, `taskService.js`.

## 7.9 Database Dependencies
- `public.work_logs`, `public.tasks`, `public.task_submissions`.

## 7.10 RLS / Security
- Students write own work logs; Mentors insert tasks for assigned `internship_id`.

## 7.11 API / Backend Requirements
- `workLogService.createLog()`, `taskService.assignTask()`, `taskService.submitTask()`.

## 7.12 Dependencies
- Phase 6.

## 7.13 Data Flow
`Work Log Form` ──► `work_logs Table` | `Task Form` ──► `tasks Table` ──► `Deliverable Upload`.

## 7.14 Validation Rules
- Work log text >= 20 characters; task due date must be in the future.

## 7.15 Error / Empty / Loading States
- "No tasks assigned" empty state, overdue task indicator.

## 7.16 Testing Requirements
- Work log CRUD and task submission file upload tests.

## 7.17 Acceptance Criteria
- [ ] Student submits daily work log successfully.
- [ ] Mentor assigns task, student uploads solution, mentor grades task.

## 7.18 Definition of Done
Work logs and task management functioning with real Supabase Storage & DB records.

## 7.19 Protected Areas
`src/services/workLogService.js`, `src/services/taskService.js`.

---

# PHASE 8 — Weekly & Monthly Progress

## 8.1 Objective
Aggregate attendance rates, work log submissions, task completion scores, and mentor ratings into progress metrics.

## 8.2 Business Purpose
Provides continuous visibility into student performance throughout the internship.

## 8.3 User Roles
Student, Faculty Mentor, Company Mentor, HOD.

## 8.4 Features
### Must Have
- Weekly & monthly progress score calculator.
- Progress breakdown charts (Attendance %, Task Score, Work Log Count).
- Flagging system for lagging or inactive interns.

## 8.5 User Journey
System queries attendance + tasks + work logs ──► Aggregates progress percentage ──► Renders progress card & trend chart on dashboards.

## 8.6 Pages / Screens
- `/student/progress`, `/faculty/student-progress`, `/hod/department-progress`.

## 8.7 Components
- NEW: `ProgressSummaryCard.jsx`, `ProgressChart.jsx` (Recharts).

## 8.8 Services
- NEW: `progressService.js`.

## 8.9 Database Dependencies
- `public.weekly_monthly_progress`, `public.attendance`, `public.tasks`, `public.work_logs`.

## 8.10 RLS / Security
- Read-only progress views scoped by user role claims.

## 8.11 API / Backend Requirements
- `progressService.calculateProgress()`, `progressService.getMonthlySummary()`.

## 8.12 Dependencies
- Phase 7.

## 8.13 Data Flow
`Raw Activity Tables` ──► `Progress Aggregator` ──► `weekly_monthly_progress` ──► `Recharts UI`.

## 8.14 Validation Rules
- Progress score calculated as weighted average (Attendance 40%, Tasks 40%, Logs 20%).

## 8.15 Error / Empty / Loading States
- Chart loading skeletons, insufficient data state for new internships.

## 8.16 Testing Requirements
- Progress score aggregation math unit test.

## 8.17 Acceptance Criteria
- [ ] System automatically calculates progress metrics based on real attendance and tasks.
- [ ] Visual charts display accurately across Student, Faculty, and HOD portals.

## 8.18 Definition of Done
Progress aggregation engine operational using real underlying activity records.

## 8.19 Protected Areas
Recharts chart integrations.

---

# PHASE 9 — Dual Evaluation Engine

## 9.1 Objective
Implement independent performance evaluations by Company Mentors and Faculty Mentors.

## 9.2 Business Purpose
Guarantees dual academic and industry validation prior to internship completion.

## 9.3 User Roles
Company Mentor, Faculty Mentor, Student.

## 9.4 Features
### Must Have
- Company Mentor evaluation form (Technical skills, conduct, output, rating 1-5).
- Faculty Mentor evaluation form (Academic alignment, reports, presentation, rating 1-5).
- Independent submission and locking of evaluation records.
- Student view of finalized mentor feedback.

## 9.5 User Journey
Company Mentor completes evaluation form ──► Saved to DB ──► Faculty Mentor completes evaluation form ──► Both linked to master `internship_id`.

## 9.6 Pages / Screens
- `/company/evaluate-intern`, `/faculty/evaluate-student`, `/student/feedback`.

## 9.7 Components
- NEW: `CompanyEvaluationForm.jsx`, `FacultyEvaluationForm.jsx`.

## 9.8 Services
- EXISTING: `companyEvaluationService.js`, `feedbackService.js`.

## 9.9 Database Dependencies
- `public.company_evaluations`, `public.faculty_evaluations`.

## 9.10 RLS / Security
- Company mentor can insert ONLY for assigned company interns; Faculty ONLY for assigned mentees.

## 9.11 API / Backend Requirements
- `companyEvaluationService.submitEvaluation()`, `feedbackService.submitFacultyFeedback()`.

## 9.12 Dependencies
- Phase 8.

## 9.13 Data Flow
`Evaluation Forms` ──► `company_evaluations & faculty_evaluations Tables` ──► `Completion Check`.

## 9.14 Validation Rules
- Both evaluations mandatory before internship completion approval. Ratings between 1 and 5.

## 9.15 Error / Empty / Loading States
- "Pending evaluation from mentor" status badges.

## 9.16 Testing Requirements
- Dual evaluation submission integration test.

## 9.17 Acceptance Criteria
- [ ] Company and Faculty mentors submit evaluations independently.
- [ ] System records ratings and comments in PostgreSQL database.

## 9.18 Definition of Done
Dual evaluation engine fully functional with database persistence.

## 9.19 Protected Areas
`src/services/companyEvaluationService.js`, `src/services/feedbackService.js`.

---

# PHASE 10 — Completion, PPO & Digital Certificate

## 10.1 Objective
Manage internship completion approvals, digital QR certificate generation, and PPO offer tracking.

## 10.2 Business Purpose
Automates official certificate issuance upon successful completion and tracks career outcomes (PPOs).

## 10.3 User Roles
Faculty Mentor, Company Mentor, Student, TPO.

## 10.4 Features
### Must Have
- Internship completion status transition (`COMPLETED`).
- Automatic digital PDF certificate generation (jsPDF) with Unique Certificate ID and QR Code.
- Public QR code certificate verification route (`/verify-certificate/:certificateId`).
- PPO record tracking (Status, designation, CTC).

## 10.5 User Journey
Dual evaluations approved ──► System generates Digital Certificate with QR code ──► Saved to DB & Storage ──► Student downloads PDF ──► Anyone scans QR to verify publicly.

## 10.6 Pages / Screens
- `/student/certificate`, `/verify-certificate/:certificateId`, `/tpo/ppo-records`.

## 10.7 Components
- EXISTING: `pdfGeneratorService.js`, `qrcode.react`.
- NEW: `DigitalCertificateCard.jsx`, `PublicCertificateVerifier.jsx`.

## 10.8 Services
- EXISTING: `certificateService.js`, `pdfGeneratorService.js`.

## 10.9 Database Dependencies
- `public.certificates`, `public.ppo_records`, `public.internships`.

## 10.10 RLS / Security
- Public read access for certificate verification queries by `certificate_id`.

## 10.11 API / Backend Requirements
- `certificateService.generateCertificate()`, `pdfGeneratorService.generatePDF()`.

## 10.12 Dependencies
- Phase 9.

## 10.13 Data Flow
`Completion Event` ──► `jsPDF + QR Code` ──► `certificates Table` ──► `Public Verification Lookup`.

## 10.14 Validation Rules
- Certificates generated ONLY for `COMPLETED` internships with valid dual evaluations.

## 10.15 Error / Empty / Loading States
- "Invalid / Unverified Certificate ID" error screen for fake QR scans.

## 10.16 Testing Requirements
- PDF generation test, QR code verification lookup unit test.

## 10.17 Acceptance Criteria
- [ ] System auto-generates digital certificate with valid QR code upon completion.
- [ ] Scanning QR code opens public verification page and confirms authenticity.
- [ ] PPO details saved to database.

## 10.18 Definition of Done
Digital certificate issuance, public QR verification, and PPO tracking completely operational.

## 10.19 Protected Areas
`src/services/pdfGeneratorService.js`, `src/services/certificateService.js`.

---

# PHASE 11 — AI Certificate Verification & Trust Engine

## 11.1 Objective
Verify external internship completion certificates via Python PyMuPDF OCR, anomaly detection, and Trust Engine scoring.

## 11.2 Business Purpose
Detects and prevents fake external internship certificates submitted for academic credit.

## 11.3 User Roles
Faculty Mentor, TPO, HOD, Admin.

## 11.4 Features
### Must Have
- External certificate PDF upload dropzone.
- Python FastAPI OCR text extraction & SHA-256 duplicate detection.
- Trust Engine scoring (0-100%) and advisory AI recommendation.
- Reviewer Queue and Adjudication Drawer for human review (`APPROVED` / `REJECTED`).
- Ground truth dataset snapshotting (`ml_certificate_dataset`).

## 11.5 User Journey
User uploads external PDF ──► FastAPI runs OCR & Trust Engine ──► Saves to `external_certificates` ──► Reviewer inspects Trust Score in Drawer ──► Human approves/rejects ──► Snapshots to `ml_certificate_dataset`.

## 11.6 Pages / Screens
- `/faculty/certificates`, `/tpo/certificate-verification`, `/hod/certificate-verification`.

## 11.7 Components
- EXISTING: `ExternalCertificateReviewDrawer.jsx`, `CertificateReviewQueueCard.jsx`.

## 11.8 Services
- EXISTING: `certificateVerificationService.js`.

## 11.9 Database Dependencies
- `public.external_certificates`, `public.ml_certificate_dataset`.

## 11.10 RLS / Security
- Review access restricted to Faculty, TPO, HOD, Admin roles; prohibited for Students.

## 11.11 API / Backend Requirements
- FastAPI `/api/v1/certificates/analyze`, `certificateVerificationService.submitReviewerDecision()`.

## 11.12 Dependencies
- Phase 10.

## 11.13 Data Flow
`External PDF` ──► `FastAPI OCR` ──► `Trust Engine` ──► `Review Drawer` ──► `Human Decision` ──► `ml_certificate_dataset`.

## 11.14 Validation Rules
- AI recommendation is advisory; human review decision is authoritative.

## 11.15 Error / Empty / Loading States
- OCR processing spinner, duplicate hash alert.

## 11.16 Testing Requirements
- Python unit test suite (`python -m unittest discover -s ai_service` - 262 tests passing).

## 11.17 Acceptance Criteria
- [ ] External PDF processed through OCR and Trust Engine successfully.
- [ ] Human review decision updates status in Supabase database.
- [ ] Python test suite passes 100%.

## 11.18 Definition of Done
AI Certificate Verification pipeline verified with 100% test suite pass rate.

## 11.19 Protected Areas
`ai_service/trust_engine.py`, `ai_service/final_quality_gate.py`, `ai_service/ml_training_blocker.py`.

---

# PHASE 12 — Gemini AI — Monthly Summary & Risk Monitor

## 12.1 Objective
Integrate server-side Google Gemini API to generate monthly student progress summaries and monitor internship risk levels.

## 12.2 Business Purpose
Provides AI-assisted qualitative insights and early warnings for disengaged or struggling interns.

## 12.3 User Roles
Faculty Mentor, TPO, HOD.

## 12.4 Features
### Must Have
- Monthly AI Summary generator (Inputs: attendance, logs, tasks ──► Natural language summary).
- Internship Risk Monitor (Inputs: attendance trends, inactivity ──► `NORMAL` / `ATTENTION NEEDED` / `HIGH ATTENTION`).
- Strict server-side Gemini API key isolation (`GEMINI_API_KEY`).
- Advisory AI disclaimer UI.

## 12.5 User Journey
Faculty requests monthly AI summary ──► Backend collects activity metrics ──► Calls Gemini API server-side ──► Returns structured summary & risk score to UI.

## 12.6 Pages / Screens
- `/faculty/student-insights`, `/hod/risk-monitor`.

## 12.7 Components
- NEW: `AISummaryCard.jsx`, `RiskMonitorBadge.jsx`.

## 12.8 Services
- NEW: `aiService.js` (Proxied via FastAPI).

## 12.9 Database Dependencies
- `public.weekly_monthly_progress`, `public.attendance`, `public.tasks`.

## 12.10 RLS / Security
- Gemini API key MUST remain server-side. PII (student names) anonymized in prompt payload.

## 12.11 API / Backend Requirements
- FastAPI `/api/v1/ai/monthly-summary`, `/api/v1/ai/risk-monitor`.

## 12.12 Dependencies
- Phase 11.

## 12.13 Data Flow
`Activity Data` ──► `FastAPI Proxy` ──► `Google Gemini API` ──► `Structured JSON Response` ──► `UI Card`.

## 12.14 Validation Rules
- Gemini API calls must handle rate limits gracefully and fallback to rule-based summary if API fails.

## 12.15 Error / Empty / Loading States
- AI generating skeleton loader, fallback rule-based summary banner.

## 12.16 Testing Requirements
- FastAPI Gemini API proxy integration test (with mock response fallback).

## 12.17 Acceptance Criteria
- [ ] Server-side Gemini API proxy generates valid monthly progress summaries.
- [ ] Risk monitor flags disengaged interns with explainable reasons.
- [ ] No API keys exposed in frontend Vite bundle.

## 12.18 Definition of Done
Gemini AI features functional server-side with zero secret key leakage.

## 12.19 Protected Areas
`ai_service/config.py`.

---

# PHASE 13 — Institutional & Departmental Analytics

## 13.1 Objective
Deliver real-time analytics dashboards for TPO, HOD, and Admin using live database query aggregations.

## 13.2 Business Purpose
Empowers leadership with empirical data on placement readiness, company engagement, and department metrics.

## 13.3 User Roles
TPO, HOD, Admin.

## 13.4 Features
### Must Have
- TPO Dashboard: Total active internships, placement readiness score distribution, stipend statistics, PPO conversion rates.
- HOD Dashboard: Department-scoped attendance averages, student progress rates, completion percentages.
- Admin Dashboard: Platform user metrics, company statistics, audit log inspection.
- Filterable Recharts analytics components.

## 13.5 User Journey
TPO/HOD logs in ──► System executes live PostgreSQL aggregations ──► Renders interactive metrics & charts.

## 13.6 Pages / Screens
- `/tpo/dashboard`, `/hod/dashboard`, `/admin/dashboard`.

## 13.7 Components
- EXISTING: `hodService.js`, `tpoService.js`, `adminService.js`.
- NEW: `AnalyticsStatCard.jsx`, `DepartmentChart.jsx`.

## 13.8 Services
- EXISTING: `tpoService.js`, `hodService.js`, `adminService.js`.

## 13.9 Database Dependencies
- `public.internships`, `public.student_profiles`, `public.attendance`, `public.ppo_records`.

## 13.10 RLS / Security
- HOD queries strictly scoped to authenticated `department_id` via PostgreSQL RLS.

## 13.11 API / Backend Requirements
- `tpoService.getInstitutionalStats()`, `hodService.getDepartmentStats()`.

## 13.12 Dependencies
- Phase 12.

## 13.13 Data Flow
`PostgreSQL Aggregations` ──► `Service Layer` ──► `Recharts Visualization Components`.

## 13.14 Validation Rules
- All statistics MUST be derived from real database rows; zero hardcoded metrics.

## 13.15 Error / Empty / Loading States
- Dashboard metric loading skeletons, empty department warnings.

## 13.16 Testing Requirements
- SQL aggregation performance & accuracy verification.

## 13.17 Acceptance Criteria
- [ ] TPO and HOD dashboards render accurate live metrics from database.
- [ ] HOD data is strictly isolated to their specific department.

## 13.18 Definition of Done
Institutional and departmental analytics dashboards operating on live database infrastructure.

## 13.19 Protected Areas
`src/services/tpoService.js`, `src/services/hodService.js`.

---

# PHASE 14 — End-to-End Audit, RLS Verification & Hackathon Demo

## 14.1 Objective
Perform comprehensive end-to-end system audit, verify database RLS security policies, and validate hackathon demo flow.

## 14.2 Business Purpose
Ensures platform stability, security compliance, and flaw-free demo execution for hackathon evaluation.

## 14.3 User Roles
All 6 Roles (Student, Company Mentor, Faculty Mentor, TPO, HOD, Admin).

## 14.4 Features
### Must Have
- Complete 17-step end-to-end student journey verification.
- Comprehensive Supabase RLS security policy audit across all 23 tables.
- Production build verification (`npm run build`).
- Python AI service test suite verification (`python -m unittest discover -s ai_service`).
- Final `PROGRESS.md` update.

## 14.5 User Journey
Full demo walkthrough from Student registration to Public QR verification and TPO Analytics.

## 14.6 Pages / Screens
- All application routes.

## 14.7 Components
- All UI components.

## 14.8 Services
- All service modules.

## 14.9 Database Dependencies
- Full database schema.

## 14.10 RLS / Security
- 100% RLS coverage verified across all PostgreSQL tables.

## 14.11 API / Backend Requirements
- Full API stack operational.

## 14.12 Dependencies
- Phases 0 through 13.

## 14.13 Data Flow
`End-to-End Journey Execution` ──► `Audit Verification` ──► `Hackathon Presentation Ready`.

## 14.14 Validation Rules
- Zero build errors, zero failing tests, zero unhandled console exceptions.

## 14.15 Error / Empty / Loading States
- All edge cases, empty states, and loading states visually verified.

## 14.16 Testing Requirements
- Frontend Production Build (`npm run build`), Python Unit Tests (`python -m unittest discover -s ai_service`).

## 14.17 Acceptance Criteria
- [ ] Complete 17-step student journey works end-to-end on live Supabase DB.
- [ ] `npm run build` succeeds with exit code 0.
- [ ] Python test suite passes 100% (262/262 tests).
- [ ] RLS policies verified and enforced across all roles.

## 14.18 Definition of Done
InterTrack platform fully verified, secure, tested, built, and ready for hackathon demonstration.

## 14.19 Protected Areas
Entire project codebase.

---

## 4. Global Architecture Rules

1. **SINGLE SOURCE OF TRUTH:** No duplicate domain tables permitted.
2. **REUSE BEFORE CREATE:** Inspect existing codebase files and services before introducing new files.
3. **REAL DATABASE PERSISTENCE:** All business operations must persist directly to Supabase PostgreSQL.
4. **NO HARDCODED DATA:** Department names, company details, user assignments, and statistics must be query-driven.
5. **RLS IS AUTHORITATIVE:** Security enforced at PostgreSQL database layer, not client routes alone.
6. **AI IS ADVISORY:** AI suggestions assist human reviewers; humans make binding institutional decisions.
7. **SERVER-SIDE SECRETS:** `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never be exposed in client code.
8. **NO DESTRUCTIVE CHANGES:** Existing schema and core logic protected against unapproved refactoring.
9. **PHASE DISCIPLINE:** Build strictly phase-by-phase in numerical order.
10. **NO MOCK COMPLETION:** Phases are complete ONLY after empirical database verification.

---

## 5. Global Testing Strategy

```text
1. Unit Tests ──────────────► Validate utility functions (Haversine geofence, form schemas).
2. Integration Tests ───────► Validate service calls with Supabase PostgREST API.
3. Database RLS Tests ──────► Validate role-based SQL access boundaries.
4. Python AI Test Suite ────► Validate PyMuPDF OCR, Trust Engine, and Quality Gates (262 tests).
5. Production Build Test ───► Validate Vite build compilation (`npm run build`).
6. End-to-End Demo Test ────► Validate full 17-step student journey.
```

---

## 6. Global Definition of Done

A phase is considered **DONE** only when:
- [ ] Features implemented per specification.
- [ ] Existing codebase integrity preserved.
- [ ] Real Supabase PostgreSQL database persistence verified.
- [ ] Database RLS and security policies enforced.
- [ ] Unit and integration tests pass.
- [ ] Frontend build succeeds (`npm run build`).
- [ ] Error, loading, and empty states handled gracefully.
- [ ] Acceptance criteria satisfied 100%.
- [ ] `PROGRESS.md` updated with verification results.

---

## 7. Phase Status Table

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 0** | Database Contract & Schema Refinement | **NOT STARTED** |
| **Phase 1** | Authentication, RBAC & Department Scope | **NOT STARTED** |
| **Phase 2** | Student Profile & Academic Eligibility | **NOT STARTED** |
| **Phase 3** | Company Internship Posting & Application | **NOT STARTED** |
| **Phase 4** | Selection, Offer Letter & TPO Verification | **NOT STARTED** |
| **Phase 5** | Faculty Mentorship Assignment | **NOT STARTED** |
| **Phase 6** | Active Internship Engine — GPS Geofenced Attendance | **NOT STARTED** |
| **Phase 7** | Work Logs & Task Submission | **NOT STARTED** |
| **Phase 8** | Weekly & Monthly Progress | **NOT STARTED** |
| **Phase 9** | Dual Evaluation Engine | **NOT STARTED** |
| **Phase 10** | Completion, PPO & Digital Certificate | **NOT STARTED** |
| **Phase 11** | AI Certificate Verification & Trust Engine | **EXISTING / VERIFY** |
| **Phase 12** | Gemini AI — Monthly Summary & Risk Monitor | **NOT STARTED** |
| **Phase 13** | Institutional & Departmental Analytics | **NOT STARTED** |
| **Phase 14** | End-to-End Audit, RLS Verification & Hackathon Demo | **NOT STARTED** |

---
**End of MODULES.md Source of Truth Document**
