## EduAI Frontend – User Manual

Welcome to EduAI. This manual explains how to install, configure, and use the application across all roles: Student, Teacher, Parent, and Admin.

Table of Contents
- Getting Started
- Accounts and Authentication
- Navigation Overview
- Role Guides
  - Student
  - Teacher
  - Parent
  - Admin
- Data Management
  - Importing CSVs
  - Exporting Data
- Real‑Time Features
- Settings and Theming
- Troubleshooting
- FAQs
- Support

### Getting Started

Prerequisites
- Node.js 18+ and npm 9+
- Expo CLI (optional for local dev)

Install
1. Open a terminal in the project directory.
2. Run: `npm install`

Run (Web)
1. Ensure the backend URL is configured (see Configuration).
2. Start: `npm run web`
3. Open the printed local URL in your browser.

Run (iOS/Android via Expo)
1. Start: `npm start`
2. Use the Expo DevTools to run on a simulator or device.

Configuration
- API Base URL is controlled by the following (in priority order):
  - Environment variable `EXPO_PUBLIC_API_BASE_URL` (or `NEXT_PUBLIC_API_BASE_URL` on web)
  - Defaults in `config/environment.js`:
    - Development: `http://localhost:3001/api/v1`
    - Production: `https://eduai-backend-t7ow.onrender.com/api/v1`
 
Environment Variables (examples)
- macOS/Linux (one-time for a session):
  - `export EXPO_PUBLIC_API_BASE_URL="https://your-backend.example.com/api/v1"`
- Cross-platform using `.env` (with Expo):
  - Create `.env` and add `EXPO_PUBLIC_API_BASE_URL=https://your-backend.example.com/api/v1`
  - Restart the dev server.
 
Build
- Web production build: `npm run build:web`
- Expo production build (EAS): follow your EAS workflow; ensure env vars are set in your build profile.

### Accounts and Authentication

Login
1. Open the login screen.
2. Enter your email and password.
3. Click Sign In.

Password Rules
- Minimum 6 characters.

Logout
- Use the profile/menu option to log out. Tokens are cleared from secure storage.

Session
- The app stores access and refresh tokens and keeps you signed in until you log out or tokens expire.

Role-Based Access
- After successful login, the app tailors navigation and available screens to your role.
- Typical routes:
  - Student: course list, submissions, announcements
  - Teacher: classes, attendance, assessments, announcements
  - Parent: child dashboard, attendance, announcements
  - Admin: user management, imports, oversight

### Navigation Overview

- The app adapts navigation based on your role after login.
- A loading screen appears while the session is validated.

### Role Guides

Student
- View courses, assessments, and announcements.
- Submit assignments and view submission history.
- Receive real‑time updates for attendance and announcements.

Teacher
- Manage classes and attendance.
- Publish assessments and announcements.
- Review student submissions and histories.

Parent
- View child attendance, announcements, and updates.
- Receive notifications on important events.

Admin
- Manage users, classes, and departments.
- Oversee imports/exports and system configuration.

### Data Management

Importing CSVs
- Use the unified CSV template located at `screens/unified_import_template (2).csv`.
- Required header row (must match exactly):
  `type,first_name,last_name,email,password,role,student_id,department,academic_year,semester,section,grade_level,class_name,room_id,teacher_email,parent_email,parent_phone,parent_relationship,phone,address,date_of_birth,gender,emergency_contact,medical_info,enrollment_date,status`

Common `type` values
- `student`, `teacher`, `parent`, `admin`

Tips
- Ensure emails are unique per user.
- Passwords must meet the minimum length; otherwise, users should reset via the “Forgot password” flow.
- Dates should be ISO format `YYYY-MM-DD` where applicable.

Sample Rows
```
student,Alex,Kim,alex.kim@example.edu,TempPass1,student,STU-1001,CSE,2025-26,1,A,Freshman,CS101,RM-201,teacher1@example.edu,parent1@example.com,+1-555-0100,Mother,+1-555-0101,12 Park Ave,2007-04-12,Male,Eve Kim,None,2025-08-01,active
teacher,Jamie,Lee,jamie.lee@example.edu,TempPass1,teacher,,,,,,,CS101,RM-201,,,,,+1-555-0200,45 Oak St,1985-09-22,Female,,,,active
parent,Eve,Kim,parent1@example.com,TempPass1,parent,,,,,,,,,,,,,+1-555-0101,12 Park Ave,1980-02-02,Female,,,,active
```

Exporting Data
- Use the in‑app export options where available (see admin/teacher dashboards). Exports return CSV files.

### Real‑Time Features

- The app connects to the backend via WebSocket when authenticated.
- Real‑time updates include: attendance changes, new announcements, and published assessments.
- If the network drops, the client automatically attempts to reconnect.
 
Requirements
- A valid login session (access token).
- Backend WebSocket endpoint available at the same base URL.

Indicators
- You will see immediate updates in attendance and notification areas without refreshing.

### Settings and Theming

- Basic theming and spacing are managed in `config/theme.js`.
- Navigation behavior can be configured in `config/navigationConfig.js`.

### Troubleshooting

Cannot Login (401 Unauthorized)
- Verify the email and password are correct for the configured backend.
- Confirm `EXPO_PUBLIC_API_BASE_URL` points to the intended backend.
- If using demo credentials, ensure those users exist on that backend.
 - If users were imported via CSV, confirm their passwords and status are active.

Network Errors
- Check your internet connection.
- Ensure the backend is reachable and CORS is configured.

WebSocket Not Connecting
- Make sure you are logged in; a valid token is required.
- Verify the backend URL and that WebSocket is enabled on the server.

CSV Import Fails
- Confirm the header row exactly matches the provided template.
- Validate required fields for each `type` of user.
 - Ensure date formats are `YYYY-MM-DD` and phone numbers include country code when required.

### FAQs

Q: Where do I change the backend URL?
A: Set `EXPO_PUBLIC_API_BASE_URL` before starting the app, or edit `config/environment.js`.

Q: Do demo logins work out of the box?
A: Only if the target backend has those users seeded. Otherwise, create users or reset passwords.

Q: How are tokens stored?
A: In secure async storage; they are added to requests automatically for protected endpoints.

Q: Can I use the app offline?
A: Limited read-only screens may cache data, but most actions require connectivity.

### Support

- For product issues, open an issue in your repository or contact the system administrator.


