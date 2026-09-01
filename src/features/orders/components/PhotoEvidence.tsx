import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Icon } from '../../../shared/components/Icon';
import { env } from '../../../config/env';
import { compressImage } from '../../../core/utils/image';
import { createId } from '../../../core/utils/id';
import type { EvidencePhoto } from '../types/order.types';

interface PhotoEvidenceProps {
  photos: EvidencePhoto[];
  onAdd: (incoming: EvidencePhoto[]) => void;
  onRemove: (id: string) => void;
}

export function PhotoEvidence({ photos, onAdd, onRemove }: PhotoEvidenceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const remaining = env.photo.maxCount - photos.length;

  const previews = useMemo(
    () => photos.map((photo) => ({ id: photo.id, url: URL.createObjectURL(photo.blob) })),
    [photos],
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const select = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, remaining);
    event.target.value = '';
    if (files.length === 0) return;

    setIsProcessing(true);
    const incoming = await Promise.all(
      files.map(async (file) => ({
        id: createId(),
        blob: await compressImage(file),
        name: file.name || 'evidencia.jpg',
      })),
    );
    onAdd(incoming);
    setIsProcessing(false);
  };

  return (
    <div className="photos">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={select}
        hidden
      />

      {previews.length > 0 && (
        <ul className="photos__grid">
          {previews.map((preview, index) => (
            <li key={preview.id} className="photos__item">
              <img src={preview.url} alt={`Evidencia ${index + 1}`} />
              <button
                type="button"
                className="photos__remove"
                onClick={() => onRemove(preview.id)}
                aria-label={`Quitar evidencia ${index + 1}`}
              >
                <Icon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <button
          type="button"
          className="photos__button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
        >
          <Icon name="camera" size={18} />
          {isProcessing ? 'Procesando…' : photos.length === 0 ? 'Tomar foto' : 'Agregar otra foto'}
        </button>
      )}

      <p className="photos__counter">
        {photos.length} de {env.photo.maxCount} fotos
        {remaining === 0 && ' · límite alcanzado'}
      </p>
    </div>
  );
}
