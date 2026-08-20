import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CompanyMentorRegisterPage } from '../pages/auth/CompanyMentorRegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Portal Dashboards
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentEligibilityPage } from '../pages/student/StudentEligibilityPage';
import { InternshipBrowsePage } from '../pages/student/InternshipBrowsePage';
import { StudentApplicationsPage } from '../pages/student/StudentApplicationsPage';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage';
import { StudentWorkLogsPage } from '../pages/student/StudentWorkLogsPage';
import { StudentTasksPage } from '../pages/student/StudentTasksPage';
import { StudentProgressPage } from '../pages/student/StudentProgressPage';
import { StudentFeedbackPage } from '../pages/student/StudentFeedbackPage';
import { StudentCertificatePage } from '../pages/student/StudentCertificatePage';

import { FacultyDashboardPage } from '../pages/faculty/FacultyDashboardPage';
import { FacultyAttendanceLogsPage } from '../pages/faculty/FacultyAttendanceLogsPage';
import { FacultyWorkLogsPage } from '../pages/faculty/FacultyWorkLogsPage';
import { FacultyStudentProgressPage } from '../pages/faculty/FacultyStudentProgressPage';
import { FacultyEvaluationPage } from '../pages/faculty/FacultyEvaluationPage';

import { CompanyDashboardPage } from '../pages/company/CompanyDashboardPage';
import { CompanyPostingsPage } from '../pages/company/CompanyPostingsPage';
import { PostingCreatePage } from '../pages/company/PostingCreatePage';
import { CompanyApplicantsPage } from '../pages/company/CompanyApplicantsPage';
import { CompanyAttendancePage } from '../pages/company/CompanyAttendancePage';
import { CompanyTasksPage } from '../pages/company/CompanyTasksPage';
import { CompanyEvaluationPage } from '../pages/company/CompanyEvaluationPage';

import { TPODashboardPage } from '../pages/tpo/TPODashboardPage';
import { TPOOfferVerificationPage } from '../pages/tpo/TPOOfferVerificationPage';
import { TPOFacultyAssignmentPage } from '../pages/tpo/TPOFacultyAssignmentPage';
import { TPOPPOPage } from '../pages/tpo/TPOPPOPage';
import { TPOCertificateVerificationPage } from '../pages/tpo/TPOCertificateVerificationPage';

import { HODDashboardPage } from '../pages/hod/HODDashboardPage';
import { HODAttendancePage } from '../pages/hod/HODAttendancePage';
import { HODDepartmentProgressPage } from '../pages/hod/HODDepartmentProgressPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

// Public Verification Page
import { VerifyCertificatePage } from '../pages/public/VerifyCertificatePage';

// System Pages
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path="/register/company-mentor" element={<CompanyMentorRegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* Public QR Code Certificate Verification Route */}
      <Route path={ROUTES.VERIFY_CERTIFICATE} element={<VerifyCertificatePage />} />

      {/* Protected Student Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboardPage />} />
        <Route path={ROUTES.STUDENT_PROFILE} element={<StudentProfilePage />} />
        <Route path={ROUTES.STUDENT_ELIGIBILITY} element={<StudentEligibilityPage />} />
        <Route path={ROUTES.STUDENT_INTERNSHIPS} element={<InternshipBrowsePage />} />
        <Route path={ROUTES.STUDENT_APPLICATIONS} element={<StudentApplicationsPage />} />
        <Route path={ROUTES.STUDENT_ATTENDANCE} element={<StudentAttendancePage />} />
        <Route path={ROUTES.STUDENT_WORK_LOGS} element={<StudentWorkLogsPage />} />
        <Route path={ROUTES.STUDENT_TASKS} element={<StudentTasksPage />} />
        <Route path={ROUTES.STUDENT_PROGRESS} element={<StudentProgressPage />} />
        <Route path={ROUTES.STUDENT_FEEDBACK} element={<StudentFeedbackPage />} />
        <Route path={ROUTES.STUDENT_CERTIFICATE} element={<StudentCertificatePage />} />
      </Route>

      {/* Protected Faculty Mentor Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.FACULTY]} />}>
        <Route path={ROUTES.FACULTY_DASHBOARD} element={<FacultyDashboardPage />} />
        <Route path={ROUTES.FACULTY_ATTENDANCE} element={<FacultyAttendanceLogsPage />} />
        <Route path={ROUTES.FACULTY_WORK_LOGS} element={<FacultyWorkLogsPage />} />
        <Route path={ROUTES.FACULTY_PROGRESS} element={<FacultyStudentProgressPage />} />
        <Route path={ROUTES.FACULTY_EVALUATION} element={<FacultyEvaluationPage />} />
      </Route>

      {/* Protected Company Mentor Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.COMPANY]} />}>
        <Route path={ROUTES.COMPANY_DASHBOARD} element={<CompanyDashboardPage />} />
        <Route path={ROUTES.COMPANY_POSTINGS} element={<CompanyPostingsPage />} />
        <Route path={ROUTES.COMPANY_POSTING_CREATE} element={<PostingCreatePage />} />
        <Route path={ROUTES.COMPANY_APPLICANTS} element={<CompanyApplicantsPage />} />
        <Route path={ROUTES.COMPANY_ATTENDANCE} element={<CompanyAttendancePage />} />
        <Route path={ROUTES.COMPANY_TASKS} element={<CompanyTasksPage />} />
        <Route path={ROUTES.COMPANY_EVALUATION} element={<CompanyEvaluationPage />} />
      </Route>

      {/* Protected TPO & Admin Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.TPO, ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN]} />}>
        <Route path={ROUTES.TPO_CERTIFICATE_VERIFICATION} element={<TPOCertificateVerificationPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.TPO, ROLES.ADMIN]} />}>
        <Route path={ROUTES.TPO_DASHBOARD} element={<TPODashboardPage />} />
        <Route path={ROUTES.TPO_OFFER_VERIFICATION} element={<TPOOfferVerificationPage />} />
        <Route path={ROUTES.TPO_FACULTY_ASSIGNMENT} element={<TPOFacultyAssignmentPage />} />
        <Route path={ROUTES.TPO_PPO_RECORDS} element={<TPOPPOPage />} />
      </Route>

      {/* Protected HOD Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.HOD]} />}>
        <Route path={ROUTES.HOD_DASHBOARD} element={<HODDashboardPage />} />
        <Route path={ROUTES.HOD_ATTENDANCE} element={<HODAttendancePage />} />
        <Route path={ROUTES.HOD_PROGRESS} element={<HODDepartmentProgressPage />} />
      </Route>

      {/* Protected Admin Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
      </Route>

      {/* System Fallbacks */}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
