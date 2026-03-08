'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ExternalLink, Smartphone, Globe, Layers } from 'lucide-react'
import type { Project, ProjectCategory } from '@/types'

const categoryIcons: Record<string, typeof Smartphone> = {
  all: Layers,
  ios: Smartphone,
  android: Smartphone,
  web: Globe,
  flutter: Smartphone,
}

const categories: { id: ProjectCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ios', label: 'iOS' },
  { id: 'android', label: 'Android' },
  { id: 'web', label: 'Web' },
  { id: 'flutter', label: 'Flutter' },
]

interface ProjectsProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all')

  const filteredProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <section id="projects" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-8 sm:mb-10">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">Projects</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            Selected work
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || Layers
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            )
          })}
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((project) => {
            const mainLink = project.links[0]?.url || '#'
            return (
              <StaggerItem key={project.id}>
              <Card
                className="bg-card/50 border-border/50 overflow-hidden group hover:border-primary/50 transition-colors"
              >
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Smartphone className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="gap-2" asChild>
                      <a href={mainLink} target="_blank" rel="noopener noreferrer">
                        View Project <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
