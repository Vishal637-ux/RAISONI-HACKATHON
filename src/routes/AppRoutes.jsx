import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';

// Portal Layouts
import { StudentLayout } from '../layouts/StudentLayout';
import { FacultyLayout } from '../layouts/FacultyLayout';
import { CompanyLayout } from '../layouts/CompanyLayout';
import { TPOLayout } from '../layouts/TPOLayout';
import { HODLayout } from '../layouts/HODLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentInternshipPage } from '../pages/student/StudentInternshipPage';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage';
import { StudentWorkLogsPage } from '../pages/student/StudentWorkLogsPage';
import { StudentTasksPage } from '../pages/student/StudentTasksPage';
import { StudentFeedbackPage } from '../pages/student/StudentFeedbackPage';
import { StudentCertificatePage } from '../pages/student/StudentCertificatePage';
import { PublicVerifyCertificatePage } from '../pages/PublicVerifyCertificatePage';

// Dashboard Placeholders
import { FacultyDashboardPage } from '../pages/faculty/FacultyDashboardPage';
import { FacultyInternshipsPage } from '../pages/faculty/FacultyInternshipsPage';
import { FacultyAttendanceLogsPage } from '../pages/faculty/FacultyAttendanceLogsPage';
import { FacultyProgressPage } from '../pages/faculty/FacultyProgressPage';
import { FacultyEvaluationPage } from '../pages/faculty/FacultyEvaluationPage';
import { CompanyDashboardPage } from '../pages/company/CompanyDashboardPage';
import { CompanyTasksPage } from '../pages/company/CompanyTasksPage';
import { CompanyWorkLogsPage } from '../pages/company/CompanyWorkLogsPage';
import { CompanyAttendancePage } from '../pages/company/CompanyAttendancePage';
import { CompanyEvaluationPage } from '../pages/company/CompanyEvaluationPage';
import { CompanyCompletionPage } from '../pages/company/CompanyCompletionPage';
import { CompanyInternDetailPage } from '../pages/company/CompanyInternDetailPage';
// TPO Pages
import { TPODashboardPage } from '../pages/tpo/TPODashboardPage';
import { TPOCompaniesPage } from '../pages/tpo/TPOCompaniesPage';
import { TPOOffersPage } from '../pages/tpo/TPOOffersPage';
import { TPOMouPage } from '../pages/tpo/TPOMouPage';
import { TPOReportsPage } from '../pages/tpo/TPOReportsPage';
import { TPODrivesPage } from '../pages/tpo/TPODrivesPage';
import { TPOStudentsPage } from '../pages/tpo/TPOStudentsPage';
import { TPOSettingsPage } from '../pages/tpo/TPOSettingsPage';
import { HODDashboardPage } from '../pages/hod/HODDashboardPage';
import { HODFacultyPage } from '../pages/hod/HODFacultyPage';
import { HODInternshipsPage } from '../pages/hod/HODInternshipsPage';
import { HODReportsPage } from '../pages/hod/HODReportsPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminLogsPage } from '../pages/admin/AdminLogsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// System Pages
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* Public Routes */}
      <Route path={ROUTES.VERIFY_CERTIFICATE} element={<PublicVerifyCertificatePage />} />
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      </Route>

      {/* Protected Student Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route
          path={ROUTES.STUDENT_DASHBOARD}
          element={
            <StudentLayout>
              <StudentDashboardPage />
            </StudentLayout>
          }
        />
        <Route
          path={ROUTES.STUDENT_PROFILE}
          element={
            <StudentLayout>
              <StudentProfilePage />
            </StudentLayout>
          }
        />
        <Route
          path={ROUTES.STUDENT_INTERNSHIP}
          element={
            <StudentLayout>
              <StudentInternshipPage />
            </StudentLayout>
          }
        />
        <Route
          path={ROUTES.STUDENT_ATTENDANCE}
          element={
            <StudentLayout>
              <StudentAttendancePage />
            </StudentLayout>
          }
        />
        <Route
          path={ROUTES.STUDENT_WORK_LOGS}
          element={
            <StudentLayout>
              <StudentWorkLogsPage />
            </StudentLayout>
          }
        />
        <Route
          path={ROUTES.STUDENT_TASKS}
          element={
            <StudentLayout>
              <StudentTasksPage />
            </StudentLayout>
          }
        />
        <Route
          path={ROUTES.STUDENT_FEEDBACK}
          element={
            <StudentLayout>
              <StudentFeedbackPage />
            </StudentLayout>
          }
        />
        <Route
          path={ROUTES.STUDENT_CERTIFICATE}
          element={
            <StudentLayout>
              <StudentCertificatePage />
            </StudentLayout>
          }
        />
      </Route>

      {/* Protected Faculty Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.FACULTY]} />}>
        <Route
          path={ROUTES.FACULTY_DASHBOARD}
          element={
            <FacultyLayout>
              <FacultyDashboardPage />
            </FacultyLayout>
          }
        />
        <Route
          path={ROUTES.FACULTY_INTERNSHIPS}
          element={
            <FacultyLayout>
              <FacultyInternshipsPage />
            </FacultyLayout>
          }
        />
        <Route
          path={ROUTES.FACULTY_ATTENDANCE_LOGS}
          element={
            <FacultyLayout>
              <FacultyAttendanceLogsPage />
            </FacultyLayout>
          }
        />
        <Route
          path={ROUTES.FACULTY_PROGRESS}
          element={
            <FacultyLayout>
              <FacultyProgressPage />
            </FacultyLayout>
          }
        />
        <Route
          path={ROUTES.FACULTY_EVALUATION}
          element={
            <FacultyLayout>
              <FacultyEvaluationPage />
            </FacultyLayout>
          }
        />
      </Route>

      {/* Protected Company Mentor Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.COMPANY]} />}>
        <Route
          path={ROUTES.COMPANY_DASHBOARD}
          element={
            <CompanyLayout>
              <CompanyDashboardPage />
            </CompanyLayout>
          }
        />
        <Route
          path={ROUTES.COMPANY_TASKS}
          element={
            <CompanyLayout>
              <CompanyTasksPage />
            </CompanyLayout>
          }
        />
        <Route
          path={ROUTES.COMPANY_TASK_REVIEWS}
          element={
            <CompanyLayout>
              <CompanyWorkLogsPage />
            </CompanyLayout>
          }
        />
        <Route
          path={ROUTES.COMPANY_ATTENDANCE}
          element={
            <CompanyLayout>
              <CompanyAttendancePage />
            </CompanyLayout>
          }
        />
        <Route
          path={ROUTES.COMPANY_EVALUATION}
          element={
            <CompanyLayout>
              <CompanyEvaluationPage />
            </CompanyLayout>
          }
        />
        <Route
          path={ROUTES.COMPANY_COMPLETION}
          element={
            <CompanyLayout>
              <CompanyCompletionPage />
            </CompanyLayout>
          }
        />
        <Route
          path={ROUTES.COMPANY_INTERN_DETAIL}
          element={
            <CompanyLayout>
              <CompanyInternDetailPage />
            </CompanyLayout>
          }
        />
      </Route>

      {/* Protected TPO Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.TPO]} />}>
        <Route
          path={ROUTES.TPO_DASHBOARD}
          element={
            <TPOLayout>
              <TPODashboardPage />
            </TPOLayout>
          }
        />
        <Route
          path={ROUTES.TPO_COMPANIES}
          element={
            <TPOLayout>
              <TPOCompaniesPage />
            </TPOLayout>
          }
        />
        <Route
          path={ROUTES.TPO_OFFERS}
          element={
            <TPOLayout>
              <TPOOffersPage />
            </TPOLayout>
          }
        />
        <Route
          path={ROUTES.TPO_MOU}
          element={
            <TPOLayout>
              <TPOMouPage />
            </TPOLayout>
          }
        />
        <Route
          path={ROUTES.TPO_REPORTS}
          element={
            <TPOLayout>
              <TPOReportsPage />
            </TPOLayout>
          }
        />
        <Route
          path={ROUTES.TPO_DRIVES}
          element={
            <TPOLayout>
              <TPODrivesPage />
            </TPOLayout>
          }
        />
        <Route
          path={ROUTES.TPO_STUDENTS}
          element={
            <TPOLayout>
              <TPOStudentsPage />
            </TPOLayout>
          }
        />
        <Route
          path={ROUTES.TPO_SETTINGS}
          element={
            <TPOLayout>
              <TPOSettingsPage />
            </TPOLayout>
          }
        />
      </Route>

      {/* Protected HOD Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.HOD]} />}>
        <Route
          path={ROUTES.HOD_DASHBOARD}
          element={
            <HODLayout>
              <HODDashboardPage />
            </HODLayout>
          }
        />
        <Route
          path={ROUTES.HOD_FACULTY}
          element={
            <HODLayout>
              <HODFacultyPage />
            </HODLayout>
          }
        />
        <Route
          path={ROUTES.HOD_INTERNSHIPS}
          element={
            <HODLayout>
              <HODInternshipsPage />
            </HODLayout>
          }
        />
        <Route
          path={ROUTES.HOD_REPORTS}
          element={
            <HODLayout>
              <HODReportsPage />
            </HODLayout>
          }
        />
      </Route>

      {/* Protected Admin Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_LOGS}
          element={
            <AdminLayout>
              <AdminLogsPage />
            </AdminLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          }
        />
      </Route>

      {/* System Fallbacks */}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
