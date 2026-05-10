import { cn } from '@/lib/utils'
import { bookingStatusLabel, bookingStatusColor } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-800',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  gray:    'bg-gray-100 text-gray-500',
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  )
}

export function BookingStatusBadge({ status }: { status: string }) {
  const colorClass = bookingStatusColor[status] ?? 'bg-gray-100 text-gray-500'
  const label      = bookingStatusLabel[status] ?? status

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClass,
    )}>
      {label}
    </span>
  )
}