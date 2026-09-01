import { env } from '../../../config/env';

export const IDENTIFICADOR =
  env.api.mode === 'supabase'
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
