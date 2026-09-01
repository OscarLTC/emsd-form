export type Resultado = 'entregado' | 'fallido';

export type EstadoEnvio = 'pendiente' | 'error';

export interface RegistroPedido {
  numeroPedido: string;
  cliente: string;
  direccion: string;
  resultado: Resultado;
  motivo: string;
  comentario: string;
  registradoEn: string;
  usuarioId: string;
  usuarioNombre: string;
}

export interface EvidenciaFoto {
  id: string;
  blob: Blob;
  nombre: string;
}

export interface ItemCola {
  id: string;
  registro: RegistroPedido;
  fotos: EvidenciaFoto[];
  estado: EstadoEnvio;
  intentos: number;
  creadoEn: string;
  ultimoError: string | null;
}

export interface PedidosService {
  enviar(item: ItemCola): Promise<void>;
}
