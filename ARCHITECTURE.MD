# ARCHITECTURE.MD

# AI-Powered Internship Management & Verification System

Version: 1.0

Architecture Type: Monolithic Web Application

Frontend: React (Vite)

Backend: Supabase

Database: PostgreSQL (Supabase)

Authentication: Supabase Auth

Storage: Supabase Storage

Deployment: Vercel + Supabase

---

# 1. Project Overview

The AI-Powered Internship Management & Verification System is a centralized web application designed to digitize the complete internship lifecycle. The platform connects students, faculty mentors, company mentors, Training & Placement Officers (TPO), HODs, and college administrators into a single internship ecosystem.

The system enables internship application, attendance management, task submission, mentor feedback, AI-based performance analytics, QR-code based certificate verification, and comprehensive dashboards for monitoring internship progress.

The architecture follows a modern full-stack web application using React (Vite) as the frontend and Supabase as the backend platform, providing authentication, PostgreSQL database, storage, and APIs.

---

# 2. Technology Stack

## Frontend

### React (Vite)

Purpose

- Build modern Single Page Applications (SPA)
- Fast rendering
- Component-based architecture

Why?

- Lightweight
- Fast Development
- Excellent Community Support
- Beginner Friendly

---

### Tailwind CSS

Purpose

- User Interface Design

Why?

- Responsive
- Utility-first CSS
- Faster UI Development
- Easy Customization

---

### React Router DOM

Purpose

- Client-side Routing

Features

- Nested Routes
- Protected Routes
- Dynamic Routes

---

### React Hook Form

Purpose

- Form Management

Used In

- Registration
- Login
- Internship Application
- Attendance Submission
- Task Submission

---

### Zod

Purpose

- Form Validation

Used For

- Email Validation
- Phone Validation
- Password Rules
- Required Fields

---

### Lucide React

Purpose

- Icons

Used For

- Dashboard
- Sidebar
- Buttons
- Navigation

---

### React Hot Toast

Purpose

- Notifications

Examples

- Login Successful
- Attendance Submitted
- Task Uploaded
- Certificate Generated

---

## Backend

### Supabase

Purpose

Backend-as-a-Service

Provides

- Authentication
- PostgreSQL Database
- REST APIs
- Storage
- Row Level Security
- Real-time Database

Why?

- No custom backend required
- Easy to integrate
- Free Tier
- Perfect for Hackathons

---

## Database

### PostgreSQL

Hosted on Supabase

Benefits

- Relational Database
- ACID Compliance
- SQL Support
- Secure
- Scalable

---

## Authentication

### Supabase Auth

Authentication Methods

- Email & Password
- JWT Authentication
- Email Verification
- Password Reset  


Role-Based Access Control

- Student
- Faculty Mentor
- Company Mentor
- Training & Placement Officer
- HOD
- College Administrator

---

## Storage

### Supabase Storage

Purpose

Store all uploaded files securely.

Used For

- Student Profile Photos
- Student Resumes
- Internship Reports
- Task Attachments
- Digital Internship Certificates


## Charts

### Recharts

Used For

- Performance Dashboard
- Attendance Reports
- Placement Analytics
- Department Analytics

---

## QR Code

Libraries

- qrcode
- html5-qrcode

Used For

- Certificate Generation
- Certificate Verification

---

## AI Integration

Version 1

- Rule-Based Performance Analysis
- Skill Gap Analysis
- Placement Readiness Score

Future

- OpenAI API
- Google Gemini API

---

## Deployment

Frontend

- Vercel

Backend

- Supabase

Database

- PostgreSQL (Supabase)

Storage

- Supabase Storage

---

# 3. High-Level System Architecture

```

Student

Faculty Mentor

Company Mentor

Training & Placement Officer (TPO)

Head of Department (HOD)
 

College Administrator 

↓

React (Vite)

↓

React Router DOM

↓

Supabase Authentication

↓

Role-Based Access Control (RBAC)

↓

Supabase PostgreSQL Database

↓

Supabase Storage

↓

AI Analytics Engine

↓

Certificate Generator

↓

QR Code Verification

↓

Dashboards & Reports

```

---

# Architecture Layers

## Presentation Layer

Responsible for

- User Interface
- Forms
- Dashboards
- Reports
- Charts

Technology

- React
- Tailwind CSS

---

## Application Layer

Responsible for

- Business Logic
- Validation
- Authentication
- Navigation
- Permissions

Technology

- React
- React Router
- React Hook Form
- Zod

---

## Backend Layer

Responsible for

- Authentication
- Database Operations
- Storage
- APIs

Technology

- Supabase

---

## Database Layer

Responsible for

- User Data
- Internship Records
- Attendance
- Tasks
- Certificates
- Analytics

Technology

- PostgreSQL

---

## Storage Layer

Responsible for

- File Uploads
- Certificates
- Reports
- Attachments

Technology

- Supabase Storage

---

# 4. Folder Structure

```

project/

│

├── public/

│

├── src/

│

├── assets/

├── components/

├── layouts/

├── pages/

│

├── auth/

├── student/

├── faculty/

├── company/

├── tpo/

├── hod/

├── admin/

│

├── routes/

├── context/

├── hooks/

├── services/

├── supabase/

├── lib/

├── utils/

├── constants/

├── styles/

│

├── App.jsx

├── main.jsx

│

├── .env

├── package.json

└── README.md

```

---

# Folder Description

## assets/

Images

Icons

Logos

Fonts

---

## components/

Reusable Components

- Buttons
- Cards
- Tables
- Charts
- Forms
- Sidebar
- Navbar
- Modal
- Dialog

---

## pages/

Application Pages

- Authentication
- Student Portal
- Faculty Portal
- Company Portal
- TPO Portal
- HOD Portal
- Admin Portal

---

## layouts/

Different Layouts

- Student Layout
- Faculty Layout
- Company Layout
- Admin Layout

---

## routes/

Application Routing

Protected Routes

Public Routes

---

## context/

Global State

- Authentication
- User
- Theme

---

## hooks/

Custom Hooks

- useAuth()
- useUser()
- useAttendance()
- useTasks()

---

## services/

Contains all Supabase service functions and business operations.

---

## supabase/

Supabase Client Configuration  for 

Authentication

Database

Storage

---

## lib/


Shared business logic.

- QR Generator
- AI Analytics
- Validation Helpers
- Common Helpers

## utils/
Common utility functions shared across the application.

---

## constants/

Application constants, enums, and configuration values.

---

## styles/

Global styles and Tailwind CSS configuration.

---

# End of PART 1
