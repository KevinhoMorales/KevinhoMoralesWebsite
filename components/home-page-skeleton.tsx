import { Skeleton } from '@/components/ui/skeleton'

function HeroSkeleton() {
  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-6 sm:py-4 md:py-4 lg:min-h-[50vh]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid min-w-0 w-full items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <div className="order-first flex justify-center lg:hidden">
            <Skeleton className="h-32 w-32 rounded-full sm:h-40 sm:w-40" />
          </div>

          <div className="order-2 min-w-0 space-y-4 sm:space-y-5">
            <Skeleton className="h-3 w-28 sm:h-4 sm:w-36" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full max-w-md sm:h-11" />
              <Skeleton className="h-9 w-4/5 max-w-sm sm:h-11" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-2/3 max-w-md" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1 sm:gap-3">
              <Skeleton className="h-9 w-28 rounded-xl sm:h-10 sm:w-32" />
              <Skeleton className="h-9 w-28 rounded-xl sm:h-10 sm:w-32" />
              <Skeleton className="h-9 w-24 rounded-xl sm:h-10 sm:w-28" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-12 rounded-lg sm:h-14 sm:w-14" />
              ))}
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <Skeleton className="h-56 w-56 rounded-full xl:h-64 xl:w-64" />
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionSkeleton({
  cards = 3,
  gridClass = 'grid-cols-2 md:grid-cols-3',
}: {
  cards?: number
  gridClass?: string
}) {
  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-4 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-56 sm:h-9 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border/40 bg-card/30 p-3 sm:p-4"
            >
              <Skeleton className="mb-3 aspect-[4/3] w-full rounded-lg sm:aspect-video" />
              <Skeleton className="mb-2 h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MarqueeSkeleton() {
  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-2 sm:py-3">
      <div className="mx-auto max-w-6xl space-y-2 sm:space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl sm:h-14" />
      </div>
    </section>
  )
}

export function HomePageSkeleton() {
  return (
    <main
      className="min-h-screen min-w-0 animate-in fade-in duration-300"
      aria-busy="true"
      aria-label="Loading page"
    >
      <HeroSkeleton />
      <MarqueeSkeleton />
      <SectionSkeleton cards={3} />
      <SectionSkeleton cards={4} gridClass="grid-cols-2 md:grid-cols-4" />
    </main>
  )
}
