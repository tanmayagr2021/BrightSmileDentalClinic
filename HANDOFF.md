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

**Phase C complete** — Public website foundation built. Header, navigation, footer, design system, and layout architecture are live.

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
- `<Header />` — sticky, client component, mobile menu
- `<main id="main-content">` — all page content
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

### Animations (`src/lib/animations.ts`)

Framer Motion variants ready to use: `fadeUp`, `fadeIn`, `fadeDown`, `slideInRight`, `scaleIn`, `stagger`, `staggerSlow`.

Usage:
```tsx
import { motion } from 'framer-motion'
import { fadeUp, stagger } from '@/lib/animations'

<motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  <motion.h2 variants={fadeUp}>Heading</motion.h2>
</motion.div>
```

### Static Data (`src/lib/constants.ts`)

Contains: `CLINIC_NAME`, `CLINIC_TAGLINE`, `NAV_LINKS`, `FOOTER_QUICK_LINKS`, `OPENING_HOURS`, `CLINIC_CONTACT`.

**Important:** Contact info and opening hours are placeholder values. These should be fetched from `site_settings` and `opening_hours` tables in future phases. The constants serve as SSG fallbacks.

### Utilities (`src/lib/utils.ts`)

| Function | Purpose |
|----------|---------|
| `cn(...classes)` | Simple class joiner. Consider adding `tailwind-merge` before Phase D for complex class merging. |
| `slugify(text)` | Converts strings to URL-safe slugs |
| `formatDate(date)` | Formats Date/ISO string to "9 June 2026" |
| `formatTime(time)` | Converts "14:30:00" to "2:30 PM" |
| `storageUrl(bucket, path)` | Constructs Supabase Storage public URLs |
| `clamp(value, min, max)` | Clamps a number |

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

## What Was NOT Built Yet

- Homepage sections (hero, services, doctors, stats, testimonials, FAQ, gallery preview, CTA)
- Any public page content (/services, /doctors, /gallery, /about, /contact)
- Appointment booking form
- Admin dashboard
- API routes (appointments, contact, cron, revalidate)
- Email templates
- Blog

---

## Next Phase

**Phase D — Homepage**
Build all homepage sections using the established design system. All sections should use `motion.div` with `whileInView` for scroll animations. Content should be fetched from Supabase (doctors, services, testimonials, FAQs, gallery) with ISR revalidation.
