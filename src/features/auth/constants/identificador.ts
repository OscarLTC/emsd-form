import { modoApi } from '../../../config/adaptadores';

export const IDENTIFICADOR =
  modoApi === 'supabase'
    ? {
        etiqueta: 'Correo',
        tipo: 'email',
        placeholder: 'operador@empresa.com',
        autoComplete: 'email',
        faltante: 'Ingresa tu correo',
      }
    : {
        etiqueta: 'Usuario',
        tipo: 'text',
        placeholder: 'usuario',
        autoComplete: 'username',
        faltante: 'Ingresa tu usuario',
      };
