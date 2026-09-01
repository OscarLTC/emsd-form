import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useOnlineStatus } from '../../core/network/useOnlineStatus';
import { useSync } from '../../features/orders/sync/useSync';

/**
 * State of the outbox queue.
 *
 * It only shows up when there is something to report: offline, or with orders
 * waiting to sync. When everything is up to date nothing is rendered, because a
 * banner that appears and disappears on every registration is distracting, and
 * the courier can always register whether there is signal or not.
 */
export function SyncBar() {
  const online = useOnlineStatus();
  const { pending, failed, isSyncing } = useSync();
  const navigate = useNavigate();
  const queued = pending + failed;

  if (online && queued === 0) return null;

  const state = !online ? 'offline' : isSyncing ? 'active' : 'pending';

  const labels: Record<typeof state, string> = {
    offline:
      queued > 0
        ? `Sin conexión · ${queued} en cola, se envían al volver la señal`
        : 'Sin conexión · puedes seguir registrando',
    active: 'Sincronizando pedidos…',
    pending: `${queued} pedido${queued === 1 ? '' : 's'} por sincronizar`,
  };

  return (
    <button
      type="button"
      className={`sync-bar sync-bar--${state}`}
      onClick={() => navigate('/pendientes')}
      disabled={queued === 0}
    >
      <Icon name={!online ? 'noSignal' : isSyncing ? 'sync' : 'clock'} size={16} />
      <span>{labels[state]}</span>
    </button>
  );
}
