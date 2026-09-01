import { env } from '../../config/env';

const OUTPUT_TYPE = 'image/jpeg';

export async function comprimirImagen(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, env.photo.maxWidth / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, OUTPUT_TYPE, env.photo.quality),
    );

    return blob ?? file;
  } catch {
    return file;
  }
}
