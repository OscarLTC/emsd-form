import type { IconName } from '../../../shared/components/Icon';
import type { Resultado } from '../types/pedido.types';

interface OpcionResultado {
  valor: Resultado;
  etiqueta: string;
  icono: IconName;
}

export const RESULTADOS: OpcionResultado[] = [
  { valor: 'entregado', etiqueta: 'Entregado', icono: 'check' },
  { valor: 'fallido', etiqueta: 'Fallido', icono: 'cerrar' },
];

export const ETIQUETAS_RESULTADO: Record<Resultado, string> = {
  entregado: 'Entregado',
  fallido: 'Fallido',
};
