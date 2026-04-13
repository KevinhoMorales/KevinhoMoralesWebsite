/**
 * Extracción de imágenes desde el portapapeles (misma lógica que charlas / conferencias).
 * No mezclar `files` e `items`: en algunos navegadores es la misma imagen duplicada.
 */
export function collectPastedImageFiles(data: DataTransfer | null): File[] {
  if (!data) return [];

  const isImageFile = (f: File | null | undefined): f is File => {
    if (!f || f.size === 0) return false;
    return (
      f.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name)
    );
  };

  if (data.files?.length) {
    const fromFiles: File[] = [];
    for (let i = 0; i < data.files.length; i++) {
      const f = data.files.item(i);
      if (isImageFile(f)) fromFiles.push(f);
    }
    if (fromFiles.length > 0) return fromFiles;
  }

  const fromItems: File[] = [];
  if (data.items?.length) {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (item.kind !== 'file') continue;
      const mime = item.type;
      if (mime.startsWith('image/') || mime === '' || mime === 'image/x-png') {
        const f = item.getAsFile();
        if (isImageFile(f)) fromItems.push(f);
      }
    }
  }

  return fromItems;
}

export function isProbablyImageUrl(s: string): boolean {
  if (!s) return false;
  if (s.startsWith('/') || s.startsWith('blob:')) return true;
  if (s.startsWith('prod/')) return true;
  return /^https?:\/\//i.test(s);
}
