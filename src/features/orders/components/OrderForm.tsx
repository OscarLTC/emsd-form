import { Field } from '../../../shared/components/Field';
import { Icon } from '../../../shared/components/Icon';
import { SuccessDialog } from '../../../shared/components/SuccessDialog';
import { ResultSelector } from './ResultSelector';
import { PhotoEvidence } from './PhotoEvidence';
import { reasonsFor } from '../../../config/catalogs/reasons';
import { useOrderForm } from '../hooks/useOrderForm';
import { FIELD_LIMITS } from '../constants/fieldLimits';

export function OrderForm() {
  const {
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
  } = useOrderForm();

  const reasons = reasonsFor(values.result);

  return (
    <form className="form" onSubmit={submit} noValidate>
      {submitError && (
        <p className="notice notice--full notice--error" role="status">
          <Icon name="alert" size={18} />
          {submitError}
        </p>
      )}

      <Field icon="order" label="Pedido" htmlFor="orderNumber" error={errors.orderNumber}>
        <input
          id="orderNumber"
          value={values.orderNumber}
          onChange={(event) => update('orderNumber', event.target.value)}
          placeholder="#PED-000123"
          autoComplete="off"
          inputMode="text"
          maxLength={FIELD_LIMITS.orderNumber}
        />
      </Field>

      <Field
        icon="location"
        label="Cliente / Dirección"
        htmlFor="customer"
        error={errors.customer ?? errors.address}
      >
        <input
          id="customer"
          value={values.customer}
          onChange={(event) => update('customer', event.target.value)}
          placeholder="Nombre del cliente"
          autoComplete="off"
          maxLength={FIELD_LIMITS.customer}
        />
        <input
          id="address"
          value={values.address}
          onChange={(event) => update('address', event.target.value)}
          placeholder="Dirección de entrega"
          autoComplete="off"
          maxLength={FIELD_LIMITS.address}
        />
      </Field>

      <Field icon="flag" label="Resultado" error={errors.result} full>
        <ResultSelector value={values.result} onChange={changeResult} />
      </Field>

      {reasons.length > 0 && (
        <Field icon="reason" label="Motivo" htmlFor="reason" error={errors.reason} full>
          <select
            id="reason"
            value={values.reason}
            onChange={(event) => update('reason', event.target.value)}
          >
            <option value="">Selecciona un motivo</option>
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field icon="camera" label="Fotos (evidencia)">
        <PhotoEvidence photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
      </Field>

      <Field icon="comment" label="Comentario breve" htmlFor="comment" error={errors.comment}>
        <textarea
          id="comment"
          value={values.comment}
          onChange={(event) => update('comment', event.target.value)}
          placeholder="Escribe un comentario breve…"
          maxLength={FIELD_LIMITS.comment}
        />
      </Field>

      <div className="form__actions">
        <button type="submit" className="button" disabled={isSaving}>
          <Icon name="send" size={18} />
          {isSaving ? 'Guardando…' : 'Enviar'}
        </button>
      </div>

      {outcome && (
        <SuccessDialog
          title={`Pedido ${outcome.orderNumber} registrado`}
          detail={
            outcome.sent
              ? 'Ya se envió al servidor.'
              : 'Quedó guardado en el dispositivo y se enviará solo al recuperar señal.'
          }
          onClose={closeOutcome}
        />
      )}
    </form>
  );
}
