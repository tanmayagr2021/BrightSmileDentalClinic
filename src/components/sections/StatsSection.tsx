import { HOMEPAGE_STATS } from '@/lib/constants'

export default function StatsSection() {
  return (
    <section className="bg-dark">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {HOMEPAGE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center text-center"
            >
              <span className="font-display text-4xl font-bold text-primary sm:text-5xl">
                {stat.value}
              </span>
              <span className="mt-1.5 font-heading text-xs font-medium uppercase tracking-widest text-white/50">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
