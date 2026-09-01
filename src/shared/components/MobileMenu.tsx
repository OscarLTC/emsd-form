import { SideNav } from './SideNav';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="menu" role="dialog" aria-label="Menú">
      <button type="button" className="menu__backdrop" onClick={onClose} aria-label="Cerrar menú" />
      <div className="menu__panel">
        <SideNav onNavigate={onClose} />
      </div>
    </div>
  );
}
