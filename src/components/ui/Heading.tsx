import { cn } from '@/lib/utils'

type Level = 1 | 2 | 3 | 4
type Align = 'left' | 'center' | 'right'
type Color = 'dark' | 'white' | 'primary'

interface HeadingProps {
  level?: Level
  children: React.ReactNode
  className?: string
  align?: Align
  color?: Color
  subtitle?: string
}

const levelStyles: Record<Level, string> = {
  1: 'font-display text-4xl leading-tight md:text-5xl lg:text-6xl',
  2: 'font-display text-3xl leading-snug md:text-4xl lg:text-[2.75rem]',
  3: 'font-heading text-2xl font-semibold leading-snug md:text-3xl',
  4: 'font-heading text-xl font-semibold leading-snug',
}

const colorStyles: Record<Color, string> = {
  dark: 'text-dark',
  white: 'text-white',
  primary: 'text-primary',
}

const alignStyles: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const tags: Record<Level, React.ElementType> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
}

export default function Heading({
  level = 2,
  children,
  className,
  align = 'left',
  color = 'dark',
  subtitle,
}: HeadingProps) {
  const Tag = tags[level]

  return (
    <div className={cn(alignStyles[align])}>
      <Tag
        className={cn(
          levelStyles[level],
          colorStyles[color],
          className
        )}
      >
        {children}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            'mt-3 font-body text-base leading-relaxed md:text-lg',
            color === 'white' ? 'text-white/70' : 'text-gray-500'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
