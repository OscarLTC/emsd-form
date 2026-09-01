import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RequireAuth() {
  const { autenticado, inicializando } = useAuth();
  const location = useLocation();

  if (inicializando) return <div className="cargando">Cargando…</div>;
  if (!autenticado) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}
