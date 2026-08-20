export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  FACULTY_MENTOR: 'faculty_mentor',
  COMPANY: 'company',
  COMPANY_MENTOR: 'company_mentor',
  TPO: 'tpo',
  HOD: 'hod',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Student',
  [ROLES.FACULTY]: 'Faculty Mentor',
  [ROLES.FACULTY_MENTOR]: 'Faculty Mentor',
  [ROLES.COMPANY]: 'Company Mentor',
  [ROLES.COMPANY_MENTOR]: 'Company Mentor',
  [ROLES.TPO]: 'Training & Placement Officer',
  [ROLES.HOD]: 'Head of Department',
  [ROLES.ADMIN]: 'System Administrator',
};

/**
 * Normalizes role strings to standard portal keys ('faculty', 'company', etc.)
 */
export const normalizeRole = (role) => {
  if (!role) return '';
  const r = role.toLowerCase().trim();
  if (r === 'faculty_mentor' || r === 'faculty') return ROLES.FACULTY;
  if (r === 'company_mentor' || r === 'company') return ROLES.COMPANY;
  return r;
};
