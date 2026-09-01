import { env } from '../../config/env';
import { Icon } from './Icon';

interface AppHeaderProps {
  titulo: string;
  onMenu?: () => void;
  onAtras?: () => void;
}

export function AppHeader({ titulo, onMenu, onAtras }: AppHeaderProps) {
  return (
    <header className="encabezado">
      {onAtras ? (
        <button type="button" className="encabezado__accion" onClick={onAtras} aria-label="Volver">
          <Icon name="atras" size={22} />
        </button>
      ) : (
        <button type="button" className="encabezado__accion" onClick={onMenu} aria-label="Abrir menú">
          <Icon name="menu" size={22} />
        </button>
      )}

      <h1 className="encabezado__titulo">
        <span className="encabezado__app">{env.appName}</span>
        <span className="encabezado__pagina">{titulo}</span>
      </h1>

      <span className="encabezado__camion">
        <Icon name="camion" size={22} />
      </span>
    </header>
  );
}
