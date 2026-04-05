import { NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { AdminUnauthorized, assertAdminUser, requireAdminApp } from '@/lib/admin-api-server';
import { STORAGE_ADMIN_PREFIX } from '@/lib/firebase-paths';

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
}

export async function POST(req: Request) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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

  const app = requireAdminApp();
  const bucket = getStorage(app).bucket(bucketName);
  const path = `${STORAGE_ADMIN_PREFIX}/panel/${Date.now()}_${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileRef = bucket.file(path);

  await fileRef.save(buffer, {
    metadata: { contentType: file.type || 'application/octet-stream' },
  });

  try {
    await fileRef.makePublic();
  } catch {
    // bucket puede usar acceso uniforme; devolver URL firmada corta
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });
    return NextResponse.json({ url });
  }

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;
  return NextResponse.json({ url: publicUrl });
}
