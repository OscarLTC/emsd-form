import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { env } from '../../../config/env';
import { requiresReason } from '../../../config/catalogs/reasons';
import { createId } from '../../../core/utils/id';
import { useOnlineStatus } from '../../../core/network/useOnlineStatus';
import { useAuth } from '../../auth/hooks/useAuth';
import { syncService } from '../sync/syncService';
import { FIELD_LIMITS } from '../constants/fieldLimits';
import type { DeliveryResult, EvidencePhoto, QueueItem } from '../types/order.types';

interface FormValues {
  orderNumber: string;
  customer: string;
  address: string;
  result: DeliveryResult | '';
  reason: string;
  comment: string;
}

/** What the courier is shown once the record is already stored. */
export interface SubmitOutcome {
  orderNumber: string;
  /** There was a connection while registering, so it went straight to the server. */
  sent: boolean;
}

const INITIAL_VALUES: FormValues = {
  orderNumber: '',
  customer: '',
  address: '',
  result: '',
  reason: '',
  comment: '',
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const tooLong = (value: string, limit: number) => value.trim().length > limit;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.orderNumber.trim()) errors.orderNumber = 'Ingresa el número de pedido';
  else if (tooLong(values.orderNumber, FIELD_LIMITS.orderNumber))
    errors.orderNumber = `Máximo ${FIELD_LIMITS.orderNumber} caracteres`;

  if (!values.customer.trim()) errors.customer = 'Ingresa el cliente';
  else if (tooLong(values.customer, FIELD_LIMITS.customer))
    errors.customer = `Máximo ${FIELD_LIMITS.customer} caracteres`;

  if (!values.address.trim()) errors.address = 'Ingresa la dirección';
  else if (tooLong(values.address, FIELD_LIMITS.address))
    errors.address = `Máximo ${FIELD_LIMITS.address} caracteres`;

  if (tooLong(values.comment, FIELD_LIMITS.comment))
    errors.comment = `Máximo ${FIELD_LIMITS.comment} caracteres`;

  if (!values.result) errors.result = 'Selecciona un resultado';
  if (requiresReason(values.result) && !values.reason) errors.reason = 'Selecciona un motivo';

  return errors;
}

export function useOrderForm() {
  const { user } = useAuth();
  const online = useOnlineStatus();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);

  const update = useCallback(<K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError(null);
  }, []);

  const addPhotos = useCallback((incoming: EvidencePhoto[]) => {
    setPhotos((previous) => [...previous, ...incoming].slice(0, env.photo.maxCount));
    setSubmitError(null);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((previous) => previous.filter((photo) => photo.id !== id));
  }, []);

  const changeResult = useCallback((result: DeliveryResult) => {
    setValues((previous) => ({ ...previous, result, reason: '' }));
    setErrors((previous) => ({ ...previous, result: undefined, reason: undefined }));
    setSubmitError(null);
  }, []);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = validate(values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0 || !user) return;

      setIsSaving(true);
      const item: QueueItem = {
        id: createId(),
        record: {
          orderNumber: values.orderNumber.trim(),
          customer: values.customer.trim(),
          address: values.address.trim(),
          result: values.result as DeliveryResult,
          reason: values.reason,
          comment: values.comment.trim(),
          recordedAt: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
        },
        photos,
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        lastError: null,
      };

      try {
        await syncService.enqueue(item);
        // The form is cleared only when the confirmation closes: clearing it
        // here would leave the courier looking at a blank screen without
        // knowing whether what they typed was stored.
        setOutcome({ orderNumber: item.record.orderNumber, sent: online });
      } catch {
        setSubmitError('No se pudo guardar el pedido en el dispositivo.');
      } finally {
        setIsSaving(false);
      }
    },
    [values, photos, user, online],
  );

  const closeOutcome = useCallback(() => {
    setOutcome(null);
    setValues(INITIAL_VALUES);
    setPhotos([]);
    setErrors({});
  }, []);

  return {
    values,
    photos,
    errors,
    isSaving,
    submitError,
    outcome,
    update,
    changeResult,
    addPhotos,
    removePhoto,
    submit,
    closeOutcome,
  };
}
