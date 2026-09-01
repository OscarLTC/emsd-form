import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { RequireAuth } from '../features/auth/guards/RequireAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { PedidoFormPage } from '../features/pedidos/pages/PedidoFormPage';
import { PendientesPage } from '../features/pedidos/pages/PendientesPage';
import { useSincronizacionAutomatica } from '../features/pedidos/sync/useSync';

export function AppRouter() {
  const { autenticado } = useAuth();
  useSincronizacionAutomatica(autenticado);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<PedidoFormPage />} />
        <Route path="/pendientes" element={<PendientesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
