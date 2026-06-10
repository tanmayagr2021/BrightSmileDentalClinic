'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, slideInLeft, slideInRight, blurFadeIn } from '@/lib/animations'
import { DOCTORS_STATIC } from '@/lib/constants'

const leadDoctors = DOCTORS_STATIC.filter((d) => d.type === 'lead' && d.visible)
const specialistCount = DOCTORS_STATIC.filter((d) => d.type === 'specialist' && d.visible).length

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NmcBadge() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
      <path d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z" fill="#4A9B6F" fillOpacity="0.12" stroke="#4A9B6F" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 8l2 2 3.5-3.5" stroke="#4A9B6F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 6.5h13M5.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function DoctorsSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16"
        >
          <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Direct Appointments
          </motion.span>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
                Meet Our Lead Dentists
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 max-w-lg font-body text-base text-gray-500 leading-relaxed">
                Appointments are available directly with our two lead dentists — both NMC-registered with a decade of experience between them.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="flex-shrink-0">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-gray-600 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
              >
                Full Care Team <ArrowRight />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Lead dentist cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {leadDoctors.map((doc, i) => (
            <motion.div
              key={doc.slug}
              variants={i === 0 ? slideInLeft : slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-gray-200/70 transition-shadow duration-400"
            >
              {/* Coloured banner */}
              <div
                className="relative flex items-end justify-between overflow-hidden px-8 pt-12 pb-9"
                style={{ backgroundColor: doc.color }}
              >
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/[0.04]" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/[0.04]" aria-hidden="true" />
                {/* Grid pattern */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]" aria-hidden="true">
                  <defs>
                    <pattern id={`doc-grid-${doc.slug}`} width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#doc-grid-${doc.slug})`} />
                </svg>

                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                    <span className="font-display text-3xl font-bold text-white">{doc.initials}</span>
                  </div>
                  {/* Live indicator */}
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 ring-2 ring-white/30">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>

                <div className="relative text-right">
                  <span className="rounded-xl bg-white/20 px-3 py-1.5 font-heading text-xs font-semibold text-white backdrop-blur-sm">
                    {doc.qualification}
                  </span>
                  <p className="mt-2 font-heading text-[0.62rem] font-semibold uppercase tracking-wider text-white/55">
                    {doc.nmc}
                  </p>
                  <p className="mt-0.5 font-heading text-[0.65rem] text-white/45">{doc.experience}</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-dark">{doc.name}</h3>
                    <p className="mt-0.5 font-body text-sm font-medium text-primary">{doc.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 flex-shrink-0">
                    <NmcBadge />
                    <span className="font-heading text-[0.6rem] font-semibold text-primary">NMC Verified</span>
                  </div>
                </div>

                <p className="mt-4 font-body text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {doc.bio}
                </p>

                {/* Specializations */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {doc.specializations.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-lg bg-tint px-2.5 py-1 font-heading text-[0.62rem] font-semibold text-dark/60">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Languages + education */}
                <div className="mt-5 border-t border-gray-50 pt-5">
                  <div className="flex items-center gap-4 font-body text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M1 7h12M7 1a10 10 0 010 12M7 1a10 10 0 000 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                      {doc.languages.join(' · ')}
                    </span>
                    <span>·</span>
                    <span>{doc.education.split(' — ')[0]}</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Link
                    href="/appointments"
                    className="group/btn inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.97]"
                  >
                    <CalIcon />
                    Book with {doc.shortName.replace('Dr. ', 'Dr ')}
                  </Link>
                  <Link
                    href={`/doctors/${doc.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3.5 font-heading text-xs font-semibold text-dark transition-all hover:border-primary hover:text-primary active:scale-[0.97]"
                  >
                    View Profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Care team teaser strip */}
        <motion.div
          variants={blurFadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-tint px-7 py-5 sm:flex-row"
        >
          <div className="flex items-center gap-4">
            {/* Specialist avatar cluster */}
            <div className="flex -space-x-2">
              {DOCTORS_STATIC.filter((d) => d.type === 'specialist').slice(0, 4).map((d, i) => (
                <div
                  key={d.slug}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[0.6rem] font-bold text-white ring-2 ring-tint"
                  style={{ backgroundColor: d.color, zIndex: 10 - i }}
                >
                  {d.initials}
                </div>
              ))}
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-dark">
                Supported by {specialistCount} Specialists & a dedicated care team
              </p>
              <p className="font-body text-xs text-gray-500">
                Specialist consultations coordinated as part of your personalised care plan.
              </p>
            </div>
          </div>
          <Link
            href="/doctors"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-heading text-xs font-semibold text-dark transition-all hover:border-primary hover:text-primary"
          >
            Meet the Full Team <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
