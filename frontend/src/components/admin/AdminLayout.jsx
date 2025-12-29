import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchToTeacher = () => {
    navigate('/teacher');
  };

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>KMC Admin</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-link">Home</Link>
          <Link to="/admin/timetable" className="nav-link">Timetable</Link>

          <div className="nav-section">
            <h3>Manage</h3>
            <Link to="/admin/students" className="nav-link">Students</Link>
            <Link to="/admin/classes" className="nav-link">Classes</Link>
            <Link to="/admin/classrooms" className="nav-link">Classrooms</Link>
            <Link to="/admin/staff" className="nav-link">Staff</Link>
            <Link to="/admin/terms" className="nav-link">Terms</Link>
            <Link to="/admin/progress" className="nav-link">Progress</Link>
            <Link to="/admin/topics" className="nav-link">Topics</Link>
          </div>

          <div className="nav-section">
            <h3>Detentions</h3>
            <Link to="/admin/detention-slots" className="nav-link">Slots</Link>
            <Link to="/admin/unbooked-detentions" className="nav-link">Unbooked</Link>
          </div>

          <div className="nav-section">
            <h3>Reports</h3>
            <Link to="/admin/followups" className="nav-link">Followups</Link>
            <Link to="/admin/class-change-log" className="nav-link">Class Changes</Link>
            <Link to="/admin/absence-summary" className="nav-link">Absences</Link>
            <Link to="/admin/operation-history" className="nav-link">History</Link>
          </div>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            {user?.isTeacher && (
              <button onClick={switchToTeacher} className="btn-secondary">
                Switch to Teacher
              </button>
            )}
            <button onClick={handleLogout} className="btn-outline">
              Logout
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
