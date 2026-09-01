import type { DeliveryResult } from '../../features/orders/types/order.types';

/**
 * Reasons the courier can pick depending on the delivery result.
 *
 * They live outside the feature because they are an administrable catalog: the
 * idea is that they will eventually be managed from the backoffice and arrive
 * over the API. Until that exists they stay here as a constant, so there is a
 * single place to add, remove or reorder them without touching the form.
 *
 * A result with no reasons does not ask for one: the field disappears from the
 * form and stops being required.
 */
export const REASONS: Partial<Record<DeliveryResult, string[]>> = {
  failed: [
    'Cliente ausente',
    'Local cerrado',
    'Dirección incorrecta',
    'Rechazo del cliente',
    'Zona inaccesible',
  ],
};

export const reasonsFor = (result: DeliveryResult | ''): string[] =>
  result ? (REASONS[result] ?? []) : [];

export const requiresReason = (result: DeliveryResult | ''): boolean => reasonsFor(result).length > 0;
