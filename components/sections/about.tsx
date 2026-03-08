import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Heart, Code, Users, Mic } from 'lucide-react'
import type { Profile } from '@/types'

interface AboutProps {
  profile: Profile
}

const highlights = [
  { icon: Code, title: '7+ Years', description: 'Building mobile apps' },
  { icon: Users, title: 'Community', description: 'DevLokos founder' },
  { icon: Mic, title: 'Speaker', description: 'International conferences' },
  { icon: Heart, title: 'Passion', description: 'Open source contributor' },
]

export function About({ profile }: AboutProps) {
  return (
    <section id="about" className="scroll-mt-20 py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-4 sm:mb-6">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">About Me</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-balance">
            Crafting digital experiences with purpose
          </h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 lg:items-stretch">
          <ScrollReveal variant="fade-right" delay={0.1} className="space-y-4 sm:space-y-6">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {profile.aboutMe?.split('\n')[0] || profile.bio.split('\n')[0]}
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {profile.aboutMe?.split('\n').slice(1, 3).join(' ') || profile.bio.split('\n')[1]}
            </p>
            {profile.motto && (
              <p className="text-base sm:text-lg text-primary/90 italic">
                &ldquo;{profile.motto}&rdquo;
              </p>
            )}

            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6">
              {highlights.map((item) => (
                <StaggerItem key={item.title}>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1 sm:mb-2" />
                    <p className="font-semibold text-xs sm:text-sm">{item.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={0.2} className="flex">
            <Card className="bg-card/50 border-border/50 overflow-hidden flex flex-col flex-1 min-h-0">
              <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                {profile.familyImage ? (
                  <>
                    <div className="relative flex-1 min-h-[280px] lg:min-h-[360px] overflow-hidden">
                      <Image
                        src={profile.familyImage}
                        alt="Mi familia"
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-4 sm:p-6 shrink-0">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        My Family
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        They inspire everything I do. Building a better future, one line of code at a time.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      My Family
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      They inspire everything I do. Building a better future, one line of code at a time.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      {['Sofia', 'Lucas', 'Emma'].map((name) => (
                        <div key={name} className="text-center">
                          <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {name === 'Sofia' ? 'Partner' : name === 'Lucas' ? 'Son' : 'Daughter'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
