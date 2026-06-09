'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  as?: React.ElementType
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  as: Tag = 'div',
}: CardProps) {
  const base = cn(
    'rounded-2xl bg-white shadow-card border border-gray-100',
    paddingStyles[padding],
    className
  )

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={base}
      >
        {children}
      </motion.div>
    )
  }

  return <Tag className={base}>{children}</Tag>
}
