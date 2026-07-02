'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger } from '@/lib/animations'
import { trackEvent } from '@/lib/analytics'
import { pick, interpolate } from '@/lib/content-client'

const TREATMENT_OPTIONS = [
  'General Check-up',
  'Teeth Cleaning',
  'Cosmetic Dentistry',
  'Teeth Whitening',
  'Orthodontics / Braces',
  'Dental Implants',
  'Root Canal Treatment',
  'Oral Surgery',
  'Paediatric Dentistry',
  'Emergency Appointment',
  'Other / Not sure',
]

/* eslint-disable @typescript-eslint/no-unused-vars */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M10 2a6 6 0 016 6c0 4.5-6 10-6 10S4 12.5 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10 1.5a8.5 8.5 0 110 17A8.5 8.5 0 0110 1.5zM0 10a10 10 0 1117.95 6.07L20 20l-4.07-2.07A10 10 0 010 10z" />
    </svg>
  )
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-gray-600 mb-1">{label}</p>
        {children}
      </div>
    </div>
  )
}
/* eslint-enable @typescript-eslint/no-unused-vars */

type HourRow = { days: string; hours: string; open: boolean }

export default function ContactClient({
  phone,
  phoneWhatsApp,
  email,
  address,
  mapsUrl,
  facebook,
  hours,
  content,
}: {
  phone: string
  phoneWhatsApp: string
  email: string
  address: string
  mapsUrl: string
  facebook: string
  hours: HourRow[]
  content: Record<string, string>
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', treatment: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || undefined,
          phone: form.phone,
          treatment: form.treatment || undefined,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong. Please try again or call us directly.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setSubmitError('Network error. Please check your connection or call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Emergency banner */}
      <div className="bg-red-50 border-b border-red-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 4.5V8.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="font-heading text-xs font-semibold text-red-700">
            {pick(content, 'contact.emergency.heading', 'Dental Emergency?')}
          </p>
          <p className="font-body text-xs text-red-600">
            {pick(content, 'contact.emergency.text', 'Call us immediately — we do our best to see emergency patients the same day.')}
          </p>
          <a
            href={`tel:${phone}`}
            onClick={() => trackEvent('Phone Clicked', { location: 'emergency-banner' })}
            className="ml-auto flex-shrink-0 rounded-lg bg-red-500 px-4 py-2 font-heading text-xs font-semibold text-white transition-colors hover:bg-red-600"
          >
            {interpolate(pick(content, 'contact.emergency.cta_label_template', 'Call Now: {phone}'), { phone })}
          </a>
        </div>
      </div>

      {/* Main split — full viewport height */}
      <div className="flex min-h-[calc(100vh-56px)] flex-col lg:flex-row">

        {/* LEFT PANEL — dark, contact info */}
        <div className="relative flex flex-col overflow-hidden bg-[#0E1B2E] px-8 py-14 lg:w-[42%] lg:px-14 lg:py-20 xl:px-16">
          {/* Architectural grid overlay */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
            aria-hidden="true"
          >
            <defs>
              <pattern id="contact-grid" width="52" height="52" patternUnits="userSpaceOnUse">
                <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contact-grid)" />
          </svg>

          {/* Accent glow */}
          <div
            className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Top: eyebrow + heading + desc */}
            <div>
              <span className="inline-flex items-center gap-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="inline-block h-px w-5 bg-gold" />
                {pick(content, 'contact.hero.eyebrow', 'Get in Touch')}
              </span>
              <h1 className="mt-4 font-display text-5xl text-white tracking-display leading-[1.06] lg:text-6xl">
                {pick(content, 'contact.hero.headline_line1', "Let's talk about")}<br />{pick(content, 'contact.hero.headline_line2', 'your smile.')}
              </h1>
              <p className="mt-5 max-w-xs font-body text-sm text-white/85 leading-relaxed">
                {pick(content, 'contact.hero.description', "We're here to answer your questions — no commitment, no pressure. Reach us by phone, WhatsApp, email, or the form.")}
              </p>
            </div>

            {/* Contact details — pushed to bottom on lg */}
            <div className="mt-14 lg:mt-auto lg:pt-16">
              {/* Phone */}
              <div className="mb-8">
                <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {pick(content, 'contact.panel.phone_label', 'Phone')}
                </p>
                <a
                  href={`tel:${phone}`}
                  onClick={() => trackEvent('Phone Clicked', { location: 'contact-panel' })}
                  className="font-display text-3xl text-white transition-colors hover:text-primary"
                >
                  {phone}
                </a>
              </div>

              {/* WhatsApp */}
              <div className="mb-8">
                <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {pick(content, 'contact.panel.whatsapp_label', 'WhatsApp')}
                </p>
                <a
                  href={`https://wa.me/${phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('WhatsApp Clicked', { location: 'contact-panel' })}
                  className="font-body text-base text-white/75 transition-colors hover:text-white"
                >
                  {phoneWhatsApp}
                </a>
              </div>

              {/* Email */}
              <div className="mb-8">
                <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {pick(content, 'contact.panel.email_label', 'Email')}
                </p>
                <a
                  href={`mailto:${email}`}
                  onClick={() => trackEvent('Email Clicked')}
                  className="break-all font-body text-sm text-white/75 transition-colors hover:text-white"
                >
                  {email}
                </a>
              </div>

              {/* Address */}
              <div>
                <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {pick(content, 'contact.panel.address_label', 'Address')}
                </p>
                <p className="font-body text-sm text-white/85 leading-relaxed">{address}</p>
              </div>

              {/* Opening Hours */}
              <div className="mt-8 border-t border-white/[0.06] pt-8">
                <p className="mb-4 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/75">
                  Opening Hours
                </p>
                <div className="divide-y divide-white/[0.04]">
                  {hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-3 py-2">
                      <span className="font-body text-xs text-white/75">{h.days}</span>
                      <span className="flex-shrink-0 font-heading text-xs font-semibold text-white/75">
                        {h.open ? h.hours : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social row */}
              <div className="mt-8 flex gap-4">
                <a
                  href={`https://wa.me/${phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('WhatsApp Clicked', { location: 'social-row' })}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 font-heading text-xs font-semibold text-white/75 transition-all hover:border-white/15 hover:text-white"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 1.5a8.5 8.5 0 110 17A8.5 8.5 0 0110 1.5zM0 10a10 10 0 1117.95 6.07L20 20l-4.07-2.07A10 10 0 010 10z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 font-heading text-xs font-semibold text-white/75 transition-all hover:border-white/15 hover:text-white"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
                    <path d="M18 10a8 8 0 10-9.25 7.903V12.89H7.078V10H8.75V8.124c0-1.653.995-2.565 2.492-2.565.722 0 1.477.128 1.477.128v1.622h-.832c-.82 0-1.075.508-1.075 1.03V10h1.83l-.292 2.89H10.81v5.013A8.002 8.002 0 0018 10z" />
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — white, form */}
        <div className="flex-1 bg-white px-8 py-14 lg:px-14 lg:py-20 xl:px-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {!submitted ? (
              <>
                <motion.div variants={fadeUp} className="mb-7">
                  <h2 className="font-display text-3xl text-dark tracking-display">{pick(content, 'contact.form.heading', 'Send Us a Message')}</h2>
                  <p className="mt-2 font-body text-sm text-zinc-600">
                    {pick(content, 'contact.form.subtext', "We'll respond within 24 hours on working days.")}
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div variants={fadeUp} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block font-heading text-xs font-semibold text-dark mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        placeholder="Your full name"
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block font-heading text-xs font-semibold text-dark mb-1.5">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        placeholder="e.g. 9801234567"
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <label htmlFor="contact-email" className="block font-heading text-xs font-semibold text-dark mb-1.5">
                      Email Address <span className="text-gray-600 font-normal">(optional)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <label htmlFor="contact-treatment" className="block font-heading text-xs font-semibold text-dark mb-1.5">
                      Treatment Interest
                    </label>
                    <select
                      id="contact-treatment"
                      value={form.treatment}
                      onChange={update('treatment')}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-sm text-dark outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                    >
                      <option value="">Select a treatment (optional)</option>
                      {TREATMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <label htmlFor="contact-message" className="block font-heading text-xs font-semibold text-dark mb-1.5">
                      Your Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={update('message')}
                      placeholder="Tell us about your concern or question..."
                      required
                      rows={4}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-primary py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60 sm:w-auto sm:px-8"
                    >
                      {submitting ? 'Sending...' : pick(content, 'contact.form.submit_label', 'Send Message')}
                    </button>
                    {submitError && (
                      <p role="alert" className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 font-body text-xs text-red-700">
                        {submitError}
                      </p>
                    )}
                    {!submitError && (
                      <p className="mt-3 font-body text-xs text-gray-600">
                        {pick(content, 'contact.form.submit_note', 'We respond within 24 hours · Your data is kept private and never shared.')}
                      </p>
                    )}
                  </motion.div>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-primary" aria-hidden="true">
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl text-dark tracking-display">{pick(content, 'contact.form.success_heading', 'Message Sent!')}</h2>
                <p className="mt-2 font-body text-sm text-zinc-600 max-w-xs leading-relaxed">
                  {(() => {
                    const [before, after] = pick(content, 'contact.form.success_subtext_template', "Thank you, {name}. We'll get back to you within 24 hours.").split('{name}')
                    return <>{before}<strong className="text-dark">{form.name}</strong>{after}</>
                  })()}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: '', phone: '', email: '', treatment: '', message: '' })
                  }}
                  className="mt-6 font-heading text-sm font-semibold text-primary hover:text-primary-dark underline-offset-2 hover:underline"
                >
                  {pick(content, 'contact.form.send_another_label', 'Send another message')}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Below split — map + directions */}
      <div className="bg-white">
        <div className="border-t border-gray-100">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto max-w-7xl px-4 pt-10 pb-4 sm:px-6 lg:px-8"
          >
            <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-gray-600 mb-4">
              {pick(content, 'contact.map.heading', 'Find Us')}
            </h2>
            <a
              href={mapsUrl || 'https://maps.app.goo.gl/1zc3q43cxKxpcoEM6'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('Map Clicked')}
              aria-label="Open Bright Smile Dental Clinic on Google Maps"
              className="group relative block overflow-hidden rounded-2xl border border-gray-100 h-80 sm:h-96 transition-all duration-300 hover:shadow-premium hover:border-primary/20"
              style={{ background: '#0E1B2E' }}
            >
              {/* Dot grid */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <pattern id="map-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.8" fill="white" fillOpacity="0.055" />
                  </pattern>
                  <pattern id="map-roads-h" width="112" height="112" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="56" x2="112" y2="56" stroke="white" strokeWidth="0.6" strokeOpacity="0.06" />
                    <line x1="56" y1="0" x2="56" y2="112" stroke="white" strokeWidth="0.6" strokeOpacity="0.06" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-dots)" />
                <rect width="100%" height="100%" fill="url(#map-roads-h)" />
              </svg>

              {/* Road lines — decorative */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden="true">
                <line x1="0" y1="55%" x2="100%" y2="55%" stroke="white" strokeWidth="1.5" />
                <line x1="35%" y1="0" x2="35%" y2="100%" stroke="white" strokeWidth="1" />
                <line x1="70%" y1="0" x2="70%" y2="100%" stroke="white" strokeWidth="0.7" />
                <line x1="0" y1="25%" x2="100%" y2="25%" stroke="white" strokeWidth="0.7" />
                <line x1="0" y1="78%" x2="100%" y2="78%" stroke="white" strokeWidth="0.5" />
              </svg>

              {/* Accent glow */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <div className="h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
              </div>

              {/* Centre content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-[0_8px_32px_rgba(74,155,111,0.45)] transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8" aria-hidden="true">
                      <path d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7zm0 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
                    </svg>
                  </div>
                  <div className="mx-auto mt-1 h-1.5 w-6 rounded-full bg-black/25 blur-sm" />
                </div>
                <div className="text-center">
                  <p className="font-heading text-base font-semibold text-white">Bright Smile Dental Clinic</p>
                  <p className="mt-1 font-body text-sm text-white/85">{address}</p>
                </div>
              </div>

              {/* Open in Maps CTA */}
              <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-2.5 border-t border-white/10 bg-white/[0.04] py-3.5 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08]">
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden="true">
                  <path d="M8 2a4 4 0 014 4c0 3-4 8-4 8s-4-5-4-8a4 4 0 014-4zm0 2.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span className="font-heading text-xs font-semibold text-white/75 transition-colors group-hover:text-white">
                  Open in Google Maps
                </span>
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-white/60 transition-all group-hover:translate-x-0.5 group-hover:text-white/70" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Directions */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-sm font-semibold text-dark mb-6">
              {pick(content, 'contact.directions.heading', 'Getting Here')}
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  icon: '🚗',
                  label: pick(content, 'contact.directions.car_label', 'By Car'),
                  desc: pick(content, 'contact.directions.car_desc', 'Enter Nagpokhari from the Naxal main road. The clinic is visible from the road with clear signage. Parking is available nearby.'),
                },
                {
                  icon: '🚌',
                  label: pick(content, 'contact.directions.bus_label', 'By Bus'),
                  desc: pick(content, 'contact.directions.bus_desc', 'Micro-buses and tempos run frequently to Naxal from Ratnapark and Putalisadak. Get off at Nagpokhari stop.'),
                },
                {
                  icon: '🚶',
                  label: pick(content, 'contact.directions.foot_label', 'On Foot'),
                  desc: pick(content, 'contact.directions.foot_desc', 'A 10-minute walk from Naxal Bhagwati temple. We are located in a well-known area — locals can direct you.'),
                },
              ].map((dir) => (
                <motion.div key={dir.label} variants={fadeUp} className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{dir.icon}</span>
                  <div>
                    <p className="font-heading text-xs font-semibold text-dark">{dir.label}</p>
                    <p className="mt-1 font-body text-xs text-zinc-600 leading-relaxed">{dir.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <div className="mt-10 text-center">
            <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">
              {pick(content, 'contact.back_home_label', '← Back to home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
