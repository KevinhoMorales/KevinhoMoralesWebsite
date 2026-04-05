import { NextRequest, NextResponse } from 'next/server';
import {
  adminCountWaitlistSignupsAfterWrite,
  adminSaveWaitlistSignup,
} from '@/lib/firestore-admin-waitlist';
import { sendWaitlistThankYouEmail } from '@/lib/send-waitlist-thank-you';
import {
  assertWaitlistJsonSize,
  checkWaitlistRateLimit,
  getWaitlistClientKey,
  normalizeWaitlistFields,
} from '@/lib/waitlist-api-security';
import { isWaitlistAcceptingSubmissions } from '@/lib/waitlist-signups-config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isWaitlistAcceptingSubmissions()) {
      return NextResponse.json(
        { success: false, message: 'Registro temporalmente no disponible.' },
        { status: 403 }
      );
    }

    const size = assertWaitlistJsonSize(request);
    if (!size.ok) {
      return NextResponse.json({ success: false, message: 'Solicitud demasiado grande.' }, { status: 413 });
    }

    const clientKey = getWaitlistClientKey(request);
    const limited = checkWaitlistRateLimit(clientKey);
    if (!limited.allowed) {
      return NextResponse.json(
        { success: false, message: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limited.retryAfterSec) },
        }
      );
    }

    let bodyRaw: unknown;
    try {
      bodyRaw = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Datos inválidos.' }, { status: 400 });
    }

    if (!bodyRaw || typeof bodyRaw !== 'object' || Array.isArray(bodyRaw)) {
      return NextResponse.json({ success: false, message: 'Datos inválidos.' }, { status: 400 });
    }

    const parsed = normalizeWaitlistFields(bodyRaw as Record<string, unknown>);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
    }

    const { email: e, firstName: fn, lastName: ln, organization: org } = parsed.fields;
    const ua = request.headers.get('user-agent') ?? undefined;

    const saved = await adminSaveWaitlistSignup({
      email: e,
      firstName: fn,
      lastName: ln,
      organization: org,
      userAgent: ua,
    });

    if (saved?.status === 'exists') {
      return NextResponse.json(
        { success: false, code: 'duplicate_email' },
        { status: 409 }
      );
    }

    if (saved?.status === 'created') {
      const signupsCount = await adminCountWaitlistSignupsAfterWrite();
      void sendWaitlistThankYouEmail({
        to: e,
        firstName: fn,
        ...(signupsCount != null ? { signupsCount } : {}),
      });
      return NextResponse.json({
        success: true,
        message: '¡Listo! Te avisaremos cuando haya novedades.',
      });
    }

    return NextResponse.json({
      success: true,
      message: '¡Listo! Te avisaremos cuando haya novedades.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error al enviar. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
