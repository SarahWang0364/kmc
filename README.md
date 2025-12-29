# Kurt's Mathematics Centre (KMC) - Management System

A comprehensive MERN stack application for managing a tutoring centre with student, teacher, and admin functionalities.

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
kmc/
├── backend/           # Express server
│   ├── config/       # Database and other configurations
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── server.js     # Entry point
├── frontend/         # React application
│   ├── public/       # Static files
│   └── src/          # React components and pages
└── instructions.md   # Project requirements
```

## Prerequisites

- Node.js (v18 or higher recommended, though v20+ is ideal)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Clone the repository
2. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

## Configuration

### Backend (.env)
Create a `.env` file in the `backend` directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kmc
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=no-reply-KMC@hotmail.com
EMAIL_PASSWORD=your_email_password_here
NODE_ENV=development
```

### Frontend (.env)
Create a `.env` file in the `frontend` directory with:
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run separately:
```bash
# Backend only (runs on http://localhost:5000)
npm run dev:backend

# Frontend only (runs on http://localhost:5173)
npm run dev:frontend
```

### Production Mode

```bash
# Backend
npm run start:backend

# Frontend (build and preview)
npm run start:frontend
```

## Default Admin Account

- Email: admin@kmc.com
- Password: Kurt2389

## Features

- User management (Student, Teacher, Admin)
- Term and progress tracking
- Class scheduling and management
- Attendance tracking
- Homework and test management
- Detention system
- Timetable view (calendar-based)
- Follow-up task management
- Email notifications

## User Types

1. **Student**: View classes, homework, test marks, book detentions
2. **Teacher**: Manage classes, attendance, homework, assign detentions
3. **Admin**: Full system access, user management, reporting

## Development Notes

- The backend server runs on port 5000 by default
- The frontend development server runs on port 5173 by default
- MongoDB should be running locally or configure MongoDB Atlas URI
- Update email credentials in backend .env for email functionality
