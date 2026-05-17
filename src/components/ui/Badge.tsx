import { cn } from '@/lib/utils'
import { bookingStatusLabel } from '@/lib/utils'

type BadgeVariant = 'default' | 'teal' | 'amber' | 'success' | 'warning' | 'danger' | 'info' | 'gray'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  teal:    'bg-teal-100 text-teal-800',
  amber:   'bg-amber-100 text-amber-800',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-800',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-sky-100 text-sky-800',
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
  const variantMap: Record<string, BadgeVariant> = {
    en_paiement: 'amber',
    confirmee:   'teal',
    livree:      'info',
    terminee:    'gray',
    annulee:     'danger',
    remboursee:  'info',   // ou crée une variante 'purple'
    expiree:     'gray',
    en_litige:   'danger',
  }
  const variant = variantMap[status] ?? 'default'
  const label = bookingStatusLabel[status] ?? status

  return <Badge variant={variant}>{label}</Badge>
}