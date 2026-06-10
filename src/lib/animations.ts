import type { Variants } from 'framer-motion'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_IN_OUT = [0.45, 0, 0.55, 1] as const
export const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const
export const SPRING_SOFT = { type: 'spring' as const, stiffness: 260, damping: 24 }
export const SPRING_FIRM = { type: 'spring' as const, stiffness: 340, damping: 28 }
export const SPRING_GENTLE = { type: 'spring' as const, stiffness: 180, damping: 22 }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
}

export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_CINEMATIC },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_CINEMATIC },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_CINEMATIC },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

export const scaleInSpring: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_SOFT,
  },
}

// Clip-path reveal from bottom — cinematic text entrance
export const clipRevealUp: Variants = {
  hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    opacity: 1,
    transition: { duration: 0.8, ease: EASE_CINEMATIC },
  },
}

// Blur + fade entrance — premium feel
export const blurFadeIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 14 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.75, ease: EASE_OUT },
  },
}

// Scale-X reveal for decorative lines
export const lineReveal: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease: EASE_CINEMATIC },
  },
}

// Lift + reveal — for cards
export const liftIn: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

export const revealFromBottom: Variants = {
  hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    opacity: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
}

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

export const staggerMed: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
}
