import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>This is the teacher dashboard. Full features will be implemented in Phase 6.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default TeacherDashboard;
