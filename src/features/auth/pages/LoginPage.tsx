import { Navigate, useLocation } from 'react-router-dom';
import { env } from '../../../config/env';
import { Icon } from '../../../shared/components/Icon';
import { useOnlineStatus } from '../../../core/network/useOnlineStatus';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const online = useOnlineStatus();
  const location = useLocation();
  const target = (location.state as { from?: string } | null)?.from ?? '/';

  if (isAuthenticated) return <Navigate to={target} replace />;

  return (
    <div className="login-page">
      <div className="login">
        <div className="login__brand">
          <span className="login__logo">
            <Icon name="truck" size={30} />
          </span>
          <h1>{env.appName}</h1>
          <p>Registro manual de pedidos</p>
        </div>

        <LoginForm />

        {!online && (
          <p className="notice notice--error">
            <Icon name="noSignal" size={18} />
            Sin conexión. Necesitas señal para iniciar sesión; una vez dentro, la sesión queda
            guardada en el dispositivo.
          </p>
        )}
      </div>
    </div>
  );
}
