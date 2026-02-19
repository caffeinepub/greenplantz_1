import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../hooks/useQueries';
import AdminDashboard from '../pages/AdminDashboard';

export default function ProtectedAdminRoute() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useGetCallerUserRole();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    } else if (!isLoading && isAdmin !== 'admin') {
      navigate({ to: '/' });
    }
  }, [identity, isAdmin, isLoading, navigate]);

  if (!identity || isLoading) return null;
  if (isAdmin !== 'admin') return null;

  return <AdminDashboard />;
}
