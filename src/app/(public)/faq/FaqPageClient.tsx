'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger } from '@/lib/animations'
import type { FaqRow } from '@/types/db'
import Script from 'next/script'

type Category = 'all' | string

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Questions',
  general: 'General',
  cosmetic: 'Cosmetic',
  paediatric: 'Paediatric',
  emergency: 'Emergency',
  implants: 'Implants',
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5 text-gray-400" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function FaqPageClient({ initialFaqs }: { initialFaqs: FaqRow[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(initialFaqs.map((f) => f.category).filter(Boolean))) as string[]
    return ['all', ...cats]
  }, [initialFaqs])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return initialFaqs.filter((f) => {
      const matchesCat = activeCategory === 'all' || f.category === activeCategory
      const matchesSearch = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      return f.is_visible && matchesCat && matchesSearch
    }).sort((a, b) => a.sort_order - b.sort_order)
  }, [search, activeCategory, initialFaqs])

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: initialFaqs.filter((f) => f.is_visible).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <div className="bg-white">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Page header */}
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Help Centre
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            Everything you need to know before your visit. Can&apos;t find your answer?{' '}
            <Link href="/contact" className="text-primary underline-offset-2 hover:underline">Contact us.</Link>
          </p>

          {/* Search */}
          <div className="mt-8 relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center" aria-hidden="true">
              <SearchIcon />
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenIndex(null) }}
              placeholder="Search questions..."
              aria-label="Search frequently asked questions"
              className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-3.5 font-body text-sm text-dark placeholder-gray-400 outline-none shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 max-w-lg"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Category tabs */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              variants={fadeUp}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null) }}
              className={`rounded-full px-4 py-2 font-heading text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary'
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
              {activeCategory !== cat && (
                <span className="ml-1.5 font-body font-normal text-gray-300">
                  ({initialFaqs.filter((f) => f.is_visible && (cat === 'all' || f.category === cat)).length})
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Accordion */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${search}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {filtered.map((faq, i) => {
                const isOpen = openIndex === i
                return (
                  <div
                    key={faq.id}
                    className={`overflow-hidden rounded-2xl border transition-colors ${
                      isOpen ? 'border-primary/20 bg-white shadow-sm shadow-primary/5' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[0.55rem] font-bold transition-colors ${
                          isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                        }`} aria-hidden="true">
                          {i + 1}
                        </span>
                        <span className="font-heading text-sm font-semibold text-dark sm:text-base">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronIcon open={isOpen} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="border-t border-gray-50 px-6 pb-6 pt-4 pl-14">
                            <p className="font-body text-sm leading-relaxed text-gray-500">
                              {faq.answer}
                            </p>
                            {faq.category && (
                              <div className="mt-4 flex items-center gap-3">
                                <span className="inline-block rounded-full bg-tint px-2.5 py-1 font-heading text-[0.58rem] font-semibold text-primary uppercase tracking-wide">
                                  {CATEGORY_LABELS[faq.category] ?? faq.category}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-100 bg-tint px-8 py-12 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <SearchIcon />
              </div>
              <p className="font-heading text-sm font-semibold text-dark">No questions found</p>
              <p className="mt-1 font-body text-sm text-gray-400">
                Try a different search term or{' '}
                <button onClick={() => { setSearch(''); setActiveCategory('all') }} className="text-primary hover:underline underline-offset-2">
                  clear filters
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Still have questions? */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 rounded-2xl border border-primary/12 bg-tint p-7 sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-dark">Still have questions?</h2>
              <p className="mt-1 font-body text-sm text-gray-500">
                Our team is happy to answer any question before your visit — no commitment needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <a
                href="tel:+97714419594"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-heading text-xs font-semibold text-dark transition-all hover:border-primary hover:text-primary"
              >
                Call Us
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
