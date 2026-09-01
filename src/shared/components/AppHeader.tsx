import { env } from '../../config/env';
import { Icon } from './Icon';

interface AppHeaderProps {
  title: string;
  onMenu?: () => void;
  onBack?: () => void;
}

export function AppHeader({ title, onMenu, onBack }: AppHeaderProps) {
  return (
    <header className="header">
      {onBack ? (
        <button type="button" className="header__action" onClick={onBack} aria-label="Volver">
          <Icon name="back" size={22} />
        </button>
      ) : (
        <button type="button" className="header__action" onClick={onMenu} aria-label="Abrir menú">
          <Icon name="menu" size={22} />
        </button>
      )}

      <h1 className="header__title">
        <span className="header__app">{env.appName}</span>
        <span className="header__page">{title}</span>
      </h1>

      <span className="header__truck">
        <Icon name="truck" size={22} />
      </span>
    </header>
  );
}
