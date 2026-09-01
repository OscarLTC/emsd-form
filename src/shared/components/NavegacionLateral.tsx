import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DialogoConfirmacion } from './DialogoConfirmacion';
import { Icon } from './Icon';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSync } from '../../features/pedidos/sync/useSync';

interface NavegacionLateralProps {
  onNavegar?: () => void;
}

export function NavegacionLateral({ onNavegar }: NavegacionLateralProps) {
  const { usuario, logout } = useAuth();
  const { pendientes, fallidos } = useSync();
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const enCola = pendientes + fallidos;

  const salir = async () => {
    setConfirmarSalida(false);
    onNavegar?.();
    await logout();
  };

  return (
    <div className="nav">
      <div className="nav__usuario">
        <span className="nav__avatar">
          <Icon name="usuario" size={20} />
        </span>
        <div className="nav__datos">
          <strong>{usuario?.nombre}</strong>
          <p>
            {usuario?.rol}
            {usuario?.zona ? ` · ${usuario.zona}` : ''}
          </p>
        </div>
      </div>

      <NavLink to="/" end className="nav__item" onClick={onNavegar}>
        <Icon name="pedido" size={18} />
        Registrar pedido
      </NavLink>

      <NavLink to="/pendientes" className="nav__item" onClick={onNavegar}>
        <Icon name="lista" size={18} />
        Pendientes
        {enCola > 0 && <span className="nav__contador">{enCola}</span>}
      </NavLink>

      <button
        type="button"
        className="nav__item nav__item--salir"
        onClick={() => (enCola > 0 ? setConfirmarSalida(true) : salir())}
      >
        <Icon name="salir" size={18} />
        Cerrar sesión
      </button>

      <DialogoConfirmacion
        abierto={confirmarSalida}
        titulo="¿Cerrar sesión?"
        peligroso
        textoConfirmar="Cerrar sesión"
        mensaje={
          <>
            Quedan <strong>{enCola}</strong> pedido{enCola === 1 ? '' : 's'} sin sincronizar. Se
            mantienen guardados en este dispositivo, pero solo podrán enviarse cuando vuelvas a
            iniciar sesión con la misma cuenta.
          </>
        }
        onCancelar={() => setConfirmarSalida(false)}
        onConfirmar={salir}
      />
    </div>
  );
}
