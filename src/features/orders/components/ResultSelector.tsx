import { Icon } from '../../../shared/components/Icon';
import { RESULTS } from '../constants/results';
import type { DeliveryResult } from '../types/order.types';

interface ResultSelectorProps {
  value: DeliveryResult | '';
  onChange: (result: DeliveryResult) => void;
}

export function ResultSelector({ value, onChange }: ResultSelectorProps) {
  return (
    <div className="results" role="radiogroup" aria-label="Resultado">
      {RESULTS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={`result result--${option.value} ${value === option.value ? 'result--active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <Icon name={option.icon} size={22} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
