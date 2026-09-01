export interface Credentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: string;
  zone: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthService {
  login(credentials: Credentials): Promise<AuthSession>;
  logout(token: string): Promise<void>;
  restore?(): Promise<AuthSession | null>;
  observeSession?(onChange: (session: AuthSession | null) => void): () => void;
}
