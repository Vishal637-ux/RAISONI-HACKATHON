# MODULE_SPECIFICATION.md

# Module 1 – Authentication

**Project:** AI-Powered Internship Management & Verification System

**Version:** 1.0

**Module Type:** Core Module

---

# PART 2 – Supabase Operations → Business Rules

---

# 7. Supabase Operations

The Authentication Module uses Supabase Authentication and the PostgreSQL database for user authentication, authorization, and session management.

---

## Authentication Operations

### Student Registration

**Supabase Auth**

- signUp()

**Database Operations**

- INSERT into `users`
- INSERT into `student_profiles`

---

### User Login

**Supabase Auth**

- signInWithPassword()

**Database Operations**

- SELECT from `users`

---

### User Logout

**Supabase Auth**

- signOut()

---

### Forgot Password

**Supabase Auth**

- resetPasswordForEmail()

---

### Reset Password

**Supabase Auth**

- updateUser()

---

### Email Verification

**Supabase Auth**

- Verify Email Address
- Activate User Session

---

### Session Management

**Supabase Auth**

- getSession()
- getUser()
- Refresh Session

---

### Database Operations Summary

#### users

- SELECT
- INSERT
- UPDATE

---

#### student_profiles

- INSERT
- SELECT

---

# 8. Validation Rules

All validation must be implemented using **React Hook Form** and **Zod**.

---

## Registration Validation

### Full Name

- Required
- Minimum 3 characters
- Maximum 100 characters

---

### Email

- Required
- Must be a valid email address
- Must be unique

---

### Phone Number

- Required
- Must contain exactly 10 digits
- Only numeric values allowed

---

### Password

- Required
- Minimum 8 characters

---

### Confirm Password

- Required
- Must exactly match Password

---

## Login Validation

### Email

- Required
- Valid email format

---

### Password

- Required

---

## Forgot Password Validation

### Email

- Required
- Valid email format

---

## Reset Password Validation

### New Password

- Required
- Minimum 8 characters

---

### Confirm Password

- Required
- Must match the New Password

---

# 9. Business Rules

The following business rules are derived from the PRD and Architecture.

---

## Registration Rules

- Only Students can register through the Registration page.
- Faculty Mentor accounts are created by the College Administrator.
- Company Mentor accounts are created by the College Administrator.
- Training & Placement Officer (TPO) accounts are created by the College Administrator.
- Head of Department (HOD) accounts are created by the College Administrator.
- College Administrator accounts are created by the system or an existing administrator.

---

## Authentication Rules

- Every user must authenticate before accessing protected modules.
- Every user has exactly one assigned role.
- Authentication is handled using Supabase Authentication.
- User sessions are maintained using JWT authentication.

---

## Authorization Rules

- Users can access only the modules permitted by their assigned role.
- Protected routes require a valid authenticated session.
- Unauthorized users must not be allowed to access protected routes.

---

## Email Verification Rules

- Newly registered students must verify their email address before using the platform.
- Email verification is managed through Supabase Authentication.

---

## Password Rules

- Password reset is available only for registered users.
- Password reset requires email verification.
- Users must create a new password before logging in again after a successful reset.

---

## Session Rules

- Active sessions must remain valid until logout or expiration.
- Expired sessions require the user to log in again.
- Logout immediately invalidates the current session.

---

**End of Part 2**