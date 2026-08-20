# PRD — InterTrack: AI-Powered Internship Management & Verification Platform

**Document Version:** 2.0  
**Status:** Product Requirements Source of Truth  
**Project:** InterTrack  

---

## 1. Product Overview & Positioning

**Product Name:** InterTrack  
**Positioning:** AI-Powered Internship Management & Verification Platform  

### Overview
InterTrack is an end-to-end institutional internship lifecycle and verification platform. It is designed to digitize, streamline, and monitor the entire internship journey for colleges, students, company mentors, faculty mentors, Training & Placement Officers (TPO), Heads of Departments (HOD), and college administrators.

InterTrack is **neither** solely an attendance management application **nor** solely a certificate scanner. Its core objective is to create a single, continuous, trusted **chain of evidence** covering the complete internship lifecycle:

```text
Student Profile
  │
  ▼
Eligibility Evaluation
  │
  ▼
Internship Discovery & Opportunity Posting
  │
  ▼
Application & Shortlisting
  │
  ▼
Company Selection & Offer Letter Generation
  │
  ▼
TPO Offer Verification
  │
  ▼
Faculty Mentor Assignment
  │
  ▼
Active Internship Phase
  ├── Real-time GPS Geofenced Attendance
  ├── Daily Work Logs
  └── Assigned Tasks & Deliverables
  │
  ▼
Weekly & Monthly Progress Aggregation
  │
  ▼
Dual Evaluation (Company Mentor + Faculty Mentor)
  │
  ▼
Completion Approval
  │
  ▼
Digital Certificate & AI Verification (Advisory AI + Human Review)
  │
  ▼
PPO (Pre-Placement Offer) Tracking
  │
  ▼
Institutional & Departmental Analytics
```

---

## 2. Problem Statement

Current educational internship management is highly fragmented across disconnected channels:
- Google Forms
- Spreadsheets / Excel files
- WhatsApp groups
- Emails
- Paper logs and manual documents
- Isolated attendance tracking tools
- Unverified, manually submitted completion certificates

### Key Problems Solved by InterTrack
- **Lack of Continuous Oversight:** Colleges cannot easily verify whether a student is actively attending and working at the assigned internship site.
- **Disconnected Data:** Attendance, work logs, task submissions, and mentor feedback exist in silos.
- **Weak Supervisions:** Faculty mentors struggle to monitor assigned students in real time; company mentors and faculty lack a single source of truth.
- **Fraudulent Certificates:** High risk of fake or unverifiable internship certificates submitted for academic credit.
- **Administrative Burden:** Manual reporting and data collection consume excessive time for TPOs and HODs.
- **Unmeasured Placement Readiness:** Difficulty in evaluating student performance and placement readiness based on concrete empirical data.

---

## 3. Product Vision & Strategy

InterTrack transitions the educational institution from a passive query:
> *"Did the student submit an internship certificate?"*

To an active, evidence-backed capability:
> *"Can the institution verify the student's complete, end-to-end internship journey?"*

By integrating identity, academic eligibility, application, offer letter verification, GPS attendance, daily work logs, task execution, progress tracking, dual evaluations, completion approvals, certificate verification, and PPO tracking into **one trusted record**, InterTrack ensures total transparency and academic integrity.

---

## 4. User Roles & Detailed System Requirements

### 4.1 Student
* **Account & Profile:** Register/login, manage profile, academic history (CGPA, backlogs, department, passing year), skills, certifications, prior experience, and resume upload.
* **Internship Discovery & Application:** View eligible internship opportunities (filtered by eligibility criteria), apply for internships, track application status, selection state, and offer letter status.
* **Daily Operations:** Mark real attendance using device/browser GPS geofencing, submit daily work logs, view assigned tasks, update task progress, and submit deliverables.
* **Progress & Verification:** View mentor feedback, monthly progress reports, completion evaluation, digital certificate verification status, and PPO status.

### 4.2 Company Mentor / Industry Supervisor
* **Company Profile & Opportunities:** Manage company details, post internship opportunities (defining title, mode [On-site/Hybrid/Remote], stipend, duration, vacancies, location, eligibility criteria, application deadline).
* **Selection Workflow:** Review applicants, shortlist candidates, issue selection decisions (Select/Reject), and upload/verify offer documents.
* **Internship Supervision:** Monitor assigned interns, view and verify student attendance logs, assign tasks, set deadlines, grade deliverables, submit weekly/monthly evaluations, and confirm internship completion.

### 4.3 Faculty Mentor
* **Mentee Management:** View list of assigned students across departments.
* **Monitoring & Feedback:** Monitor student daily attendance, review work logs, inspect task submissions, review weekly/monthly progress, provide feedback comments, and conduct faculty performance evaluations.
* **Completion Approval:** Recommend/approve internship completion and review certificate verification status.

