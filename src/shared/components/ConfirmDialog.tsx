import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <button type="button" className="dialog__backdrop" onClick={onCancel} aria-label="Cancelar" />
      <div className="dialog__panel">
        <span className={`dialog__icon ${danger ? 'dialog__icon--danger' : ''}`}>
          <Icon name="alert" size={22} />
        </span>
        <h2 id="dialog-title">{title}</h2>
        <div className="dialog__message">{message}</div>
        <div className="dialog__actions">
          <button type="button" className="button button--secondary" onClick={onCancel} ref={cancelRef}>
            Cancelar
          </button>
          <button
            type="button"
            className={danger ? 'button button--danger' : 'button'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
