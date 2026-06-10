'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, scaleIn, slideInLeft, slideInRight } from '@/lib/animations'
import { DOCTORS_STATIC, TEAM_MEMBERS_STATIC } from '@/lib/constants'

const leadDoctors = DOCTORS_STATIC.filter((d) => d.type === 'lead' && d.visible)
const specialists = DOCTORS_STATIC.filter((d) => d.type === 'specialist' && d.visible)

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 6.5h13M5.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#4A9B6F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DoctorsSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16"
        >
          <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Our Team
          </motion.span>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
                Meet Our Doctors
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
                Our NMC-registered team brings years of expertise and genuine care to every appointment.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="flex-shrink-0">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-gray-600 transition-all hover:border-primary hover:text-primary"
              >
                Full Team Directory <ArrowRight />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── TIER 1: Lead Dentists ── */}
        <div className="mb-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-dark">
              Lead Dentists
            </span>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-heading text-[0.65rem] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Accepting New Patients
            </span>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {leadDoctors.map((doc, i) => (
              <motion.div
                key={doc.slug}
                variants={i === 0 ? slideInLeft : slideInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-gray-200/60"
              >
                {/* Top banner */}
                <div
                  className="relative flex items-end justify-between overflow-hidden px-8 pt-10 pb-8"
                  style={{ backgroundColor: doc.color }}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" aria-hidden="true" />
                  <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" aria-hidden="true" />

                  {/* Avatar */}
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                    <span className="font-display text-3xl font-bold text-white">
                      {doc.initials}
                    </span>
                  </div>

                  <div className="relative text-right">
                    <span className="rounded-xl bg-white/20 px-3 py-1.5 font-heading text-xs font-semibold text-white backdrop-blur-sm">
                      {doc.qualification}
                    </span>
                    <p className="mt-2 font-heading text-[0.65rem] font-semibold uppercase tracking-wider text-white/60">
                      {doc.nmc}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 py-7">
                  <h3 className="font-heading text-xl font-semibold text-dark">{doc.name}</h3>
                  <p className="mt-0.5 font-body text-sm text-primary font-medium">{doc.role}</p>

                  <p className="mt-4 font-body text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {doc.bio}
                  </p>

                  {/* Specializations */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {doc.specializations.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-tint px-2.5 py-1 font-heading text-[0.65rem] font-semibold text-dark/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="mt-5 flex items-center gap-5 border-t border-gray-50 pt-5">
                    <div className="flex items-center gap-1.5">
                      <CheckBadgeIcon />
                      <span className="font-body text-xs text-gray-500">NMC Registered</span>
                    </div>
                    <span className="font-body text-xs text-gray-400">{doc.experience} experience</span>
                  </div>

                  {/* CTA */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href="/appointments"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
                    >
                      <CalendarIcon />
                      Book Appointment
                    </Link>
                    <Link
                      href={`/doctors/${doc.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-heading text-xs font-semibold text-dark transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── TIER 2: Specialist Network ── */}
        <div className="mb-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8"
          >
            <motion.div variants={fadeUp} className="mb-2 flex items-center gap-3">
              <span className="font-heading text-xs font-semibold uppercase tracking-widest text-dark">
                Specialist Network
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </motion.div>
            <motion.p variants={fadeUp} className="max-w-xl font-body text-sm text-gray-500">
              Specialist consultants available based on treatment requirements. Your lead dentist will
              coordinate specialist involvement as part of your care plan.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {specialists.map((doc) => (
              <motion.div
                key={doc.slug}
                variants={scaleIn}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-gray-200/50"
              >
                {/* Small avatar header */}
                <div
                  className="relative flex h-32 items-center justify-center overflow-hidden"
                  style={{ backgroundColor: doc.color }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10" aria-hidden="true" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                    <span className="font-display text-xl font-bold text-white">{doc.initials}</span>
                  </div>
                  <span className="absolute right-3 top-3 rounded-lg bg-white/20 px-2 py-0.5 font-heading text-[0.6rem] font-semibold text-white backdrop-blur-sm">
                    {doc.qualification}
                  </span>
                </div>

                <div className="p-5">
                  <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-widest text-primary">
                    {doc.nmc}
                  </p>
                  <h3 className="mt-1 font-heading text-sm font-semibold text-dark leading-tight">
                    {doc.name}
                  </h3>
                  <p className="mt-1 font-body text-xs text-gray-500">{doc.role}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {doc.specializations.slice(0, 2).map((s) => (
                      <span key={s} className="rounded bg-tint px-2 py-0.5 font-heading text-[0.58rem] font-medium text-gray-600">
                        {s}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/doctors/${doc.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tint px-4 py-2.5 font-heading text-xs font-semibold text-dark transition-all hover:bg-gray-100 active:scale-[0.98]"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── TIER 3: Support Team ── */}
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-dark">
              Our Support Team
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-3"
          >
            {TEAM_MEMBERS_STATIC.filter((m) => m.visible).map((member) => (
              <motion.div
                key={member.name}
                variants={scaleIn}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-dark">{member.name}</p>
                  <p className="font-body text-xs text-gray-500">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-6 font-body text-xs text-gray-400"
          >
            Direct appointments available with our Lead Dentists only.
            Specialist consultations are coordinated as part of your care plan.
          </motion.p>
        </div>

      </div>
    </section>
  )
}
