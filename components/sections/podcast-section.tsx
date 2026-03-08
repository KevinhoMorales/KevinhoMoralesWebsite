'use client'

import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/scroll-reveal'
import { ExternalLink, Headphones } from 'lucide-react'
import { PodcastSection } from '@/components/podcast-section'

export function PodcastSectionUI() {
  return (
    <section id="podcast" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">Podcast</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
              DevLokos Podcast
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4 max-w-xl">
              Conversations with developers, designers, and tech leaders about building great
              products and growing your career.
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0" asChild>
            <a
              href="https://www.youtube.com/@DevLokos/podcasts"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Headphones className="h-4 w-4" />
              Listen on YouTube
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <PodcastSection />
        </ScrollReveal>
      </div>
    </section>
  )
}
