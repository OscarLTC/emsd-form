import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../../shared/components/Layout';
import { DialogoConfirmacion } from '../../../shared/components/DialogoConfirmacion';
import { Icon } from '../../../shared/components/Icon';
import { useOnlineStatus } from '../../../core/network/useOnlineStatus';
import { outboxRepository } from '../repository/outboxRepository';
import { syncService } from '../sync/syncService';
import { useSync } from '../sync/useSync';
import { ETIQUETAS_RESULTADO } from '../constants/resultados';
import type { ItemCola } from '../types/pedido.types';

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function PendientesPage() {
  const [items, setItems] = useState<ItemCola[]>([]);
  const [aDescartar, setADescartar] = useState<ItemCola | null>(null);
  const { pendientes, fallidos, sincronizando } = useSync();
  const online = useOnlineStatus();
  const navegar = useNavigate();

  useEffect(() => {
    let vigente = true;
    outboxRepository.listar().then((lista) => {
      if (vigente) setItems(lista);
    });
    return () => {
      vigente = false;
    };
  }, [pendientes, fallidos, sincronizando]);

  return (
    <Layout titulo="Pedidos por sincronizar" onAtras={() => navegar('/')}>
      <div className="cola__panel">
        <button
          type="button"
          className="boton boton--secundario"
          onClick={() => syncService.sincronizar({ forzarFallidos: true })}
          disabled={!online || sincronizando || items.length === 0}
        >
          <Icon name="sincronizar" size={18} />
          {sincronizando ? 'Sincronizando…' : 'Reintentar ahora'}
        </button>

        {items.length === 0 ? (
          <p className="cola__vacia">No hay pedidos en cola.</p>
        ) : (
          <ul className="cola">
            {items.map((item) => (
              <li key={item.id} className={`cola__item cola__item--${item.estado}`}>
                <div className="cola__cabecera">
                  <strong>{item.registro.numeroPedido}</strong>
                  <span className={`chip chip--${item.registro.resultado}`}>
                    {ETIQUETAS_RESULTADO[item.registro.resultado]}
                  </span>
                </div>
                <p className="cola__cliente">
                  {item.registro.cliente} · {item.registro.direccion}
                </p>
                <p className="cola__meta">
                  <Icon name="reloj" size={14} />
                  {formatoFecha.format(new Date(item.creadoEn))}
                  {item.fotos.length > 0 && ` · ${item.fotos.length} foto(s)`}
                  {item.intentos > 0 && ` · ${item.intentos} intento(s)`}
                </p>
                {item.estado === 'error' && item.ultimoError && (
                  <p className="cola__error">
                    <Icon name="alerta" size={14} />
                    {item.ultimoError}
                  </p>
                )}
                <button
                  type="button"
                  className="cola__descartar"
                  onClick={() => setADescartar(item)}
                >
                  <Icon name="papelera" size={15} />
                  Descartar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DialogoConfirmacion
        abierto={aDescartar !== null}
        titulo="¿Descartar este pedido?"
        peligroso
        textoConfirmar="Descartar"
        mensaje={
          <>
            El pedido <strong>{aDescartar?.registro.numeroPedido}</strong> de{' '}
            <strong>{aDescartar?.registro.cliente}</strong> todavía no llegó al servidor
            {aDescartar && aDescartar.fotos.length > 0
              ? `, y sus ${aDescartar.fotos.length} foto(s) de evidencia se perderán con él.`
              : '.'}{' '}
            Se borrará del dispositivo y no habrá forma de recuperarlo.
          </>
        }
        onCancelar={() => setADescartar(null)}
        onConfirmar={async () => {
          const id = aDescartar?.id;
          setADescartar(null);
          if (id) await syncService.descartar(id);
        }}
      />
    </Layout>
  );
}
