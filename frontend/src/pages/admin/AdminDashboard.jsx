import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>This is the admin dashboard. Full features will be implemented in Phase 3.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
