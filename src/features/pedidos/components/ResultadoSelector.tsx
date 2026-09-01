import { Icon } from '../../../shared/components/Icon';
import { RESULTADOS } from '../constants/resultados';
import type { Resultado } from '../types/pedido.types';

interface ResultadoSelectorProps {
  valor: Resultado | '';
  onCambiar: (resultado: Resultado) => void;
}

export function ResultadoSelector({ valor, onCambiar }: ResultadoSelectorProps) {
  return (
    <div className="resultados" role="radiogroup" aria-label="Resultado">
      {RESULTADOS.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          role="radio"
          aria-checked={valor === opcion.valor}
          className={`resultado resultado--${opcion.valor} ${valor === opcion.valor ? 'resultado--activo' : ''}`}
          onClick={() => onCambiar(opcion.valor)}
        >
          <Icon name={opcion.icono} size={22} />
          <span>{opcion.etiqueta}</span>
        </button>
      ))}
    </div>
  );
}
