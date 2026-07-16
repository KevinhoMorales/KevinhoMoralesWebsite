import { Skeleton } from '@/components/ui/skeleton'
import { SECTION_PADDING, SECTION_PADDING_X, SECTION_PADDING_Y_LOOSE } from '@/lib/section-layout'
import { cn } from '@/lib/utils'

function SectionHeaderSkeleton({
  titleWidth = 'w-56',
  withSubtitle = true,
}: {
  titleWidth?: string
  withSubtitle?: boolean
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <Skeleton className="h-3 w-24 sm:h-4 sm:w-28" />
      <Skeleton className={`h-8 sm:h-9 md:h-10 ${titleWidth} max-w-full`} />
      {withSubtitle ? <Skeleton className="h-4 w-full max-w-xl" /> : null}
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:min-h-[58vh] lg:px-12 lg:py-10 xl:min-h-[62vh] xl:px-24 xl:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-muted/25" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/55 dark:from-background dark:via-background/90 dark:to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid w-full min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12 xl:gap-16">
          <div className="order-first flex justify-center lg:hidden">
            <Skeleton className="h-28 w-28 rounded-full xs:h-32 xs:w-32 sm:h-40 sm:w-40 md:h-44 md:w-44" />
          </div>

          <div className="order-2 min-w-0 space-y-4 sm:space-y-6 lg:max-w-xl lg:space-y-7">
            <Skeleton className="h-3 w-36 sm:h-4 sm:w-44" />
            <Skeleton className="h-9 w-full max-w-lg sm:h-11 md:h-12 lg:h-14 lg:max-w-xl" />
            <Skeleton className="hidden h-4 w-full max-w-lg lg:block" />
            <Skeleton className="hidden h-4 w-4/5 max-w-md lg:block" />
            <div className="flex flex-wrap gap-2 pt-1 sm:gap-3">
              <Skeleton className="h-9 w-32 rounded-md sm:h-10 sm:w-36" />
              <Skeleton className="h-9 w-24 rounded-md sm:h-10 sm:w-28" />
              <Skeleton className="h-9 w-28 rounded-md sm:h-10 sm:w-32" />
            </div>
            <div className="space-y-2 pt-1 sm:pt-2 lg:rounded-2xl lg:border lg:border-border/40 lg:bg-card/30 lg:p-4">
              <Skeleton className="h-3 w-24" />
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-lg sm:h-14 sm:w-14" />
                ))}
              </div>
            </div>
          </div>

          <div className="order-2 hidden justify-center lg:flex xl:justify-end">
            <Skeleton className="h-60 w-60 rounded-full xl:h-[17.5rem] xl:w-[17.5rem]" />
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutSkeleton() {
  return (
    <section className={cn(SECTION_PADDING, 'bg-secondary/30')}>
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <SectionHeaderSkeleton titleWidth="w-64 sm:w-80" withSubtitle={false} />
        <div className="grid grid-cols-1 gap-y-6 sm:gap-y-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-12 xl:gap-x-16">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-card/30 p-3 sm:min-h-[6rem]"
                >
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="aspect-[4/5] w-full min-h-[16rem] rounded-xl sm:min-h-[20rem] lg:min-h-0" />
        </div>
      </div>
    </section>
  )
}

function SkillsSkeleton() {
  return (
    <section className={SECTION_PADDING}>
      <div className="mx-auto max-w-6xl space-y-2 sm:space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <Skeleton className="h-5 w-36 sm:w-44" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl sm:h-14" />
      </div>
    </section>
  )
}

function CardGridSkeleton({
  cards,
  gridClass,
  imageAspect = 'aspect-[4/3] sm:aspect-video',
}: {
  cards: number
  gridClass: string
  imageAspect?: string
}) {
  return (
    <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border/40 bg-card/30 p-0"
        >
          <Skeleton className={`w-full rounded-none ${imageAspect}`} />
          <div className="space-y-2 p-3 sm:p-4">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionSkeleton({
  cards,
  gridClass,
  withFilters = false,
  bgClass = '',
}: {
  cards: number
  gridClass: string
  withFilters?: boolean
  bgClass?: string
}) {
  return (
    <section className={cn(SECTION_PADDING_X, SECTION_PADDING_Y_LOOSE, bgClass)}>
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <SectionHeaderSkeleton />
        {withFilters ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 shrink-0 rounded-full sm:w-20" />
            ))}
          </div>
        ) : null}
        <CardGridSkeleton cards={cards} gridClass={gridClass} />
      </div>
    </section>
  )
}

export function HomePageSkeleton() {
  return (
    <main className="min-h-screen min-w-0" aria-busy="true" aria-label="Loading page">
      <HeroSkeleton />
      <AboutSkeleton />
      <SkillsSkeleton />
      <SectionSkeleton cards={3} gridClass="grid-cols-2 md:grid-cols-3" />
      <SectionSkeleton
        cards={4}
        gridClass="grid-cols-2 md:grid-cols-4"
        withFilters
      />
    </main>
  )
}
