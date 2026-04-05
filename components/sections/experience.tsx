import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { ExternalLink } from 'lucide-react'
import type { Experience } from '@/types'

interface ExperienceProps {
  experiences: Experience[]
}

export function ExperienceSection({ experiences }: ExperienceProps) {
  return (
    <section id="experience" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-8 sm:mb-10">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">Experience</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            Where I&apos;ve worked
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {experiences.map((exp, index) => (
            <StaggerItem key={exp.id} delay={index * 0.04}>
            <Card
              className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors group"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  {exp.companyLogo && (
                    <div className="relative h-5 w-5 sm:h-6 sm:w-6 shrink-0 rounded-sm overflow-hidden bg-background border border-border">
                      <Image
                        src={exp.companyLogo}
                        alt={exp.company}
                        fill
                        className="object-contain scale-125"
                        sizes="24px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {exp.company}
                      {exp.companyUrl && (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate || '—'} · {exp.type}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
