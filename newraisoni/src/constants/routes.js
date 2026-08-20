export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  UNAUTHORIZED: '/unauthorized',
  VERIFY_CERTIFICATE: '/verify-certificate/:certificateId',

  // Role Portals
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_ELIGIBILITY: '/student/eligibility',
  STUDENT_INTERNSHIPS: '/student/internships/browse',
  STUDENT_APPLICATIONS: '/student/applications',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_WORK_LOGS: '/student/work-logs',
  STUDENT_TASKS: '/student/tasks',
  STUDENT_PROGRESS: '/student/progress',
  STUDENT_FEEDBACK: '/student/feedback',
  STUDENT_CERTIFICATE: '/student/certificate',

  FACULTY_DASHBOARD: '/faculty/dashboard',
  FACULTY_ATTENDANCE: '/faculty/attendance-logs',
  FACULTY_WORK_LOGS: '/faculty/work-logs',
  FACULTY_PROGRESS: '/faculty/student-progress',
  FACULTY_EVALUATION: '/faculty/evaluate-student',

  COMPANY_DASHBOARD: '/company/dashboard',
  COMPANY_POSTINGS: '/company/postings',
  COMPANY_POSTING_CREATE: '/company/postings/create',
  COMPANY_APPLICANTS: '/company/applicants',
  COMPANY_ATTENDANCE: '/company/attendance-verification',
  COMPANY_TASKS: '/company/tasks',
  COMPANY_EVALUATION: '/company/evaluate-intern',

  TPO_DASHBOARD: '/tpo/dashboard',
  TPO_OFFER_VERIFICATION: '/tpo/offer-verification',
  TPO_FACULTY_ASSIGNMENT: '/tpo/faculty-assignment',
  TPO_PPO_RECORDS: '/tpo/ppo-records',
  TPO_CERTIFICATE_VERIFICATION: '/tpo/certificate-verification',

  HOD_DASHBOARD: '/hod/dashboard',
  HOD_ATTENDANCE: '/hod/attendance',
  HOD_PROGRESS: '/hod/department-progress',

  ADMIN_DASHBOARD: '/admin/dashboard',
};
