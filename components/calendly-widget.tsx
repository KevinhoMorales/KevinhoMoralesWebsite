'use client'

import Script from 'next/script'

const CALENDLY_DEFAULT_URL = 'https://calendly.com/kevinmorales/one-on-one'

/** Matches Calendly’s default popup trigger styling (see widget docs). */
export const calendlyPopupButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-[6px] border-0 bg-[#0069ff] px-6 py-3 text-base font-normal text-white shadow-none transition-colors hover:bg-[#0052cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0069ff] focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer disabled:pointer-events-none disabled:opacity-50'

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
