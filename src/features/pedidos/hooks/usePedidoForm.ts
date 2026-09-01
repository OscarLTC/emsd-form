import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { env } from '../../../config/env';
import { requiereMotivo } from '../../../config/catalogos/motivos';
import { createId } from '../../../core/utils/id';
import { useOnlineStatus } from '../../../core/network/useOnlineStatus';
import { useAuth } from '../../auth/hooks/useAuth';
import { syncService } from '../sync/syncService';
import type { EvidenciaFoto, ItemCola, Resultado } from '../types/pedido.types';

interface ValoresFormulario {
  numeroPedido: string;
  cliente: string;
  direccion: string;
  resultado: Resultado | '';
  motivo: string;
  comentario: string;
}

/** Lo que se le muestra al repartidor cuando el registro ya quedó guardado. */
export interface Confirmacion {
  numeroPedido: string;
  /** Había conexión al registrar, así que salió de una vez al servidor. */
  enviado: boolean;
}

const VALORES_INICIALES: ValoresFormulario = {
  numeroPedido: '',
  cliente: '',
  direccion: '',
  resultado: '',
  motivo: '',
  comentario: '',
};

type Errores = Partial<Record<keyof ValoresFormulario, string>>;

function validar(valores: ValoresFormulario): Errores {
  const errores: Errores = {};
  if (!valores.numeroPedido.trim()) errores.numeroPedido = 'Ingresa el número de pedido';
  if (!valores.cliente.trim()) errores.cliente = 'Ingresa el cliente';
  if (!valores.direccion.trim()) errores.direccion = 'Ingresa la dirección';
  if (!valores.resultado) errores.resultado = 'Selecciona un resultado';
  if (requiereMotivo(valores.resultado) && !valores.motivo) errores.motivo = 'Selecciona un motivo';
  return errores;
}

export function usePedidoForm() {
  const { usuario } = useAuth();
  const online = useOnlineStatus();
  const [valores, setValores] = useState<ValoresFormulario>(VALORES_INICIALES);
  const [fotos, setFotos] = useState<EvidenciaFoto[]>([]);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);

  const actualizar = useCallback(<C extends keyof ValoresFormulario>(campo: C, valor: ValoresFormulario[C]) => {
    setValores((previos) => ({ ...previos, [campo]: valor }));
    setErrores((previos) => ({ ...previos, [campo]: undefined }));
    setErrorEnvio(null);
  }, []);

  const agregarFotos = useCallback((nuevas: EvidenciaFoto[]) => {
    setFotos((previas) => [...previas, ...nuevas].slice(0, env.photo.maxCount));
    setErrorEnvio(null);
  }, []);

  const quitarFoto = useCallback((id: string) => {
    setFotos((previas) => previas.filter((foto) => foto.id !== id));
  }, []);

  const cambiarResultado = useCallback(
    (resultado: Resultado) => {
      setValores((previos) => ({ ...previos, resultado, motivo: '' }));
      setErrores((previos) => ({ ...previos, resultado: undefined, motivo: undefined }));
      setErrorEnvio(null);
    },
    [],
  );

  const enviar = useCallback(
    async (evento: FormEvent<HTMLFormElement>) => {
      evento.preventDefault();

      const nuevosErrores = validar(valores);
      setErrores(nuevosErrores);
      if (Object.keys(nuevosErrores).length > 0 || !usuario) return;

      setGuardando(true);
      const item: ItemCola = {
        id: createId(),
        registro: {
          numeroPedido: valores.numeroPedido.trim(),
          cliente: valores.cliente.trim(),
          direccion: valores.direccion.trim(),
          resultado: valores.resultado as Resultado,
          motivo: valores.motivo,
          comentario: valores.comentario.trim(),
          registradoEn: new Date().toISOString(),
          usuarioId: usuario.id,
          usuarioNombre: usuario.nombre,
        },
        fotos,
        estado: 'pendiente',
        intentos: 0,
        creadoEn: new Date().toISOString(),
        ultimoError: null,
      };

      try {
        await syncService.encolar(item);
        // El formulario se limpia recién al cerrar la confirmación: si se
        // limpiara acá, el repartidor vería la pantalla en blanco sin saber si
        // lo que escribió llegó a guardarse.
        setConfirmacion({ numeroPedido: item.registro.numeroPedido, enviado: online });
      } catch {
        setErrorEnvio('No se pudo guardar el pedido en el dispositivo.');
      } finally {
        setGuardando(false);
      }
    },
    [valores, fotos, usuario, online],
  );

  const cerrarConfirmacion = useCallback(() => {
    setConfirmacion(null);
    setValores(VALORES_INICIALES);
    setFotos([]);
    setErrores({});
  }, []);

  return {
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
  };
}
