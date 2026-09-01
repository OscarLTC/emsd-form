export interface Credenciales {
  usuario: string;
  clave: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  zona: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface AuthService {
  login(credenciales: Credenciales): Promise<Sesion>;
  logout(token: string): Promise<void>;
  restaurar?(): Promise<Sesion | null>;
  observarSesion?(alCambiar: (sesion: Sesion | null) => void): () => void;
}
