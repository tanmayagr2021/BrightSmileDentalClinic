# Bright Smile Dental Clinic — Developer Handoff

This file is the single source of truth for any developer (or AI session) picking up this project.
Read this before making any changes.

---

## Project Overview

**Client:** Bright Smile Dental Clinic Pvt. Ltd.
**Location:** Nagpokhari, Naxal, Kathmandu, Nepal
**Stack:** Next.js 15 · TypeScript · Tailwind CSS 3 · Framer Motion · Supabase · Vercel

---

## Current Status

**Phase G complete** — Full admin CMS experience built. 15 admin routes across dashboard, content management (showcase, homepage, doctors, services, testimonials, FAQs, gallery), appointment settings, and website/SEO settings. All UI-only with `useState` — no Supabase writes yet. 39 pages total, 0 TypeScript errors, 0 lint warnings.

See `PROJECT_STATUS.md` for the complete phase-by-phase history.

---

## Architecture Decisions

### Route Groups
- `src/app/(public)/` — All public-facing pages. Wrapped by `PublicLayout` via `(public)/layout.tsx`.
- `src/app/(admin)/` — All admin dashboard pages. Auth-protected by `src/middleware.ts`.
- `src/app/page.tsx` — Root homepage. Lives outside `(public)/` to avoid route conflicts. Uses `PublicLayout` directly.
- `src/app/not-found.tsx` — Root 404 page. Uses `PublicLayout` directly (not covered by `(public)/layout.tsx`).

### Layout
`PublicLayout` (`src/components/layout/PublicLayout.tsx`) is the single source of truth for the public page shell:
- Skip-to-content link (accessibility)
- `<Header />` — sticky, client component, mobile menu — `h-[4.75rem] mobile / h-[6.5rem] desktop`
- `<main id="main-content" className="min-h-screen pt-[4.75rem] lg:pt-[6.5rem]">` — all page content
- `<Footer />` — server component

### Design System

**Fonts (defined in `src/app/layout.tsx`):**
| Variable | Font | Usage |
|----------|------|-------|
| `font-display` | DM Serif Display | H1, H2 headings |
| `font-heading` | Poppins 400–700 | Nav, subheadings, buttons, labels |
| `font-body` | Inter | All body text |

**Brand Palette (defined in `tailwind.config.ts` + `globals.css`):**
| Token | Value | Usage |
|-------|-------|-------|
| `primary` / `#4A9B6F` | Medium green | CTAs, accents, links |
| `primary-dark` / `#3d8560` | Deeper green | Hover states |
| `dark` / `#1A3D2B` | Forest green | Footer, headings |
| `tint` / `#F0F7F2` | Pale green-white | Section backgrounds |
| `clinic-text` / `#1C1C1E` | Near-black | Body text |

**Utility classes (in `globals.css`):**
- `.glass` — glassmorphism panel (hero overlays only)
- `.bg-section` — tint background
- `.eyebrow` — small uppercase label above headings
- `.divider` — 1px gray-100 horizontal rule
- `.tracking-display` — tight letter spacing for display fonts
- `.scrollbar-hide` — hides scrollbar

### Component Library (`src/components/ui/`)

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `Button.tsx` | Variants: primary, secondary, outline, ghost, white. Renders as `<button>` or `<Link>` when `href` is provided. |
| `Card` | `Card.tsx` | White card with shadow. `hover` prop enables Framer Motion lift animation. |
| `Container` | `Container.tsx` | Max-width wrapper. Sizes: sm/md/lg/xl (default xl = 1280px). |
| `Heading` | `Heading.tsx` | h1–h4 with correct font/size mapping. Supports `subtitle` prop. |
| `Section` | `Section.tsx` | py-16/20/24 section wrapper. Backgrounds: white, tint, dark, transparent. |

Import from barrel: `import { Button, Card } from '@/components/ui'`

### Homepage Sections (`src/components/sections/`)

| Component | Description |
|-----------|-------------|
| `ShowcaseSection.tsx` | **Homepage hero.** Full-screen cinematic clinic slideshow. Direction-aware transitions, progress bars, glassmorphism booking card, SVG room illustrations. Pause on hover. Admin-ready: SHOWCASE_SLIDES_STATIC supports title/description/visibility/sort. |
| `StatsSection.tsx` | Animated counters on scroll-into-view (ease-out cubic). Client component. Dark background — seamless with ShowcaseSection. |
| `TrustSection.tsx` | 4 trust indicator cards (NMC, technology, gentle care, transparent pricing). |
| `PatientJourneySection.tsx` | 6-step care pathway (Book → Consult → Diagnose → Plan → Treat → Follow-up). CMS-ready from `PATIENT_JOURNEY_STATIC`. |
| `ServicesSection.tsx` | 6 category cards with SVG icons, hover lift, links to `/services/[slug]`. |
| `DoctorsSection.tsx` | **Homepage only: Lead Dentists.** Shows ONLY Dr. Sachin and Dr. Binita. Spring hover lift. Specialist teaser strip links to `/doctors`. |
| `BeforeAfterSection.tsx` | 4 before/after cases on dark background. Category filter tabs. Animated grid. CMS-ready from `BEFORE_AFTER_STATIC`. |
| `TestimonialsSection.tsx` | Featured hero card + video placeholders + secondary 3-column grid. Upgraded in Phase F. |
| `WhyChooseSection.tsx` | 6-reason premium grid + certifications strip. CMS-ready from `WHY_CHOOSE_STATIC`, `CERTIFICATIONS_STATIC`. |
| `FaqSection.tsx` | Smooth accordion + FAQPage JSON-LD schema. |
| `CtaSection.tsx` | Dark split — CTA left, hours/contact right. |

