import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useOnlineStatus } from '../../core/network/useOnlineStatus';
import { useSync } from '../../features/pedidos/sync/useSync';

/**
 * Estado de la cola de envíos.
 *
 * Solo aparece cuando hay algo que contar: sin conexión o con pedidos por
 * sincronizar. Cuando todo está al día no se muestra nada, porque un cartel que
 * aparece y desaparece con cada registro distrae, y el repartidor siempre puede
 * registrar, tenga señal o no.
 */
export function BarraSincronizacion() {
  const online = useOnlineStatus();
  const { pendientes, fallidos, sincronizando } = useSync();
  const navegar = useNavigate();
  const enCola = pendientes + fallidos;

  if (online && enCola === 0) return null;

  const estado = !online ? 'offline' : sincronizando ? 'activo' : 'pendiente';

  const textos: Record<typeof estado, string> = {
    offline:
      enCola > 0
        ? `Sin conexión · ${enCola} en cola, se envían al volver la señal`
        : 'Sin conexión · puedes seguir registrando',
    activo: 'Sincronizando pedidos…',
    pendiente: `${enCola} pedido${enCola === 1 ? '' : 's'} por sincronizar`,
  };

  return (
    <button
      type="button"
      className={`barra-sync barra-sync--${estado}`}
      onClick={() => navegar('/pendientes')}
      disabled={enCola === 0}
    >
      <Icon name={!online ? 'sinSenal' : sincronizando ? 'sincronizar' : 'reloj'} size={16} />
      <span>{textos[estado]}</span>
    </button>
  );
}
