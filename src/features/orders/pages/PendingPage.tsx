import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../../shared/components/Layout';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { Icon } from '../../../shared/components/Icon';
import { useOnlineStatus } from '../../../core/network/useOnlineStatus';
import { outboxRepository } from '../repository/outboxRepository';
import { syncService } from '../sync/syncService';
import { useSync } from '../sync/useSync';
import { RESULT_LABELS } from '../constants/results';
import type { QueueItem } from '../types/order.types';

const dateFormat = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function PendingPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [toDiscard, setToDiscard] = useState<QueueItem | null>(null);
  const { pending, failed, isSyncing } = useSync();
  const online = useOnlineStatus();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    outboxRepository.list().then((list) => {
      if (active) setItems(list);
    });
    return () => {
      active = false;
    };
  }, [pending, failed, isSyncing]);

  return (
    <Layout title="Pedidos por sincronizar" onBack={() => navigate('/')}>
      <div className="queue__panel">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => syncService.sync({ retryFailed: true })}
          disabled={!online || isSyncing || items.length === 0}
        >
          <Icon name="sync" size={18} />
          {isSyncing ? 'Sincronizando…' : 'Reintentar ahora'}
        </button>

        {items.length === 0 ? (
          <p className="queue__empty">No hay pedidos en cola.</p>
        ) : (
          <ul className="queue">
            {items.map((item) => (
              <li key={item.id} className={`queue__item queue__item--${item.status}`}>
                <div className="queue__header">
                  <strong>{item.record.orderNumber}</strong>
                  <span className={`chip chip--${item.record.result}`}>
                    {RESULT_LABELS[item.record.result]}
                  </span>
                </div>
                <p className="queue__customer">
                  {item.record.customer} · {item.record.address}
                </p>
                <p className="queue__meta">
                  <Icon name="clock" size={14} />
                  {dateFormat.format(new Date(item.createdAt))}
                  {item.photos.length > 0 && ` · ${item.photos.length} foto(s)`}
                  {item.attempts > 0 && ` · ${item.attempts} intento(s)`}
                </p>
                {item.status === 'error' && item.lastError && (
                  <p className="queue__error">
                    <Icon name="alert" size={14} />
                    {item.lastError}
                  </p>
                )}
                <button
                  type="button"
                  className="queue__discard"
                  onClick={() => setToDiscard(item)}
                >
                  <Icon name="trash" size={15} />
                  Descartar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={toDiscard !== null}
        title="¿Descartar este pedido?"
        danger
        confirmLabel="Descartar"
        message={
          <>
            El pedido <strong>{toDiscard?.record.orderNumber}</strong> de{' '}
            <strong>{toDiscard?.record.customer}</strong> todavía no llegó al servidor
            {toDiscard && toDiscard.photos.length > 0
              ? `, y sus ${toDiscard.photos.length} foto(s) de evidencia se perderán con él.`
              : '.'}{' '}
            Se borrará del dispositivo y no habrá forma de recuperarlo.
          </>
        }
        onCancel={() => setToDiscard(null)}
        onConfirm={async () => {
          const id = toDiscard?.id;
          setToDiscard(null);
          if (id) await syncService.discard(id);
        }}
      />
    </Layout>
  );
}
