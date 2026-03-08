'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Coffee } from 'lucide-react'
import { BuyMeACoffeeModal } from '@/components/buymeacoffee-modal'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface ConnectProps {
  profile: Profile
}

const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function Connect({ profile }: ConnectProps) {
  const links = profile.socialLinks || {}
  const [name, setName] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [bmcModalOpen, setBmcModalOpen] = useState(false)
  const botcheckRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setStatusMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          linkedin: linkedin || undefined,
          message,
          botcheck: botcheckRef.current?.value || '',
        }),
      })
      const data = (await res.json()) as { success?: boolean; message?: string }

      if (data.success) {
        setStatus('success')
        setStatusMessage(data.message || 'Message sent! I\'ll get back to you soon.')
        setName('')
        setLinkedin('')
        setMessage('')
      } else {
        setStatus('error')
        setStatusMessage(data.message || 'Failed to send. Please try again.')
      }
    } catch {
      setStatus('error')
      setStatusMessage('Connection error. Please try again.')
    }
  }

  return (
    <section id="connect" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6 sm:mb-8">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">Contact</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-balance">
            Let&apos;s build something amazing together
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-1">
            Whether you have a project in mind, want to collaborate, or just want to say
            hi—I&apos;d love to hear from you.
          </p>
        </div>

        <Card className="bg-card/50 border-border/50 max-w-2xl mx-auto mb-6">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputClassName}
                  disabled={status === 'sending'}
                />
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium mb-2">
                  LinkedIn <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="linkedin"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className={inputClassName}
                  disabled={status === 'sending'}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can I help you?"
                  rows={4}
                  className={cn(inputClassName, 'min-h-[100px] resize-y')}
                  disabled={status === 'sending'}
                />
              </div>
              <input
                ref={botcheckRef}
                type="text"
                name="botcheck"
                className="absolute -left-[9999px]"
                tabIndex={-1}
                autoComplete="off"
              />
              {statusMessage && (
                <p
                  className={cn(
                    'text-sm',
                    status === 'success' ? 'text-primary' : 'text-destructive'
                  )}
                >
                  {statusMessage}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Send message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {links.buymeacoffee && (
          <div className="pt-4">
            <Button
              size="lg"
              className="gap-2 bg-[#FFDD00] hover:bg-[#FFE44D] text-black"
              onClick={() => setBmcModalOpen(true)}
            >
              <Coffee className="h-5 w-5" />
              Buy me a Coffee
            </Button>
          </div>
        )}
        <BuyMeACoffeeModal open={bmcModalOpen} onClose={() => setBmcModalOpen(false)} />
      </div>
    </section>
  )
}
