'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '@/lib/animations'
import { FAQS_STATIC } from '@/lib/constants'
import type { FaqRow } from '@/types/db'
import Script from 'next/script'


type DisplayFaq = { id: string; q: string; a: string }

function normaliseDB(f: FaqRow): DisplayFaq {
  return { id: f.id, q: f.question, a: f.answer }
}

function normaliseStatic(f: typeof FAQS_STATIC[number]): DisplayFaq {
  return { id: f.id, q: f.q, a: f.a }
}

export default function FaqSection({ faqs }: { faqs?: FaqRow[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const displayFaqs: DisplayFaq[] = faqs && faqs.length > 0
    ? faqs.map(normaliseDB)
    : FAQS_STATIC.filter((f) => f.visible).sort((a, b) => a.sortOrder - b.sortOrder).map(normaliseStatic)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: displayFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <section className="bg-ivory py-24 lg:py-32">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14 text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            FAQs
            <span className="inline-block h-px w-5 bg-primary" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Common Questions
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl font-body text-base text-gray-500">
            Everything you need to know before your visit. Can&apos;t find your answer?{' '}
            <a href="/contact" className="text-primary underline-offset-2 hover:underline">
              Contact us.
            </a>
          </motion.p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="space-y-2"
        >
          {displayFaqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={faq.id}
                variants={fadeUp}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-primary/20 border-l-[3px] border-l-primary bg-white shadow-glass'
                    : 'border-gray-100 bg-white/60 hover:bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  aria-expanded={isOpen}
                >
                  <span className={`font-heading font-semibold leading-snug transition-colors duration-200 text-base sm:text-[1.05rem] ${isOpen ? 'text-dark' : 'text-gray-700'}`}>
                    {faq.q}
                  </span>
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <svg viewBox="0 0 20 20" fill="none" className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">
                      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-px w-full bg-primary/8 mb-4" />
                        <p className="font-body text-[0.9rem] leading-relaxed text-gray-500">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
