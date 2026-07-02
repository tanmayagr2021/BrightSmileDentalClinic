import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'white'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  className?: string
  'aria-label'?: string
  target?: '_blank' | '_self'
  rel?: string
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary text-[#14202E] hover:bg-primary-dark active:scale-[0.98] shadow-sm hover:shadow',
  secondary:
    'bg-dark text-cream hover:bg-dark/90 active:scale-[0.98] shadow-sm hover:shadow',
  outline:
    'border border-primary text-primary hover:bg-primary hover:text-[#14202E] active:scale-[0.98]',
  ghost:
    'text-primary hover:bg-primary/10 active:scale-[0.98]',
  white:
    'border border-white/40 text-white hover:bg-white hover:text-dark active:scale-[0.98]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-4 py-2 rounded-lg',
  md: 'text-sm px-5 py-2.5 rounded-lg',
  lg: 'text-sm px-7 py-3.5 rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className,
  'aria-label': ariaLabel,
  target,
  rel,
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-2 font-heading font-semibold tracking-wide transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  const classes = cn(base, variantStyles[variant], sizeStyles[size], className)

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={target}
        rel={target === '_blank' ? (rel ?? 'noopener noreferrer') : rel}
      >
        {loading ? <Spinner /> : children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      aria-label={ariaLabel}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
