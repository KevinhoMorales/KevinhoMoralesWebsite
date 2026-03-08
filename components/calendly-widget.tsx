'use client'

import Script from 'next/script'

const CALENDLY_URL = 'https://calendly.com/kevinmorales/one-on-one'

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (config: { url: string }) => void
    }
  }
}

export function openCalendlyPopup() {
  if (typeof window !== 'undefined' && window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL })
  } else {
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
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
