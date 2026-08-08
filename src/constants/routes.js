import { ROLES } from './roles';

export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_CERTIFICATE: '/verify-certificate/:certificateId',

  // Role Protected Dashboards
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_INTERNSHIP: '/student/internship',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_WORK_LOGS: '/student/work-logs',
  STUDENT_TASKS: '/student/tasks',
  STUDENT_FEEDBACK: '/student/feedback',
  STUDENT_CERTIFICATE: '/student/certificate',
  FACULTY_DASHBOARD: '/faculty/dashboard',
  FACULTY_INTERNSHIPS: '/faculty/internships',
  FACULTY_ATTENDANCE_LOGS: '/faculty/attendance-logs',
  FACULTY_PROGRESS: '/faculty/progress',
  FACULTY_EVALUATION: '/faculty/evaluation',
  COMPANY_DASHBOARD: '/company/dashboard',
  COMPANY_INTERNS: '/company/interns',
  COMPANY_TASKS: '/company/tasks',
  COMPANY_TASK_REVIEWS: '/company/task-reviews',
  COMPANY_ATTENDANCE: '/company/attendance',
  COMPANY_EVALUATION: '/company/evaluation',
  COMPANY_COMPLETION: '/company/completion',
  COMPANY_RECOMMENDATIONS: '/company/recommendations',
  COMPANY_INTERN_DETAIL: '/company/intern/:id',
  TPO_DASHBOARD: '/tpo/dashboard',
  TPO_COMPANIES: '/tpo/companies',
  TPO_OFFERS: '/tpo/offers',
  TPO_MOU: '/tpo/mou',
  TPO_REPORTS: '/tpo/reports',
  TPO_DRIVES: '/tpo/drives',
  TPO_STUDENTS: '/tpo/students',
  TPO_SETTINGS: '/tpo/settings',
  HOD_DASHBOARD: '/hod/dashboard',
  HOD_FACULTY: '/hod/faculty',
  HOD_INTERNSHIPS: '/hod/internships',
  HOD_REPORTS: '/hod/reports',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_SETTINGS: '/admin/settings',

  // Fallback / System Routes
  UNAUTHORIZED: '/unauthorized',
};

// Helper mapping role to default home route
export const DEFAULT_ROLE_ROUTES = {
  [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
  [ROLES.FACULTY]: ROUTES.FACULTY_DASHBOARD,
  [ROLES.COMPANY]: ROUTES.COMPANY_DASHBOARD,
  [ROLES.TPO]: ROUTES.TPO_DASHBOARD,
  [ROLES.HOD]: ROUTES.HOD_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
};
