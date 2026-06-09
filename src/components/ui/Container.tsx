import { cn } from '@/lib/utils'

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl'

interface ContainerProps {
  children: React.ReactNode
  size?: ContainerSize
  className?: string
  as?: React.ElementType
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
}

export default function Container({
  children,
  size = 'xl',
  className,
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Tag>
  )
}
