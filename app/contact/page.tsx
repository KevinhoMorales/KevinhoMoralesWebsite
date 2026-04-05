import type { Metadata } from 'next'

import { getProfile } from '@/lib/content'
import { withCanonical } from '@/lib/site'
import { Connect } from '@/components/sections/connect'

export const metadata: Metadata = {
  title: 'Contact | Kevin Morales',
  description: 'Get in touch — send a message, book a call on Calendly, or support on Buy Me a Coffee.',
  ...withCanonical('/contact'),
}

export default function ContactPage() {
  const profile = getProfile()
  return (
    <main className="min-h-[50vh]">
      <Connect profile={profile} />
    </main>
  )
}
