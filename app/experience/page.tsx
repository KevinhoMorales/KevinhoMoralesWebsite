import type { Metadata } from 'next'

import { getExperience } from '@/lib/content'
import { withCanonical } from '@/lib/site'
import { ExperienceSection } from '@/components/sections/experience'

export const metadata: Metadata = {
  title: 'Experience | Kevin Morales',
  description: 'Professional experience — mobile engineering, product teams, and leadership.',
  ...withCanonical('/experience'),
}

export default function ExperiencePage() {
  const experiences = getExperience()
  return (
    <main className="min-h-[50vh]">
      <ExperienceSection experiences={experiences} />
    </main>
  )
}
