import type { Metadata } from 'next'

import { getProfile } from '@/lib/content'
import { withCanonical } from '@/lib/site'
import { SpeakingSection } from '@/components/sections/speaking-section'
import { Footer } from '@/components/sections/footer'

export const metadata: Metadata = {
  title: 'Speaking | Kevin Morales',
  description:
    'International speaker on mobile architecture, fintech, AI-powered development, and community building. Book a talk via Sessionize or Calendly.',
  ...withCanonical('/speaking'),
}

export default function SpeakingPage() {
  const profile = getProfile()
  return (
    <main className="min-h-[50vh]">
      <SpeakingSection profile={profile} />
      <Footer profile={profile} />
    </main>
  )
}
