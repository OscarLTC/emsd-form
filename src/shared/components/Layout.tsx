import { useState } from 'react';
import type { ReactNode } from 'react';
import { env } from '../../config/env';
import { AppHeader } from './AppHeader';
import { SyncBar } from './SyncBar';
import { MobileMenu } from './MobileMenu';
import { SideNav } from './SideNav';
import { Icon } from './Icon';

interface LayoutProps {
  title: string;
  onBack?: () => void;
  children: ReactNode;
}

export function Layout({ title, onBack, children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <aside className="app__sidebar">
        <div className="app__brand">
          <span className="app__logo">
            <Icon name="truck" size={22} />
          </span>
          {env.appName}
        </div>
        <SideNav />
      </aside>

      <div className="app__main">
        <div className="topbar">
          <AppHeader title={title} onMenu={() => setMenuOpen(true)} onBack={onBack} />
          <SyncBar />
        </div>
        <main className="content">{children}</main>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
