import { NavegacionLateral } from './NavegacionLateral';

interface MenuLateralProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function MenuLateral({ abierto, onCerrar }: MenuLateralProps) {
  if (!abierto) return null;

  return (
    <div className="menu" role="dialog" aria-label="Menú">
      <button type="button" className="menu__fondo" onClick={onCerrar} aria-label="Cerrar menú" />
      <div className="menu__panel">
        <NavegacionLateral onNavegar={onCerrar} />
      </div>
    </div>
  );
}
