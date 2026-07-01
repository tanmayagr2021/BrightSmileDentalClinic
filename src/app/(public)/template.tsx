'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { EASE_OUT } from '@/lib/animations'

// Cross-fades routed content on navigation. Header/Footer live outside this
// (in PublicLayout) so they never unmount — only the page body fades, which
// is what avoids the blank/white-flash feeling on route change.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
