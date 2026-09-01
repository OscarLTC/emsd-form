import type { IconName } from '../../../shared/components/Icon';
import type { DeliveryResult } from '../types/order.types';

interface ResultOption {
  value: DeliveryResult;
  label: string;
  icon: IconName;
}

export const RESULTS: ResultOption[] = [
  { value: 'delivered', label: 'Entregado', icon: 'check' },
  { value: 'failed', label: 'Fallido', icon: 'close' },
];

export const RESULT_LABELS: Record<DeliveryResult, string> = {
  delivered: 'Entregado',
  failed: 'Fallido',
};
