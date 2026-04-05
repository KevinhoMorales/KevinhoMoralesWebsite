import type { Metadata } from 'next'

import { getProfile } from '@/lib/content'
import { withCanonical } from '@/lib/site'
import { About } from '@/components/sections/about'

export const metadata: Metadata = {
  title: 'About | Kevin Morales',
  description:
    'Mobile engineer, community builder, and international speaker. Building experiences with iOS, Android, Flutter, and web.',
  ...withCanonical('/about'),
}

export default function AboutPage() {
  const profile = getProfile()
  return (
    <main className="min-h-[50vh]">
      <About profile={profile} />
    </main>
  )
}
