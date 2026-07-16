import type { Metadata } from 'next'

import { getProfile } from '@/lib/content'
import { withCanonical } from '@/lib/site'
import { About } from '@/components/sections/about'

export const metadata: Metadata = {
  title: 'About | Kevin Morales',
  description:
    'Senior Software Engineer at SoFi, mobile banking architect, EDteam instructor, and international speaker. Fintech, mobile, and developer education.',
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
