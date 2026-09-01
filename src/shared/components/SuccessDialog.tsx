import { useEffect } from 'react';
import { Icon } from './Icon';

interface SuccessDialogProps {
  title: string;
  detail: string;
  buttonLabel?: string;
  onClose: () => void;
}

/**
 * Confirmation for an action that already completed.
 *
 * It interrupts the flow on purpose: the courier has to acknowledge it before
 * continuing, so there is no doubt about whether the record was stored.
 */
export function SuccessDialog({
  title,
  detail,
  buttonLabel = 'Registrar otro',
  onClose,
}: SuccessDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" className="modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <div className="modal__panel">
        <span className="modal__icon">
          <Icon name="check" size={30} />
        </span>
        <h2 className="modal__title" id="modal-title">
          {title}
        </h2>
        <p className="modal__detail">{detail}</p>
        <button type="button" className="button" onClick={onClose} autoFocus>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
