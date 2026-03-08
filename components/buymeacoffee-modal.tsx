'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface BuyMeACoffeeModalProps {
  open: boolean
  onClose: () => void
}

export function BuyMeACoffeeModal({ open, onClose }: BuyMeACoffeeModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <Script
        id="bmc-widget"
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        data-name="BMC-Widget"
        data-cfasync="false"
        data-id="KevinhoMorales"
        data-description="Support me on Buy me a coffee!"
        data-message=""
        data-color="#40DCA5"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
        strategy="lazyOnload"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bmc-modal-title"
      >
        <div
          className="relative w-full max-w-md rounded-lg overflow-hidden bg-background shadow-xl p-6 sm:p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="bmc-modal-title" className="text-xl sm:text-2xl font-bold mb-3">
            Thank you for your support!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your support means the world to me. Thank you! ☕
          </p>
          <a
            href="https://buymeacoffee.com/KevinhoMorales"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-[#FFDD00] hover:bg-[#FFE44D] text-[#000] font-medium transition-colors"
          >
            Continue to Buy Me a Coffee
          </a>
          <button
            type="button"
            onClick={onClose}
            className="block w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
