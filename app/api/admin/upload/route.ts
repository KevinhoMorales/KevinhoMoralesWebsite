import { NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import {
  AdminUnauthorized,
  assertAdminUser,
  adminUnauthorizedResponse,
  requireAdminApp,
} from '@/lib/admin-api-server';
import { PROD_COLLECTION, STORAGE_ADMIN_PREFIX } from '@/lib/firebase-paths';

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
}

export async function POST(req: Request) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucketName) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no configurado' }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Multipart inválido' }, { status: 400 });
  }
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo requerido (campo file)' }, { status: 400 });
  }

  const scope = formData.get('scope');
  const slotRaw = formData.get('slot');

  let path: string;
  if (scope === 'conferences' && slotRaw != null && String(slotRaw).trim() !== '') {
    const slot = Math.max(1, parseInt(String(slotRaw), 10) || 1);
    const folder = `conference${String(slot).padStart(3, '0')}`;
    path = `${PROD_COLLECTION}/conferences/${folder}/${Date.now()}_${safeFileName(file.name)}`;
  } else {
    path = `${STORAGE_ADMIN_PREFIX}/panel/${Date.now()}_${safeFileName(file.name)}`;
  }

  const app = requireAdminApp();
  const bucket = getStorage(app).bucket(bucketName);
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileRef = bucket.file(path);

  await fileRef.save(buffer, {
    metadata: { contentType: file.type || 'application/octet-stream' },
  });

  try {
    await fileRef.makePublic();
  } catch {
    // Bucket con acceso uniforme u otras políticas: `makePublic` falla. La URL pública
    // `storage.googleapis.com/.../path` devolvería 403; hay que guardar la URL firmada en Firestore.
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });
    return NextResponse.json({ url });
  }

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;
  return NextResponse.json({ url: publicUrl, path });
}
