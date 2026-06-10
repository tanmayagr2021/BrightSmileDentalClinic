'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, scaleIn } from '@/lib/animations'
import { DOCTORS_STATIC } from '@/lib/constants'

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

function UserIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function DoctorsSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div>
            <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2">
              <span className="inline-block h-px w-5 bg-primary" />
              Our Team
            </motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
              Meet Our Doctors
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
              Our NMC-registered team brings years of expertise and genuine care to every appointment.
            </motion.p>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-gray-600 transition-all hover:border-primary hover:text-primary"
            >
              All Doctors <ArrowRight />
            </Link>
          </motion.div>
        </motion.div>

        {/* Doctor cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {DOCTORS_STATIC.map((doctor) => (
            <motion.div
              key={doctor.name}
              variants={scaleIn}
              whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-gray-200/60"
            >
              {/* Avatar area */}
              <div
                className="relative flex h-52 items-center justify-center overflow-hidden"
                style={{ backgroundColor: doctor.bg }}
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" aria-hidden="true" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" aria-hidden="true" />

                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                  <span className="font-display text-3xl font-bold text-white">
                    {doctor.initials}
                  </span>
                </div>

                <span className="absolute right-4 top-4 rounded-lg bg-white/20 px-2.5 py-1 font-heading text-xs font-semibold text-white backdrop-blur-sm">
                  {doctor.qualification}
                </span>

                {/* Bookable badge */}
                {doctor.bookable && (
                  <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 font-heading text-[0.6rem] font-semibold uppercase tracking-wide text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Accepting Patients
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-primary">
                  {doctor.nmc}
                </p>
                <h3 className="mt-1 font-heading text-base font-semibold text-dark">
                  {doctor.name}
                </h3>
                <p className="mt-1 font-body text-sm text-gray-500">
                  {doctor.role}
                </p>

                {doctor.bookable ? (
                  <Link
                    href="/appointments"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
                  >
                    <CalendarIcon />
                    Book Appointment
                  </Link>
                ) : (
                  <Link
                    href="/doctors"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tint px-4 py-2.5 font-heading text-xs font-semibold text-dark transition-all hover:bg-gray-100 active:scale-[0.98]"
                  >
                    <UserIcon />
                    View Profile
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Booking note */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 text-center font-body text-xs text-gray-400"
        >
          Appointments available with Dr. Sachin Agrawal and Dr. Binita Adhikari.
          Other specialists are available by referral.
        </motion.p>
      </div>
    </section>
  )
}
