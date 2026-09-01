import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface DialogoConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: ReactNode;
  textoConfirmar?: string;
  peligroso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function DialogoConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligroso = false,
  onConfirmar,
  onCancelar,
}: DialogoConfirmacionProps) {
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;

    cancelarRef.current?.focus();
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCancelar();
    };

    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div className="dialogo" role="dialog" aria-modal="true" aria-labelledby="dialogo-titulo">
      <button type="button" className="dialogo__fondo" onClick={onCancelar} aria-label="Cancelar" />
      <div className="dialogo__panel">
        <span className={`dialogo__icono ${peligroso ? 'dialogo__icono--peligro' : ''}`}>
          <Icon name="alerta" size={22} />
        </span>
        <h2 id="dialogo-titulo">{titulo}</h2>
        <div className="dialogo__mensaje">{mensaje}</div>
        <div className="dialogo__acciones">
          <button type="button" className="boton boton--secundario" onClick={onCancelar} ref={cancelarRef}>
            Cancelar
          </button>
          <button
            type="button"
            className={peligroso ? 'boton boton--peligro' : 'boton'}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
