import { cn } from '@/lib/utils'

type Background = 'white' | 'tint' | 'dark' | 'transparent'

interface SectionProps {
  children: React.ReactNode
  background?: Background
  className?: string
  id?: string
  as?: React.ElementType
}

const backgroundClasses: Record<Background, string> = {
  white: 'bg-white',
  tint: 'bg-tint',
  dark: 'bg-dark',
  transparent: 'bg-transparent',
}

export default function Section({
  children,
  background = 'white',
  className,
  id,
  as: Tag = 'section',
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'py-16 sm:py-20 lg:py-24',
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </Tag>
  )
}
