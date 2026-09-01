import type { ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface CampoProps {
  icono: IconName;
  etiqueta: string;
  htmlFor?: string;
  error?: string;
  completo?: boolean;
  children: ReactNode;
}

export function Campo({ icono, etiqueta, htmlFor, error, completo, children }: CampoProps) {
  return (
    <div className={completo ? 'campo campo--completo' : 'campo'}>
      <label className="campo__etiqueta" htmlFor={htmlFor}>
        <Icon name={icono} size={17} />
        {etiqueta}
      </label>
      {children}
      {error && <p className="campo__error">{error}</p>}
    </div>
  );
}
