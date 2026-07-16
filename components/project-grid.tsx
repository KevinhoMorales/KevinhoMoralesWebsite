'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FilterChipRow, filterChipClass } from '@/components/ui/filter-chip-row';
import { useI18n } from '@/components/i18n/locale-provider';
import type { Project, ProjectCategory } from '@/types';
import { displayProjectForFilter } from '@/lib/project-display';
import { projectMatchesCategory } from '@/lib/project-category-match';

interface ProjectGridProps {
  projects: Project[];
  /** From /projects?category= when coming from the home preview */
  initialCategory?: ProjectCategory | 'all';
}

export function ProjectGrid({ projects, initialCategory = 'all' }: ProjectGridProps) {
  const { t } = useI18n();
  const [category, setCategory] = useState<ProjectCategory | 'all'>(initialCategory);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

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
    : projects.filter((p) => projectMatchesCategory(p, category));

  return (
    <section>
      <FilterChipRow className="mb-4 sm:mb-6">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat.value)}
            className={filterChipClass}
          >
            {cat.label}
          </Button>
        ))}
      </FilterChipRow>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">{t('projects.emptyCategory')}</p>
      ) : (
        <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {filtered.map((project) => {
            const shown = displayProjectForFilter(project, category);
            return (
              <article
                key={project.id}
                className="group flex h-full flex-col rounded-lg border bg-card p-3 transition-shadow hover:shadow-md sm:p-4"
              >
              {project.image && (
                <div className="relative mb-3 aspect-[4/3] shrink-0 overflow-hidden rounded-md sm:mb-4 sm:aspect-video">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              )}
              <div className="flex min-h-0 flex-1 flex-col justify-between gap-3">
                <div className="min-h-0">
                  <h3 className="line-clamp-1 text-sm font-semibold sm:line-clamp-2">{project.title}</h3>
                  <p className="mt-1 hidden text-sm text-muted-foreground line-clamp-2 sm:block">
                    {project.description}
                  </p>
                </div>
                <div className="mt-auto space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {shown.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-muted px-2 py-0.5 text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {shown.links.map((link) => (
                      <Link
                        key={`${link.type}-${link.url}`}
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
              </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
