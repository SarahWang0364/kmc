import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layout components
import AdminLayout from './components/admin/AdminLayout';

// Dashboard pages
import AdminHome from './pages/admin/Home';
import Timetable from './pages/admin/Timetable';
import StudentList from './pages/admin/StudentList';
import ClassList from './pages/admin/ClassList';
import ClassroomList from './pages/admin/ClassroomList';
import StaffList from './pages/admin/StaffList';
import TermList from './pages/admin/TermList';
import ProgressList from './pages/admin/ProgressList';
import TopicList from './pages/admin/TopicList';
import DetentionSlots from './pages/admin/DetentionSlots';
import UnbookedDetentions from './pages/admin/UnbookedDetentions';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="students" element={<StudentList />} />
            <Route path="classes" element={<ClassList />} />
            <Route path="classrooms" element={<ClassroomList />} />
            <Route path="staff" element={<StaffList />} />
            <Route path="terms" element={<TermList />} />
            <Route path="progress" element={<ProgressList />} />
            <Route path="topics" element={<TopicList />} />
            <Route path="detention-slots" element={<DetentionSlots />} />
            <Route path="unbooked-detentions" element={<UnbookedDetentions />} />
          </Route>

          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute requireTeacher>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/*"
            element={
              <ProtectedRoute requireStudent>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
