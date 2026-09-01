import { useState } from 'react';
import type { ReactNode } from 'react';
import { env } from '../../config/env';
import { AppHeader } from './AppHeader';
import { BarraSincronizacion } from './BarraSincronizacion';
import { MenuLateral } from './MenuLateral';
import { NavegacionLateral } from './NavegacionLateral';
import { Icon } from './Icon';

interface LayoutProps {
  titulo: string;
  onAtras?: () => void;
  children: ReactNode;
}

export function Layout({ titulo, onAtras, children }: LayoutProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="app">
      <aside className="app__lateral">
        <div className="app__marca">
          <span className="app__logo">
            <Icon name="camion" size={22} />
          </span>
          {env.appName}
        </div>
        <NavegacionLateral />
      </aside>

      <div className="app__principal">
        <div className="topbar">
          <AppHeader titulo={titulo} onMenu={() => setMenuAbierto(true)} onAtras={onAtras} />
          <BarraSincronizacion />
        </div>
        <main className="contenido">{children}</main>
      </div>

      <MenuLateral abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </div>
  );
}
