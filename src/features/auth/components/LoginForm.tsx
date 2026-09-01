import { useState } from 'react';
import type { FormEvent } from 'react';
import { Field } from '../../../shared/components/Field';
import { Icon } from '../../../shared/components/Icon';
import { useAuth } from '../hooks/useAuth';
import { IDENTIFIER } from '../constants/identifier';

export function LoginForm() {
  const { login, isAuthenticating, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const incomplete = !username.trim() || !password;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (incomplete) return;
    await login({ username: username.trim(), password });
  };

  return (
    <form className="login__form" onSubmit={submit} noValidate>
      <Field
        icon="user"
        label={IDENTIFIER.label}
        htmlFor="username"
        error={touched && !username.trim() ? IDENTIFIER.missing : undefined}
      >
        <input
          id="username"
          type={IDENTIFIER.type}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete={IDENTIFIER.autoComplete}
          autoCapitalize="none"
          inputMode={IDENTIFIER.type === 'email' ? 'email' : 'text'}
          placeholder={IDENTIFIER.placeholder}
        />
      </Field>

      <Field
        icon="lock"
        label="Contraseña"
        htmlFor="password"
        error={touched && !password ? 'Ingresa tu contraseña' : undefined}
      >
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="••••••"
        />
      </Field>

      {error && (
        <p className="notice notice--error" role="alert">
          <Icon name="alert" size={18} />
          {error}
        </p>
      )}

      <button type="submit" className="button" disabled={isAuthenticating}>
        {isAuthenticating ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
