import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin, requireTeacher, requireStudent }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (requireTeacher && !(user?.isTeacher || user?.isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  if (requireStudent && !user?.isStudent) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
