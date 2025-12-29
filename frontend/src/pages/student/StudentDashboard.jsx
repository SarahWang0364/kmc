import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Student Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>This is the student dashboard. Full features will be implemented in Phase 7.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default StudentDashboard;
