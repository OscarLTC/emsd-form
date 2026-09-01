import { useEffect } from 'react';
import { Icon } from './Icon';

interface ModalConfirmacionProps {
  titulo: string;
  detalle: string;
  textoBoton?: string;
  onCerrar: () => void;
}

/**
 * Confirmación de una acción que ya se completó.
 *
 * Corta el flujo a propósito: el repartidor tiene que darle a "Entendido" para
 * seguir, así no queda dudando si el registro se guardó o no.
 */
export function ModalConfirmacion({
  titulo,
  detalle,
  textoBoton = 'Registrar otro',
  onCerrar,
}: ModalConfirmacionProps) {
  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <button type="button" className="modal__fondo" aria-label="Cerrar" onClick={onCerrar} />
      <div className="modal__panel">
        <span className="modal__icono">
          <Icon name="check" size={30} />
        </span>
        <h2 className="modal__titulo" id="modal-titulo">
          {titulo}
        </h2>
        <p className="modal__detalle">{detalle}</p>
        <button type="button" className="boton" onClick={onCerrar} autoFocus>
          {textoBoton}
        </button>
      </div>
    </div>
  );
}
