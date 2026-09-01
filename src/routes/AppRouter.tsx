import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { RequireAuth } from '../features/auth/guards/RequireAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { OrderFormPage } from '../features/orders/pages/OrderFormPage';
import { PendingPage } from '../features/orders/pages/PendingPage';
import { useAutoSync } from '../features/orders/sync/useSync';

export function AppRouter() {
  const { isAuthenticated } = useAuth();
  useAutoSync(isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<OrderFormPage />} />
        <Route path="/pendientes" element={<PendingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