> `HeroSection.tsx` still exists in the file system but is **no longer used on the homepage**. It was replaced by `ShowcaseSection` as the page hero in Phase D Review 2.

### Admin Shell (`src/components/admin/AdminShell.tsx`)

The main admin chrome. Key structure:
- `flex h-screen overflow-hidden bg-gray-50`
- Desktop sidebar: `w-[220px] bg-[#0f1813]` (dark forest green-black) — fixed left
- Topnav: `h-[60px] bg-white border-b` — shows page title, "Website Live" status pill, "View Site" link
- Mobile: hidden sidebar + `AnimatePresence` slide-in drawer with `black/60` backdrop
- Nav sections: Dashboard | Content (Showcase, Homepage, Doctors, Services, Testimonials, FAQs, Gallery) | Clinic (Appointments) | Settings (Website, SEO)
- Active state: `bg-primary/15 text-primary` with green dot indicator

### Admin Layout (`src/app/(admin)/admin/layout.tsx`)

`'use client'` component — checks `usePathname()`:
- `/admin/login` → bare `<div className="min-h-screen bg-gray-50">` (no sidebar)
- Everything else → `<AdminShell>{children}</AdminShell>`

### Animations (`src/lib/animations.ts`)

Framer Motion variants ready to use:

| Variant | Effect |
|---------|--------|
| `fadeUp` | Opacity + Y slide up (standard) |
| `fadeUpSlow` | Slower, more dramatic fade-up |
| `fadeIn` | Opacity only |
| `slideInLeft / Right` | Opacity + X slide |
| `scaleIn` | Opacity + scale from 0.93 |
| `clipRevealUp` | Clip-path reveal from bottom |
| `blurFadeIn` | Blur + opacity + Y — premium entrance |
| `lineReveal` | ScaleX from 0 — for decorative lines |
| `liftIn` | Opacity + Y + scale — for cards |
| `stagger / staggerSlow / staggerFast / staggerMed` | Stagger parent variants |

Easing constants: `EASE_OUT`, `EASE_IN_OUT`, `EASE_CINEMATIC` (Apple-style), `SPRING_SOFT`, `SPRING_FIRM`, `SPRING_GENTLE`

Usage:
```tsx
import { motion } from 'framer-motion'
import { fadeUp, stagger, blurFadeIn } from '@/lib/animations'

<motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  <motion.h2 variants={blurFadeIn}>Heading</motion.h2>
</motion.div>
```

### Static Data (`src/lib/constants.ts`)

Contains: `CLINIC_NAME`, `CLINIC_TAGLINE`, `NAV_LINKS`, `FOOTER_QUICK_LINKS`, `OPENING_HOURS`, `CLINIC_CONTACT`, `HOMEPAGE_STATS`, `DOCTORS_STATIC`, `TEAM_MEMBERS_STATIC`, `SERVICE_CATEGORIES_STATIC`, `SHOWCASE_SLIDES_STATIC`, `FAQS_STATIC`, `TESTIMONIALS_STATIC`, `CLINIC_STORY_STATIC`, `GALLERY_ITEMS_STATIC`, `PATIENT_JOURNEY_STATIC`, `WHY_CHOOSE_STATIC`, `BEFORE_AFTER_STATIC`, `CERTIFICATIONS_STATIC`.

**Important:** Contact info and opening hours are placeholder values. These should be fetched from `site_settings` and `opening_hours` tables in future phases. The constants serve as SSG fallbacks.

### CRITICAL — Doctor Structure

**Homepage (DoctorsSection.tsx):**
- Shows ONLY Dr. Sachin Agrawal and Dr. Binita Adhikari
- Section heading: "Meet Our Lead Dentists"
- Specialist teaser strip links to /doctors

**Doctors page (/doctors):**
- Section 1: Lead Dentists — bookable, large cards
- Section 2: Specialist Network — visiting specialists, referral-based
- Section 3: Care Team — hygienists, assistants, reception, admin (placeholder architecture)

**Never show a booking form or button for non-bookable doctors.**

Implemented via `bookable: boolean` in `DOCTORS_STATIC`. Future admin panel should expose a `bookable` toggle.

### CRITICAL — Showcase Admin Architecture

`SHOWCASE_SLIDES_STATIC` in `src/lib/constants.ts` already mirrors the database schema for `gallery` table category `showcase`:
- `visible: boolean` → admin toggle
- `sortOrder: number` → drag-to-reorder
- `title: string` → editable
- `description: string` → editable
- `gradientFrom / gradientTo / accentColor` → will become image URLs when photos are available

