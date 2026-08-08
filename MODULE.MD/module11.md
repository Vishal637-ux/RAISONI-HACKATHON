# MODULE_SPECIFICATION.md

# Module 1 – Authentication

**Project:** AI-Powered Internship Management & Verification System

**Version:** 1.0

**Module Type:** Core Module

---

# PART 1 – Module Overview → Database

---

# 1. Module Overview

## Purpose

The Authentication Module is the entry point of the AI-Powered Internship Management & Verification System. It securely authenticates users, manages user sessions, enforces Role-Based Access Control (RBAC), and ensures that every authenticated user can access only the modules and features permitted by their assigned role.

The module uses **Supabase Authentication** and integrates with the **users** and **student_profiles** tables defined in the Architecture document.

## Objectives

- Authenticate users securely using Supabase Authentication.
- Register new student accounts.
- Support email verification.
- Allow users to reset forgotten passwords.
- Maintain secure user sessions.
- Redirect users to the correct dashboard after successful login.
- Restrict access using Role-Based Access Control (RBAC).
- Protect all secured application routes.

## Scope

- Student Registration
- User Login
- Logout
- Forgot Password
- Password Reset
- Email Verification
- Session Management
- Public Routes
- Protected Routes
- Role-Based Access Control (RBAC)

---

# 2. User Roles

## Student

### Permissions

- Register
- Login
- Logout
- Reset Password
- Verify Email

### Restrictions

- Cannot access Faculty Portal
- Cannot access Company Portal
- Cannot access TPO Portal
- Cannot access HOD Portal
- Cannot access College Administrator Portal

---

## Faculty Mentor

### Permissions

- Login
- Logout
- Reset Password

### Restrictions

- Cannot register from the frontend.
- Account is created by the College Administrator.

---

## Company Mentor

### Permissions

- Login
- Logout
- Reset Password

### Restrictions

- Cannot register from the frontend.
- Account is created by the College Administrator.

---

## Training & Placement Officer (TPO)

### Permissions

- Login
- Logout
- Reset Password

### Restrictions

- Cannot register from the frontend.
- Account is created by the College Administrator.

---

## Head of Department (HOD)

### Permissions

- Login
- Logout
- Reset Password

### Restrictions

- Cannot register from the frontend.
- Account is created by the College Administrator.

---

## College Administrator

### Permissions

- Login
- Logout
- Reset Password

### Restrictions

- Cannot register from the frontend.
- Account is created by the system or an existing administrator.

---

# 3. Pages / Screens

| Route | Purpose |
|------|---------|
| /login | Authenticate registered users |
| /register | Register new student accounts |
| /forgot-password | Request password reset |
| /verify-email | Verify student email |
| /reset-password | Create a new password |

---

# 4. Screen Details

## Login Screen

### Data Displayed

- Email
- Password
- Remember Me
- Login Button
- Forgot Password Link
- Register Link

### User Actions

- Login
- Navigate to Register
- Navigate to Forgot Password

---

## Register Screen

### Data Displayed

- Full Name
- Email
- Phone Number
- Password
- Confirm Password
- Register Button

### User Actions

- Register Student Account
- Send Verification Email

---

## Forgot Password Screen

### Data Displayed

- Email Address
- Send Reset Link Button

### User Actions

- Request Password Reset

---

## Email Verification Screen

### Data Displayed

- Verification Status
- Continue Button

### User Actions

- Verify Email
- Continue to Login

---

## Reset Password Screen

### Data Displayed

- New Password
- Confirm Password
- Reset Password Button

### User Actions

- Update Password

---

# 5. React Components

## Page Components

- LoginPage
- RegisterPage
- ForgotPasswordPage
- VerifyEmailPage
- ResetPasswordPage

## Reusable Components

- Button
- Input
- PasswordInput
- Checkbox
- Card
- Alert
- LoadingSpinner
- Toast

## Form Components

- LoginForm
- RegisterForm
- ForgotPasswordForm
- ResetPasswordForm

## Layout Components

- AuthLayout

## Route Guards

- PublicRoute
- ProtectedRoute

---

# 6. Database

## Table: users

### Purpose

Stores authentication and role information.

### Columns Used

- id
- email
- full_name
- role
- phone
- status
- created_at
- updated_at

---

## Table: student_profiles

### Purpose

Stores student profile information created after successful registration.

### Columns Used

- id
- user_id
- resume_url
- profile_photo_url

---

## Relationships

```text
users
│
└── student_profiles
      │
      └── user_id → users.id
```

---

**End of Part 1**
