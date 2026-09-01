import { env } from '../../../config/env';
import { getSupabase } from '../../../core/supabase/client';
import { traducirError } from '../../../core/supabase/errores';
import type { ItemCola, PedidosService, Resultado } from '../types/pedido.types';

const TABLA_PEDIDOS = 'contingency_orders';

const RESULTADO_EN_BD: Record<Resultado, string> = {
  entregado: 'delivered',
  fallido: 'failed',
};

async function subirEvidencias(item: ItemCola): Promise<string[]> {
  const rutas: string[] = [];

  for (const foto of item.fotos) {
    const ruta = `${item.registro.usuarioId}/${item.id}/${foto.id}.jpg`;
    const { error } = await getSupabase()
      .storage.from(env.supabase.bucket)
      .upload(ruta, foto.blob, {
        upsert: true,
        contentType: foto.blob.type || 'image/jpeg',
      });

    if (error) throw traducirError(error, 'No se pudo subir la evidencia');
    rutas.push(ruta);
  }

  return rutas;
}

export const supabasePedidosService: PedidosService = {
  async enviar(item: ItemCola): Promise<void> {
    const photoPaths = await subirEvidencias(item);
    const { registro } = item;

    const { error } = await getSupabase()
      .from(TABLA_PEDIDOS)
      .upsert(
        {
          id: item.id,
          order_number: registro.numeroPedido,
          customer: registro.cliente,
          address: registro.direccion,
          result: RESULTADO_EN_BD[registro.resultado],
          reason: registro.motivo || null,
          comment: registro.comentario || null,
          recorded_at: registro.registradoEn,
          user_id: registro.usuarioId,
          user_name: registro.usuarioNombre,
          photo_paths: photoPaths,
          queued_at: item.creadoEn,
        },
        { onConflict: 'id' },
      );

    if (error) throw traducirError(error, 'No se pudo registrar el pedido');
  },
};
