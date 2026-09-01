import type { ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface FieldProps {
  icon: IconName;
  label: string;
  htmlFor?: string;
  error?: string;
  full?: boolean;
  children: ReactNode;
}

export function Field({ icon, label, htmlFor, error, full, children }: FieldProps) {
  return (
    <div className={full ? 'field field--full' : 'field'}>
      <label className="field__label" htmlFor={htmlFor}>
        <Icon name={icon} size={17} />
        {label}
      </label>
      {children}
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
