import type { Resultado } from '../../features/pedidos/types/pedido.types';

/**
 * Motivos que puede elegir el repartidor según el resultado de la entrega.
 *
 * Viven fuera del feature porque son un catálogo administrable: la idea es que
 * más adelante se gestionen desde el backoffice y lleguen por API. Mientras eso
 * no exista, se mantienen acá como constante para tener un solo lugar donde
 * agregarlos, quitarlos o reordenarlos sin tocar el formulario.
 *
 * Un resultado sin motivos no pide motivo: el campo desaparece del formulario y
 * deja de ser obligatorio.
 */
export const MOTIVOS: Partial<Record<Resultado, string[]>> = {
  fallido: [
    'Cliente ausente',
    'Local cerrado',
    'Dirección incorrecta',
    'Rechazo del cliente',
    'Zona inaccesible',
  ],
};

export const motivosDe = (resultado: Resultado | ''): string[] =>
  resultado ? (MOTIVOS[resultado] ?? []) : [];

export const requiereMotivo = (resultado: Resultado | ''): boolean => motivosDe(resultado).length > 0;
