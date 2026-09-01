import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from './Icon';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSync } from '../../features/orders/sync/useSync';

interface SideNavProps {
  onNavigate?: () => void;
}

export function SideNav({ onNavigate }: SideNavProps) {
  const { user, logout } = useAuth();
  const { pending, failed } = useSync();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const queued = pending + failed;

  const signOut = async () => {
    setConfirmLogout(false);
    onNavigate?.();
    await logout();
  };

  return (
    <div className="nav">
      <div className="nav__user">
        <span className="nav__avatar">
          <Icon name="user" size={20} />
        </span>
        <div className="nav__info">
          <strong>{user?.name}</strong>
          <p>
            {user?.role}
            {user?.zone ? ` · ${user.zone}` : ''}
          </p>
        </div>
      </div>

      <NavLink to="/" end className="nav__item" onClick={onNavigate}>
        <Icon name="order" size={18} />
        Registrar pedido
      </NavLink>

      <NavLink to="/pendientes" className="nav__item" onClick={onNavigate}>
        <Icon name="list" size={18} />
        Pendientes
        {queued > 0 && <span className="nav__badge">{queued}</span>}
      </NavLink>

      <button
        type="button"
        className="nav__item nav__item--logout"
        onClick={() => (queued > 0 ? setConfirmLogout(true) : signOut())}
      >
        <Icon name="logout" size={18} />
        Cerrar sesión
      </button>

      <ConfirmDialog
        open={confirmLogout}
        title="¿Cerrar sesión?"
        danger
        confirmLabel="Cerrar sesión"
        message={
          <>
            Quedan <strong>{queued}</strong> pedido{queued === 1 ? '' : 's'} sin sincronizar. Se
            mantienen guardados en este dispositivo, pero solo podrán enviarse cuando vuelvas a
            iniciar sesión con la misma cuenta.
          </>
        }
        onCancel={() => setConfirmLogout(false)}
        onConfirm={signOut}
      />
    </div>
  );
}