### 4.4 Training & Placement Officer (TPO)
* **Institutional Governance:** Oversee institution-wide internship operations, verify student offer letters/records before internship activation, monitor student selection statuses, and manage pending verifications.
* **Analytics & Placement Insights:** Access institutional statistics on active internships, company involvement, department participation, stipend statistics, completion rates, PPO conversion rates, and placement readiness metrics.

### 4.5 Head of Department (HOD)
* **Department Oversight:** Access department-scoped visibility for students, active internships, attendance rates, work progress, mentor evaluations, completion approvals, and pending verifications.
* **Dynamic Scope Enforcement:** HOD access MUST be dynamically restricted to the authenticated HOD's actual department (`department_id`). Hardcoded department values or client-side filtering are strictly prohibited.

### 4.6 College Administrator / System Admin
* **System Administration:** Manage users, assign roles, configure institution-level parameters, system governance, view global audit logs, manage companies, and enforce security controls.

---

## 5. Core Functional Requirements

| Requirement ID | Module | Functional Description |
| :--- | :--- | :--- |
| **FR-01** | **Authentication & RBAC** | System shall authenticate users via email/password and enforce strict Role-Based Access Control (Student, Company Mentor, Faculty Mentor, TPO, HOD, Admin). |
| **FR-02** | **Student Profile** | System shall store and maintain academic metrics (CGPA, backlogs, department, semester), professional skills, certifications, and resume files. |
| **FR-03** | **Eligibility Engine** | System shall automatically evaluate student eligibility against internship posting requirements (CGPA, backlogs, department, year), explicitly outputting `Eligible` or `Not Eligible` with detailed reasons. |
| **FR-04** | **Internship Posting** | Company mentors shall create internship listings with title, description, duration, mode, stipend, vacancies, work location coordinates, eligibility rules, and deadlines. |
| **FR-05** | **Application & Selection** | Students shall apply to eligible postings. Company mentors shall review, shortlist, and mark candidates as Selected or Rejected. |
| **FR-06** | **Offer & TPO Verification** | Selected students shall receive an offer record/document. TPO MUST verify the offer details before the internship becomes active. |
| **FR-07** | **Faculty Assignment** | TPO/Admin shall assign a qualified Faculty Mentor to every verified active internship. |
| **FR-08** | **Real GPS Attendance** | System shall capture device/browser GPS location, compare it against the configured work location geofence radius, enforce duplicate check-in prevention, and record a single authoritative timestamped entry. |
| **FR-09** | **Work Logs** | Students shall submit daily work log entries detailing activities performed during the internship. |
| **FR-10** | **Task Management** | Company and Faculty mentors shall assign tasks with deadlines. Students shall update progress and submit work deliverables for review and grading. |
| **FR-11** | **Progress Aggregation** | System shall aggregate attendance percentage, work log counts, task completion rates, and mentor ratings into weekly and monthly progress scores. |
| **FR-12** | **Dual Evaluation** | Company Mentors and Faculty Mentors shall independently submit standardized performance evaluations linked to the master internship record. |
| **FR-13** | **Completion Approval** | System shall require completion verification from both mentors before transitioning an internship to `Completed`. |
| **FR-14** | **Document Tracking** | System shall track offer letters, acceptance forms, weekly reports, completion certificates, and PPO letters with status tracking. |
| **FR-15** | **Certificate Verification** | System shall process external completion certificates through an automated AI pipeline (File validation, SHA-256 hash, OCR text extraction, anomaly detection, trust scoring, advisory AI recommendation) followed by authoritative human review. |
| **FR-16** | **PPO Tracking** | System shall track Pre-Placement Offer statuses, offered designation, and CTC figures for completed internships. |
| **FR-17** | **Institutional Analytics** | System shall render real-time dashboards for TPO, HOD, and Admin using live database queries covering applications, attendance, completion, stipends, and PPO rates. |

---

## 6. AI Requirements & Capabilities

AI features in InterTrack act as **explainable, advisory assistants**. AI outputs serve to guide human decision-makers and summarize complex datasets; they do **NOT** silently make authoritative institutional decisions.

### AI Feature 1: Certificate Analyzer (Verification Engine)
- **Pipeline:** Document Upload → File Validation → SHA-256 Hashing → Duplicate Check → OCR Text Extraction → Field Extraction → Issuer Evidence Check → Anomaly Signal Detection → Trust Score Computation (0-100%) → Advisory AI Recommendation → Authoritative Human Review.
- **Output:** Extracted candidate name, issuer, dates, certificate ID/QR information, anomaly report, trust score, and recommendation (`AUTO_VERIFIED`, `MANUAL_REVIEW`, `SUSPICIOUS`).
- **Authority Rule:** AI recommendation is advisory; authorized human review (Faculty/TPO/HOD/Admin) is authoritative.

### AI Feature 2: Monthly AI Summary
- **Inputs:** Attendance percentage, work log frequency, task completion rates, mentor ratings, and evaluation comments.
- **Output:** Concise natural language summary of completed work, student performance highlights, identified skill gaps/issues, and actionable recommendations for the upcoming month.

