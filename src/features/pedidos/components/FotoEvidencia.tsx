import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Icon } from '../../../shared/components/Icon';
import { env } from '../../../config/env';
import { comprimirImagen } from '../../../core/utils/image';
import { createId } from '../../../core/utils/id';
import type { EvidenciaFoto } from '../types/pedido.types';

interface FotoEvidenciaProps {
  fotos: EvidenciaFoto[];
  onAgregar: (nuevas: EvidenciaFoto[]) => void;
  onQuitar: (id: string) => void;
}

export function FotoEvidencia({ fotos, onAgregar, onQuitar }: FotoEvidenciaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);

  const disponibles = env.photo.maxCount - fotos.length;

  const vistasPrevias = useMemo(
    () => fotos.map((foto) => ({ id: foto.id, url: URL.createObjectURL(foto.blob) })),
    [fotos],
  );

  useEffect(() => {
    return () => vistasPrevias.forEach((vista) => URL.revokeObjectURL(vista.url));
  }, [vistasPrevias]);

  const seleccionar = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? []).slice(0, disponibles);
    evento.target.value = '';
    if (archivos.length === 0) return;

    setProcesando(true);
    const nuevas = await Promise.all(
      archivos.map(async (archivo) => ({
        id: createId(),
        blob: await comprimirImagen(archivo),
        nombre: archivo.name || 'evidencia.jpg',
      })),
    );
    onAgregar(nuevas);
    setProcesando(false);
  };

  return (
    <div className="fotos">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={seleccionar}
        hidden
      />

      {vistasPrevias.length > 0 && (
        <ul className="fotos__grilla">
          {vistasPrevias.map((vista, indice) => (
            <li key={vista.id} className="fotos__item">
              <img src={vista.url} alt={`Evidencia ${indice + 1}`} />
              <button
                type="button"
                className="fotos__quitar"
                onClick={() => onQuitar(vista.id)}
                aria-label={`Quitar evidencia ${indice + 1}`}
              >
                <Icon name="papelera" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {disponibles > 0 && (
        <button
          type="button"
          className="fotos__boton"
          onClick={() => inputRef.current?.click()}
          disabled={procesando}
        >
          <Icon name="camara" size={18} />
          {procesando ? 'Procesando…' : fotos.length === 0 ? 'Tomar foto' : 'Agregar otra foto'}
        </button>
      )}

      <p className="fotos__contador">
        {fotos.length} de {env.photo.maxCount} fotos
        {disponibles === 0 && ' · límite alcanzado'}
      </p>
    </div>
  );
}
