import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface Props { children: React.ReactNode; }

function AdminRoute({ children }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default AdminRoute;
