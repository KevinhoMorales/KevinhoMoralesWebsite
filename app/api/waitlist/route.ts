import { NextRequest, NextResponse } from 'next/server';
import { adminSaveWaitlistSignup } from '@/lib/firestore-admin-waitlist';
import { resolveWeb3FormsAccessKey } from '@/lib/web3forms-access-key';
import { isWaitlistAcceptingSubmissions } from '@/lib/waitlist-signups-config';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function notifyWaitlistViaWeb3Forms(
  e: string,
  firstName: string,
  lastName: string
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  const { key, remoteConfigError } = await resolveWeb3FormsAccessKey();

  if (!key) {
    const hint = remoteConfigError?.includes('not configured')
      ? ' Configura FIREBASE_ADMIN_SDK_KEY o WEB3FORMS_ACCESS_KEY.'
      : '';
    return {
      ok: false,
      message:
        'Lista de espera no disponible. Configura FIREBASE_ADMIN_SDK_KEY en el servidor o WEB3FORMS_ACCESS_KEY en .env / Remote Config.' +
        hint,
    };
  }

  const fn = firstName.trim();
  const ln = lastName.trim();
  const full = `${fn} ${ln}`.trim();
  const lines = [
    'Nuevo registro en la lista de espera del libro.',
    '',
    `Correo: ${e}`,
    `Nombre: ${fn}`,
    `Apellido: ${ln}`,
  ];

  const payload = {
    access_key: key,
    email: e,
    name: full || e,
    subject: 'Lista de espera — libro Kotlin / Swift / Dart (kevinhomorales.com)',
    message: lines.join('\n'),
    from_name: full || e,
    botcheck: '',
  };

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    body?: { message?: string };
  };

  if (!res.ok) {
    return {
      ok: false,
      message: data.body?.message || data.message || 'No se pudo registrar.',
    };
  }

  return {
    ok: true,
    message: data.body?.message || data.message || '¡Listo! Te avisaremos cuando haya novedades.',
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!isWaitlistAcceptingSubmissions()) {
      return NextResponse.json(
        { success: false, message: 'Registro temporalmente no disponible.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, botcheck } = body as {
      email?: string;
      firstName?: string;
      lastName?: string;
      botcheck?: string;
    };

    if (!email?.trim() || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Introduce un correo válido.' },
        { status: 400 }
      );
    }

    const fn = firstName?.trim() ?? '';
    const ln = lastName?.trim() ?? '';
    if (!fn || !ln) {
      return NextResponse.json(
        { success: false, message: 'Indica nombre y apellido.' },
        { status: 400 }
      );
    }

    if (botcheck) {
      return NextResponse.json({ success: false, message: 'Spam detectado.' }, { status: 400 });
    }

    const e = email.trim();
    const ua = request.headers.get('user-agent') ?? undefined;

    const saved = await adminSaveWaitlistSignup({
      email: e,
      firstName: fn,
      lastName: ln,
      userAgent: ua,
    });

    if (saved) {
      const notify = await notifyWaitlistViaWeb3Forms(e, fn, ln);
      if (!notify.ok) {
        console.warn('[waitlist] Web3Forms (opcional, Firestore OK):', notify.message);
      }
      return NextResponse.json({
        success: true,
        message: '¡Listo! Te avisaremos cuando haya novedades.',
      });
    }

    const notify = await notifyWaitlistViaWeb3Forms(e, fn, ln);
    if (!notify.ok) {
      return NextResponse.json({ success: false, message: notify.message }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      message: notify.message,
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al enviar. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
