import { Campo } from '../../../shared/components/Campo';
import { Icon } from '../../../shared/components/Icon';
import { ModalConfirmacion } from '../../../shared/components/ModalConfirmacion';
import { ResultadoSelector } from './ResultadoSelector';
import { FotoEvidencia } from './FotoEvidencia';
import { motivosDe } from '../../../config/catalogos/motivos';
import { usePedidoForm } from '../hooks/usePedidoForm';

export function PedidoForm() {
  const {
    valores,
    fotos,
    errores,
    guardando,
    errorEnvio,
    confirmacion,
    actualizar,
    cambiarResultado,
    agregarFotos,
    quitarFoto,
    enviar,
    cerrarConfirmacion,
  } = usePedidoForm();

  const motivos = motivosDe(valores.resultado);

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      {errorEnvio && (
        <p className="aviso aviso--completo aviso--error" role="status">
          <Icon name="alerta" size={18} />
          {errorEnvio}
        </p>
      )}

      <Campo icono="pedido" etiqueta="Pedido" htmlFor="numeroPedido" error={errores.numeroPedido}>
        <input
          id="numeroPedido"
          value={valores.numeroPedido}
          onChange={(evento) => actualizar('numeroPedido', evento.target.value)}
          placeholder="#PED-000123"
          autoComplete="off"
          inputMode="text"
        />
      </Campo>

      <Campo
        icono="ubicacion"
        etiqueta="Cliente / Dirección"
        htmlFor="cliente"
        error={errores.cliente ?? errores.direccion}
      >
        <input
          id="cliente"
          value={valores.cliente}
          onChange={(evento) => actualizar('cliente', evento.target.value)}
          placeholder="Nombre del cliente"
          autoComplete="off"
        />
        <input
          id="direccion"
          value={valores.direccion}
          onChange={(evento) => actualizar('direccion', evento.target.value)}
          placeholder="Dirección de entrega"
          autoComplete="off"
        />
      </Campo>

      <Campo icono="bandera" etiqueta="Resultado" error={errores.resultado} completo>
        <ResultadoSelector valor={valores.resultado} onCambiar={cambiarResultado} />
      </Campo>

      {motivos.length > 0 && (
        <Campo icono="motivo" etiqueta="Motivo" htmlFor="motivo" error={errores.motivo} completo>
          <select
            id="motivo"
            value={valores.motivo}
            onChange={(evento) => actualizar('motivo', evento.target.value)}
          >
            <option value="">Selecciona un motivo</option>
            {motivos.map((motivo) => (
              <option key={motivo} value={motivo}>
                {motivo}
              </option>
            ))}
          </select>
        </Campo>
      )}

      <Campo icono="camara" etiqueta="Fotos (evidencia)">
        <FotoEvidencia fotos={fotos} onAgregar={agregarFotos} onQuitar={quitarFoto} />
      </Campo>

      <Campo icono="comentario" etiqueta="Comentario breve" htmlFor="comentario">
        <textarea
          id="comentario"
          value={valores.comentario}
          onChange={(evento) => actualizar('comentario', evento.target.value)}
          placeholder="Escribe un comentario breve…"
          maxLength={280}
        />
      </Campo>

      <div className="formulario__acciones">
        <button type="submit" className="boton" disabled={guardando}>
          <Icon name="enviar" size={18} />
          {guardando ? 'Guardando…' : 'Enviar'}
        </button>
      </div>

      {confirmacion && (
        <ModalConfirmacion
          titulo={`Pedido ${confirmacion.numeroPedido} registrado`}
          detalle={
            confirmacion.enviado
              ? 'Ya se envió al servidor.'
              : 'Quedó guardado en el dispositivo y se enviará solo al recuperar señal.'
          }
          onCerrar={cerrarConfirmacion}
        />
      )}
    </form>
  );
}
