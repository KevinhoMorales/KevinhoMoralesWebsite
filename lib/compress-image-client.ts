/**
 * Reduce resolución y calidad JPEG en el navegador para caber en límites de body (p. ej. Vercel ~4.5 MB).
 */

const MAX_EDGE_PX = 1920;
/** Objetivo tras compresión (margen bajo el límite del servidor). */
const TARGET_MAX_BYTES = 1.4 * 1024 * 1024;

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

function scaleDimensions(width: number, height: number): { w: number; h: number } {
  if (width <= MAX_EDGE_PX && height <= MAX_EDGE_PX) {
    return { w: width, h: height };
  }
  if (width >= height) {
    const w = MAX_EDGE_PX;
    const h = Math.max(1, Math.round((height * MAX_EDGE_PX) / width));
    return { w, h };
  }
  const h = MAX_EDGE_PX;
  const w = Math.max(1, Math.round((width * MAX_EDGE_PX) / height));
  return { w, h };
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
  });
}

/**
 * Devuelve un JPEG más ligero. Si no se puede decodificar (p. ej. HEIC sin soporte), devuelve el archivo original.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  /** Conservar animación / casos raros. */
  if (file.type === 'image/gif') {
    return file;
  }

  let img: HTMLImageElement;
  try {
    img = await loadImageElement(file);
  } catch {
    return file;
  }

  const { naturalWidth: nw, naturalHeight: nh } = img;
  if (!nw || !nh) return file;

  const { w, h } = scaleDimensions(nw, nh);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, w, h);

  let quality = 0.88;
  let blob: Blob | null = null;
  for (let step = 0; step < 10; step++) {
    blob = await canvasToJpegBlob(canvas, quality);
    if (!blob) break;
    if (blob.size <= TARGET_MAX_BYTES) break;
    quality -= 0.08;
    if (quality < 0.45) break;
  }

  if (!blob || blob.size === 0) return file;

  const base =
    file.name.replace(/\.[^.]+$/i, '').replace(/[^\w.-]+/g, '_') || 'image';
  const out = new File([blob], `${base}.jpg`, { type: 'image/jpeg' });

  /** Si por algún motivo el JPEG sale más grande que el original, mantener el original. */
  return out.size < file.size ? out : file;
}
