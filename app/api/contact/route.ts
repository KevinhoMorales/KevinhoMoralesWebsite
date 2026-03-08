import { NextRequest, NextResponse } from 'next/server'
import { getWeb3FormsAccessKeyFromRemoteConfig } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let accessKey: string | undefined
  let remoteConfigError: string | undefined

  // 1. Firebase Remote Config (prioridad)
  try {
    accessKey = await getWeb3FormsAccessKeyFromRemoteConfig()
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    remoteConfigError = err.message
    console.error('Web3Forms Remote Config error:', err)
  }

  // 2. Fallback a env
  if (!accessKey) {
    accessKey = (process.env.WEB3FORMS_ACCESS_KEY || '').trim()
  }

  if (!accessKey) {
    const hint = remoteConfigError?.includes('not configured')
      ? ' Configure FIREBASE_ADMIN_SDK_KEY in .env.local with your service account JSON.'
      : remoteConfigError?.includes('Remote Config')
        ? ' Ensure Remote Config is published and the service account has "Cloud Remote Config Admin" role.'
        : ''
    return NextResponse.json(
      {
        success: false,
        message:
          'Contact form not configured. Add web_3_form to Firebase Remote Config or WEB3FORMS_ACCESS_KEY to .env.local.' +
          hint,
      },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { name, linkedin, message, botcheck } = body

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name and message are required.' },
        { status: 400 }
      )
    }

    // Spam check
    if (botcheck) {
      return NextResponse.json(
        { success: false, message: 'Spam detected.' },
        { status: 400 }
      )
    }

    const payload = {
      access_key: accessKey,
      name: name.trim(),
      subject: `Contact from ${name.trim()} - kevinhomorales.com`,
      message: [
        message.trim(),
        linkedin?.trim() ? `\nLinkedIn: ${linkedin.trim()}` : '',
      ]
        .filter(Boolean)
        .join(''),
      from_name: name.trim(),
      botcheck: '',
    }

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = (await res.json()) as {
      success?: boolean
      message?: string
      body?: { message?: string }
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.body?.message || data.message || 'Failed to send message.',
        },
        { status: res.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.body?.message || data.message || 'Message sent successfully!',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 }
    )
  }
}