**Future admin panel must support:** Upload image, reorder slides, edit title, edit description, toggle visibility.

### Logo

`/public/images/logo.jpg` — Orange+teal brand logo on white background. Used in `Header.tsx` only.
- Rendered at `h-[3.75rem] mobile / h-[5.25rem] desktop` (significantly increased in Phase D Review 2)
- Header background is white, so JPG white background is invisible
- Footer uses text-only brand display (no logo image)

### TypeScript Notes

Vercel enforces `noImplicitAny` at build time. All Supabase SSR cookie callbacks **must** have explicit types:

```ts
import type { CookieOptions } from '@supabase/ssr'

setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
  // ...
}
```

Middleware must use `export const runtime = 'nodejs'` — `@supabase/ssr` calls Node.js APIs (`process.version`) that don't exist in Edge Runtime.

### Utilities (`src/lib/utils.ts`)

| Function | Purpose |
|----------|---------|
| `cn(...classes)` | Simple class joiner. |
| `slugify(text)` | Converts strings to URL-safe slugs |
| `formatDate(date)` | Formats Date/ISO string to "9 June 2026" |
| `formatTime(time)` | Converts "14:30:00" to "2:30 PM" |
| `storageUrl(bucket, path)` | Constructs Supabase Storage public URLs |
| `clamp(value, min, max)` | Clamps a number |

---

## Live Routes

### Public Routes

| Route | Content |
|-------|---------|
| `/` | Full homepage — cinematic showcase hero + 10 sections |
| `/appointments` | Multi-step booking UI (doctor → date → time → details → confirm → success) |
| `/services` | All 6 categories listed |
| `/services/[slug]` | 6 service detail pages (static) |
| `/doctors` | 3-section: lead dentists + specialists + care team |
| `/doctors/[slug]` | 6 individual profile pages (static) |
| `/contact` | Premium contact page — emergency banner, form UI, map placeholder, directions |
| `/about` | Full about page with clinic story |
| `/gallery` | Placeholder grid (ready for real photos) |
| `/blog` | Coming soon placeholder |
| `/faq` | Search + category filter tabs + accordion |
| `/testimonials` | Full testimonials section |
| `/privacy` | Basic privacy policy |

### Admin Routes

| Route | Content |
|-------|---------|
| `/admin/login` | Login form (auth in Phase H) |
| `/admin/dashboard` | Stats, quick actions, activity feed, content health |
| `/admin/showcase` | Slide CMS — reorder, edit, toggle, upload |
| `/admin/homepage` | Section order CMS — move, toggle, locked items |
| `/admin/doctors` | Lead / Specialist / Team tabs — bookable + visible toggles |
| `/admin/doctors/[id]` | Full doctor edit form |
| `/admin/doctors/new` | Add doctor |
| `/admin/services` | Service list — reorder, toggle |
| `/admin/services/[id]` | Service edit — content / FAQs / SEO tabs |
| `/admin/testimonials` | Inline review edit, toggle, remove |
| `/admin/faqs` | Category tabs, inline edit, reorder, toggle, remove |
| `/admin/gallery` | Category filter, photo grid, visible toggle, remove |
| `/admin/appointments` | Bookable doctors, slot config, confirmation method |
| `/admin/settings/website` | Clinic name, contact info, social, hours |
| `/admin/settings/seo` | Per-page meta title, description, OG, noIndex, SERP preview |

---

## Database

- 35 tables in Supabase project `wtekbxearlykuefnhwse`
- All RLS enabled. Three tiers: anon (public content), admin, super_admin
- `is_admin()` and `is_super_admin()` are SECURITY DEFINER helper functions
- Migrations in `supabase/migrations/` (001–013). All applied and in sync.
- Seed data applied (`supabase/seed.sql`)
- Supabase signup is disabled (`disable_signup: true`)

---

## Environment Variables

See `.env.example` for all 13 required variables. `.env.local` is git-ignored.

Required before any page works:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Required before email works: `RESEND_API_KEY`
Required before rate limiting works: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
Required before cron works: `CRON_SECRET`
Required before ISR works: `REVALIDATION_SECRET`

---

## What Is NOT Built Yet

- Appointment backend (UI is built — form does not submit to Supabase)
- Contact form backend (form UI is built — no Supabase writes)
- Admin authentication (Supabase Auth login — Phase H)
- Role-based access control (Phase H)
- Admin CMS writes to Supabase (all CMS is currently `useState` UI-only)
- API routes (appointments, contact, cron, revalidate)
- Email templates
- Blog articles
- Gallery with real photos

---

## Next Phase

**Phase H — Authentication & Backend Integration**
1. Supabase Auth login wired to `/admin/login`
2. Role-based access: admin / super_admin roles via RLS
3. Appointment booking backend: `POST /api/appointments` → Supabase `appointments` table → Resend confirmation email
4. Contact form backend: `POST /api/contact` → Supabase `contact_messages` table → Resend notification
5. Admin CMS writes: connect all admin form saves to Supabase tables
6. Rate limiting via Upstash Redis on public API routes
Prerequisites: `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` must be set in Vercel env vars before Phase H work begins.
