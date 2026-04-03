import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface Props {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default ProtectedRoute;
