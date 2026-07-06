'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { fadeUp, stagger, slideInLeft, slideInRight, blurFadeIn } from '@/lib/animations'
import { useTrackViewOnce } from '@/hooks/useTrackViewOnce'
import { trackEvent } from '@/lib/analytics'
import { pick, interpolate } from '@/lib/content-client'
import type { TeamMemberRow } from '@/lib/content'
import type { DoctorRow } from '@/types/db'

function dColor(d: DoctorRow) { return d.color_hex ?? '#4A9B6F' }
function dInitials(d: DoctorRow) { return d.initials ?? d.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2) }
// Homepage teaser gets one short line, not the full bio — the complete
// biography already lives on /doctors/[slug], one click away via "View Profile".
// A naive "split on the first period" breaks on titles like "Dr. Sachin
// Agrawal is..." (the period after "Dr" isn't a sentence end) — walk
// punctuation-delimited chunks and only stop at one whose preceding word
// isn't a known abbreviation or a bare number (e.g. a decimal).
const SENTENCE_ABBREVIATIONS = new Set(['dr', 'mr', 'mrs', 'ms', 'prof', 'st', 'jr', 'sr'])

function firstSentence(bio: string | null | undefined): string {
  if (!bio) return ''
  const parts = bio.split(/([.!?]+)\s+/)
  let result = ''
  for (let i = 0; i < parts.length; i += 2) {
    const chunk = parts[i]
    const punct = parts[i + 1] ?? ''
    result += chunk + punct
    if (!punct) break
    const lastWord = chunk.trim().split(/\s+/).pop()?.replace(/\.$/, '').toLowerCase() ?? ''
    if (SENTENCE_ABBREVIATIONS.has(lastWord) || /^\d+$/.test(lastWord)) {
      result += ' '
      continue
    }
    break
  }
  return result.trim()
}
function dShortName(d: DoctorRow) { return d.short_name ?? d.full_name }
function tInitials(m: TeamMemberRow) { return m.initials ?? m.name.split(' ').map((w) => w[0]).join('').slice(0, 2) }

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
      <path d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z" fill="#0C3C2D" fillOpacity="0.12" stroke="#0C3C2D" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 8l2 2 3.5-3.5" stroke="#0C3C2D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function DoctorsSection({
  doctors,
  content,
  teamMembers,
}: {
  doctors: DoctorRow[]
  content: Record<string, string>
  teamMembers: TeamMemberRow[]
}) {
  const leadDoctors = doctors.filter((d) => d.doctor_type === 'lead' && d.is_active)
  const specialistCount = doctors.filter((d) => d.doctor_type === 'specialist' && d.is_active).length
  const viewRef = useTrackViewOnce<HTMLElement>('Doctor Section Viewed')
  const hygienists = teamMembers.filter((m) => m.department === 'hygienist' || m.department === 'assistant')
  const supportTeam = teamMembers.filter((m) => m.department === 'reception' || m.department === 'admin')

  return (
    <section ref={viewRef} className="bg-ivory py-24 lg:py-32">
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
            {pick(content, 'home.doctors.eyebrow', 'Direct Appointments')}
          </motion.span>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl lg:text-6xl tracking-display leading-[1.06]">
                {pick(content, 'home.doctors.heading', 'Meet Our Lead Dentists')}
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 max-w-lg font-body text-base text-zinc-600 leading-relaxed">
                {pick(content, 'home.doctors.intro', 'Appointments are available directly with our two lead dentists — both NMC-registered with over a decade of combined experience.')}
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="flex-shrink-0">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-gray-600 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
              >
                {pick(content, 'home.doctors.full_team_label', 'Full Care Team')} <ArrowRight />
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
              whileHover={{ y: -7, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-card hover:shadow-premium transition-all duration-400"
            >
              {/* Coloured banner */}
              <div
                className="relative flex items-end justify-between overflow-hidden px-8 pt-12 pb-9"
                style={{ backgroundColor: dColor(doc) }}
              >
                <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/[0.04]" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/[0.04]" aria-hidden="true" />
                <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]" aria-hidden="true">
                  <defs>
                    <pattern id={`doc-grid-${doc.slug}`} width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#doc-grid-${doc.slug})`} />
                </svg>

                {/* Avatar */}
                <div className="relative">
                  <div className="relative flex h-[5rem] w-[5rem] items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                    {doc.profile_image_url ? (
                      <Image src={doc.profile_image_url} alt={doc.full_name} fill className="object-cover object-top" sizes="80px" />
                    ) : (
                      <span className="font-display text-[2rem] font-bold text-white">{dInitials(doc)}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 ring-2 ring-white/30">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>

                <div className="relative text-right">
                  <span className="rounded-xl bg-white/20 px-3 py-1.5 font-heading text-xs font-semibold text-white backdrop-blur-sm">
                    {doc.qualification}
                  </span>
                  <p className="mt-2 font-heading text-[0.62rem] font-semibold uppercase tracking-wider text-white/80">
                    NMC {doc.nmc_number}
                  </p>
                  <p className="mt-0.5 font-heading text-[0.65rem] text-white/75">{doc.experience_text}</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-dark">{doc.full_name}</h3>
                    <p className="mt-0.5 font-body text-sm font-medium text-primary">{doc.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-1 flex-shrink-0">
                    <NmcBadge />
                    <span className="font-heading text-[0.6rem] font-semibold text-teal">NMC Verified</span>
                  </div>
                </div>

                <p className="mt-4 font-body text-sm text-zinc-600 leading-relaxed">
                  {firstSentence(doc.full_bio ?? doc.short_bio)}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(doc.specializations ?? []).slice(0, 4).map((s) => (
                    <span key={s} className="rounded-lg bg-tint px-2.5 py-1 font-heading text-[0.62rem] font-semibold text-dark/60">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 border-t border-gray-50 pt-5">
                  <div className="flex items-center gap-4 font-body text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M1 7h12M7 1a10 10 0 010 12M7 1a10 10 0 000 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                      {(doc.languages ?? []).join(' · ')}
                    </span>
                    <span>·</span>
                    <span>{(doc.education ?? '').split(' — ')[0]}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Link
                    href="/appointments"
                    onClick={() => trackEvent('Book Doctor Clicked', { doctor: doc.slug })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.97]"
                  >
                    <CalIcon />
                    Book with {dShortName(doc).replace('Dr. ', 'Dr ')}
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

        {/* Care pathway */}
        <motion.div
          variants={blurFadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-7 py-4">
            <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-gray-600">
              {pick(content, 'home.doctors.pathway_heading', 'How Your Care Works')}
            </p>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-primary hover:underline underline-offset-2"
            >
              {pick(content, 'home.doctors.pathway_link_label', 'Meet the full team')} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-start gap-4 px-7 py-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="font-heading text-xs font-bold text-primary">01</span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-dark">{pick(content, 'home.doctors.pathway_step1_title', 'Consult a Lead Dentist')}</p>
                <p className="mt-1 font-body text-xs text-gray-500 leading-relaxed">
                  {pick(content, 'home.doctors.pathway_step1_desc', 'Your first appointment is always with Dr. Sachin or Dr. Binita — who assess your needs and design your care plan.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-7 py-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="font-heading text-xs font-bold text-primary">02</span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-dark">{pick(content, 'home.doctors.pathway_step2_title', 'Your Plan Is Mapped')}</p>
                <p className="mt-1 font-body text-xs text-gray-500 leading-relaxed">
                  {pick(content, 'home.doctors.pathway_step2_desc', 'If your treatment is straightforward, it begins right here. If it needs deeper expertise, your dentist identifies that early.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-7 py-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-dark/10">
                <span className="font-heading text-xs font-bold text-dark">03</span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-dark">{pick(content, 'home.doctors.pathway_step3_title', 'We Call the Right Specialist')}</p>
                <p className="mt-1 font-body text-xs text-gray-500 leading-relaxed">
                  {interpolate(pick(content, 'home.doctors.pathway_step3_desc', 'Implants, periodontics, oral surgery — our {count} visiting specialists join your care, coordinated entirely by us.'), { count: specialistCount })}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {doctors.filter((d) => d.doctor_type === 'specialist' && d.is_active).slice(0, 4).map((d, i) => (
                      <div
                        key={d.slug}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[0.5rem] font-bold text-white ring-1 ring-white"
                        style={{ backgroundColor: dColor(d), zIndex: 10 - i }}
                        title={d.full_name}
                      >
                        {dInitials(d)}
                      </div>
                    ))}
                  </div>
                  <span className="font-body text-[0.65rem] text-gray-600">{specialistCount} specialists on call</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Complete Care Team strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card"
        >
          <div className="border-b border-gray-50 px-7 py-4">
            <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-gray-600">
              {pick(content, 'home.doctors.team_heading', 'Complete Care Team')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 divide-y divide-gray-50 sm:grid-cols-2 sm:divide-x sm:divide-y-0">

            {/* Hygienists */}
            <div className="px-7 py-6">
              <p className="mb-4 font-heading text-xs font-semibold text-gray-600 uppercase tracking-widest">
                {pick(content, 'home.doctors.team_hygienists_label', 'Dental Hygienists')}
              </p>
              <div className="flex flex-col gap-3">
                {hygienists.map((h) => (
                  <div key={h.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 font-heading text-xs font-bold text-teal">
                      {tInitials(h)}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-dark leading-tight">{h.name}</p>
                      <p className="font-body text-xs text-gray-600">{h.role}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal" />
                      <span className="font-heading text-[0.65rem] font-semibold text-teal">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reception + admin */}
            <div className="px-7 py-6">
              <p className="mb-4 font-heading text-xs font-semibold text-gray-600 uppercase tracking-widest">
                {pick(content, 'home.doctors.team_reception_label', 'Reception & Administration')}
              </p>
              <div className="flex flex-col gap-3">
                {supportTeam.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-bold text-primary">
                      {tInitials(s)}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-dark leading-tight">{s.name}</p>
                      <p className="font-body text-xs text-gray-600">{s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/doctors"
                className="mt-5 inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-primary transition-all hover:gap-2.5"
              >
                {pick(content, 'home.doctors.team_meet_everyone_label', 'Meet everyone')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