### AI Feature 3: Internship Risk Monitor
- **Inputs:** Attendance trend degradation, work log inactivity, overdue tasks, missing mentor evaluations, and verification delays.
- **Output:** Categorized risk status (`NORMAL`, `ATTENTION NEEDED`, `HIGH ATTENTION`) accompanied by transparent, explainable factors triggering the risk state.

---

## 7. Security & Data Isolation Architecture

1. **Authentication:** Managed securely via Supabase Auth with JWT session tokens.
2. **Database Row Level Security (RLS):** All database tables MUST enforce PostgreSQL RLS policies:
   - **Student:** Can only read/write their own profiles, applications, attendance, work logs, and tasks.
   - **Company Mentor:** Can only access applicants and interns assigned to their company (`company_id`).
   - **Faculty Mentor:** Can only access students assigned to them (`faculty_id`).
   - **HOD:** Dynamically scoped strictly to their authenticated department (`department_id`).
   - **TPO:** Institutional read/write scope for internship governance and analytics.
   - **Admin:** Global access for system operations and user management.
3. **Audit Logging:** Critical actions (login, application approval, attendance verification, task grading, evaluation submission, certificate verification, status changes) MUST record timestamped audit logs.
4. **Secret Security:** Backend keys (e.g., Google Gemini API key, Supabase Service Role Key) MUST be stored strictly in server-side environment variables and **never** exposed in client-side `VITE_` bundles.

---

## 8. Data Integrity & Single Source of Truth

To prevent data fragmentation and sync errors, InterTrack mandates strict **Single Source of Truth** rules:

- **ONE Attendance Record:** A single `attendance` table row per student per date. Student, Faculty Mentor, Company Mentor, and HOD all query and update the exact same underlying record.
- **ONE Master Internship Record:** The `internships` table serves as the sole source of truth connecting student, company, faculty mentor, company mentor, start/end dates, and status.
- **No Duplicate Tables:** Creation of redundant, role-specific duplicate tables (e.g., separate student attendance vs mentor attendance tables) is strictly prohibited.

---

## 9. Non-Functional Requirements (NFRs)

- **User Interface:** Modern, clean, responsive layout built with React, Vite, and Tailwind CSS.
- **Performance:** Dynamic pages and dashboard charts MUST load efficiently using indexed database queries.
- **Resilience:** Explicit loading, empty, and error fallback states across all UI views.
- **Persistence:** 100% real database persistence via Supabase PostgreSQL; no hardcoded or mock client-side state.
- **Auditability & Traceability:** Full record provenance for certificates, evaluations, and offer approvals.

---

## 10. MVP Priority Matrix

| Priority Level | Phase & Scope |
| :--- | :--- |
| **P0 — Essential (Core MVP)** | Auth & RBAC, Student Profile, Eligibility Engine, Opportunity Posting, Application & Selection, Offer Upload & TPO Verification, Faculty Assignment, GPS Attendance, Work Logs, Tasks, Progress Aggregation, Dual Evaluation, Completion Approval, Digital Certificate Generation & External AI Certificate Verification, HOD/TPO Analytics, Security & RLS Policies. |
| **P1 — High Priority** | Gemini Monthly AI Summaries, Gemini Internship Risk Monitor, Advanced Analytics Filters, PPO Workflow Tracking, Document Workflow Enhancements. |
| **P2 — Secondary Enhancements** | AI Resume Scoring, AI Skill Gap Analysis, Automated Company Recommendation Engine, In-App Chat Support, Automated Email Notifications. |

---

## 11. Success Criteria

The product is successful when an evaluator or judge can complete **ONE continuous, unified student journey** on real database infrastructure:

```text
Student Profile Creation 
  ➜ Eligibility Verification 
  ➜ Internship Discovery 
  ➜ Application Submission 
  ➜ Company Selection 
  ➜ Offer Letter Upload 
  ➜ TPO Verification 
  ➜ Faculty Mentor Assignment 
  ➜ GPS Geofenced Attendance 
  ➜ Daily Work Logs 
  ➜ Task Submissions 
  ➜ Monthly Progress Aggregation 
  ➜ Company & Faculty Dual Evaluation 
  ➜ Internship Completion 
  ➜ AI Certificate Verification & Human Review 
  ➜ PPO Tracking 
  ➜ Institutional Analytics Update
```

---

## 12. Product Principles

1. **Working Connected MVP Over Feature Quantity:** Prioritize deep, working end-to-end flows over shallow isolated features.
2. **Single Source of Truth:** One unified database model across all user roles.
3. **Real Data Persistence:** No fake, temporary, or unpersisted demo shortcuts.
4. **Human Institutional Authority:** AI advises and assists; humans make binding decisions.
5. **Database-Enforced Security:** Security boundaries enforced via Supabase RLS policies, not just UI route guards.
6. **Component Reuse:** Build modular, reusable UI components and services.

---
**End of PRD.md Source of Truth Document**
