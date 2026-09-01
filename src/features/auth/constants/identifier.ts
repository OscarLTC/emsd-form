import { env } from '../../../config/env';

export const IDENTIFIER =
  env.api.mode === 'supabase'
    ? {
        label: 'Correo',
        type: 'email',
        placeholder: 'operador@empresa.com',
        autoComplete: 'email',
        missing: 'Ingresa tu correo',
      }
    : {
        label: 'Usuario',
        type: 'text',
        placeholder: 'usuario',
        autoComplete: 'username',
        missing: 'Ingresa tu usuario',
      };
