import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function Spinner({ size = 'md', className, text }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <div
        className={cn(
          'border-primary-600 border-t-transparent rounded-full animate-spin',
          sizeClasses[size]
        )}
      ></div>
      {text && <p className="text-sm text-dark-muted">{text}</p>}
    </div>
  )
}
