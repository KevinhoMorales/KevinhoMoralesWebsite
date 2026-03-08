import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Quote } from 'lucide-react'
import type { Testimonial } from '@/types'

interface RecommendationsProps {
  testimonials: Testimonial[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Recommendations({ testimonials }: RecommendationsProps) {
  return (
    <section id="recommendations" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-8 sm:mb-10 text-center">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">
            Testimonials
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">What people say</h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 sm:p-4 space-y-2">
                <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-primary/30" />
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed italic line-clamp-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2 sm:gap-3 pt-1">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border border-primary/20">
                    <AvatarImage src={t.avatar} alt={t.author} />
                    <AvatarFallback className="bg-secondary text-[10px] sm:text-xs">
                      {getInitials(t.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    {t.linkedinUrl ? (
                      <a
                        href={t.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm hover:text-primary transition-colors truncate block"
                      >
                        {t.author}
                      </a>
                    ) : (
                      <p className="font-semibold text-sm truncate">{t.author}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {t.role}
                      {t.company && ` at ${t.company}`}
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
