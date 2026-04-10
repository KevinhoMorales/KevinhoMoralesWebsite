'use client'

import Script from 'next/script'

const CALENDLY_DEFAULT_URL = 'https://calendly.com/kevinmorales/one-on-one'

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (config: { url: string }) => void
    }
  }
}

export function openCalendlyPopup(url = CALENDLY_DEFAULT_URL) {
  const u = (url || CALENDLY_DEFAULT_URL).trim() || CALENDLY_DEFAULT_URL
  if (typeof window !== 'undefined' && window.Calendly) {
    window.Calendly.initPopupWidget({ url: u })
  } else {
    window.open(u, '_blank', 'noopener,noreferrer')
  }
}

export function CalendlyWidget() {
  return (
    <Script
      src="https://assets.calendly.com/assets/external/widget.js"
      strategy="lazyOnload"
    />
  )
}
