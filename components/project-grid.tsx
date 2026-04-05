'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/locale-provider';
import type { Project, ProjectCategory } from '@/types';

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { t } = useI18n();
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all');

  const CATEGORIES: { value: ProjectCategory | 'all'; label: string }[] = useMemo(
    () => [
      { value: 'all', label: t('projects.all') },
      { value: 'ios', label: t('projects.ios') },
      { value: 'android', label: t('projects.android') },
      { value: 'web', label: t('projects.web') },
      { value: 'flutter', label: t('projects.flutter') },
    ],
    [t]
  );

  function linkLabel(type: string, label?: string): string {
    if (label) return label;
    const allowed = ['appStore', 'playStore', 'website', 'github', 'other'] as const;
    const lk = (allowed as readonly string[]).includes(type) ? type : 'other';
    return t(`projectLinks.${lk}`);
  }

  const filtered = category === 'all'
    ? projects
    : projects.filter((p) => p.category === category);

  return (
    <section>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <article
            key={project.id}
            className="group rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
          >
            {project.image && (
              <div className="relative aspect-video mb-4 overflow-hidden rounded-md">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-muted px-2 py-0.5 text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {project.links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {linkLabel(link.type, link.label)}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
