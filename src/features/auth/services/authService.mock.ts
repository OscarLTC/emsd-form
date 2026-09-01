import type { AuthService, Credenciales, Sesion, Usuario } from '../types/auth.types';
import { createId } from '../../../core/utils/id';

interface CuentaMock {
  clave: string;
  usuario: Usuario;
}

const CUENTAS: Record<string, CuentaMock> = {
  operador: {
    clave: '123456',
    usuario: {
      id: 'u-001',
      nombre: 'Luis Ramírez',
      usuario: 'operador',
      rol: 'Transportista',
      zona: 'Lima Sur',
    },
  },
  supervisor: {
    clave: '123456',
    usuario: {
      id: 'u-002',
      nombre: 'Ana Quispe',
      usuario: 'supervisor',
      rol: 'Supervisor de ruta',
      zona: 'Lima Sur',
    },
  },
};

const demora = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthService: AuthService = {
  async login({ usuario, clave }: Credenciales): Promise<Sesion> {
    await demora(600);

    const cuenta = CUENTAS[usuario.trim().toLowerCase()];
    if (!cuenta || cuenta.clave !== clave) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    return { token: `mock-${createId()}`, usuario: cuenta.usuario };
  },

  async logout(): Promise<void> {
    await demora(150);
  },
};
