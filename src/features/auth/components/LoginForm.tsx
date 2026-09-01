import { useState } from 'react';
import type { FormEvent } from 'react';
import { Campo } from '../../../shared/components/Campo';
import { Icon } from '../../../shared/components/Icon';
import { useAuth } from '../hooks/useAuth';
import { IDENTIFICADOR } from '../constants/identificador';

export function LoginForm() {
  const { login, autenticando, error } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [tocado, setTocado] = useState(false);

  const incompleto = !usuario.trim() || !clave;

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setTocado(true);
    if (incompleto) return;
    await login({ usuario: usuario.trim(), clave });
  };

  return (
    <form className="login__form" onSubmit={enviar} noValidate>
      <Campo
        icono="usuario"
        etiqueta={IDENTIFICADOR.etiqueta}
        htmlFor="usuario"
        error={tocado && !usuario.trim() ? IDENTIFICADOR.faltante : undefined}
      >
        <input
          id="usuario"
          type={IDENTIFICADOR.tipo}
          value={usuario}
          onChange={(evento) => setUsuario(evento.target.value)}
          autoComplete={IDENTIFICADOR.autoComplete}
          autoCapitalize="none"
          inputMode={IDENTIFICADOR.tipo === 'email' ? 'email' : 'text'}
          placeholder={IDENTIFICADOR.placeholder}
        />
      </Campo>

      <Campo
        icono="candado"
        etiqueta="Contraseña"
        htmlFor="clave"
        error={tocado && !clave ? 'Ingresa tu contraseña' : undefined}
      >
        <input
          id="clave"
          type="password"
          value={clave}
          onChange={(evento) => setClave(evento.target.value)}
          autoComplete="current-password"
          placeholder="••••••"
        />
      </Campo>

      {error && (
        <p className="aviso aviso--error" role="alert">
          <Icon name="alerta" size={18} />
          {error}
        </p>
      )}

      <button type="submit" className="boton" disabled={autenticando}>
        {autenticando ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
