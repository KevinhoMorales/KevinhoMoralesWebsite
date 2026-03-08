'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Button } from '@/components/ui/button'
import { MapPin, ChevronRight } from 'lucide-react'
import { ConferencesModal } from '@/components/conferences-modal'
import type { Conference } from '@/types'

interface ConferencesProps {
  conferences: Conference[]
}

const PREVIEW_COUNT = 6

export function ConferencesSection({ conferences }: ConferencesProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section id="conferences" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div>
            <ScrollReveal className="mb-4 sm:mb-6">
              <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">
                Speaking
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance">Conferences</h2>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="mb-6 sm:mb-8">
              <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">
                Achievements
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://sessionize.com/kevinhomorales/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-110"
                  title="Sessionize Most Active Speaker 2024"
                >
                  <Image
                    src="/images/sessionize-most-active-speaker-2024.png"
                    alt="Sessionize Most Active Speaker 2024"
                    width={56}
                    height={68}
                    className="rounded object-contain"
                  />
                </a>
              </div>
            </ScrollReveal>

            <StaggerContainer className="space-y-3 sm:space-y-4">
              {conferences.slice(0, PREVIEW_COUNT).map((conf) => (
                <StaggerItem key={conf.id}>
                <Card
                  className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{conf.title}</h3>
                        {conf.topic && (
                          <p className="text-sm text-primary font-medium">{conf.topic}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {conf.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {conf.location}
                            </span>
                          )}
                          {conf.videoUrl && (
                            <a
                              href={conf.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Watch
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </StaggerItem>
              ))}
              {conferences.length > PREVIEW_COUNT && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setModalOpen(true)}
                >
                  Ver más ({conferences.length} conferencias)
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </StaggerContainer>
        </div>
      </div>

      <ConferencesModal
        conferences={conferences}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
