import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

type BadgeVariant =
  | 'default' | 'teal' | 'amber' | 'success'
  | 'warning' | 'danger' | 'info' | 'gray' | 'indigo'

export type BookingStatusCode =
  | 'en_paiement'
  | 'confirmee'
  | 'en_transit'
  | 'livree'
  | 'termine'
  | 'annule'
  | 'expiree'
  | 'en_litige'
  | 'remboursee'
  | 'paiement_echoue'
  // legacy — conservés pour bookings antérieurs à Instant Booking
  | 'pending_approval'
  | 'declined_by_traveler'

// ─── Variant → classes ─────────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  teal:    'bg-teal-100 text-teal-800',
  amber:   'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-yellow-100 text-yellow-800',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  gray:    'bg-gray-100 text-gray-500',
  indigo:  'bg-indigo-100 text-indigo-700',
}

// ─── Booking status → variant + label ──────────────────────────────────────

const statusConfig: Record<BookingStatusCode, { variant: BadgeVariant; label: string }> = {
  en_paiement:          { variant: 'amber',   label: 'À payer' },
  confirmee:            { variant: 'info',    label: 'Confirmée' },
  en_transit:           { variant: 'indigo',  label: 'En transit ✈️' },
  livree:               { variant: 'teal',    label: 'Livrée' },
  termine:              { variant: 'success', label: 'Terminée' },
  annule:               { variant: 'gray',    label: 'Annulée' },
  expiree:              { variant: 'gray',    label: 'Expirée' },
  en_litige:            { variant: 'danger',  label: 'En litige' },
  remboursee:           { variant: 'default', label: 'Remboursée' },
  paiement_echoue:      { variant: 'danger',  label: 'Paiement échoué' },
  // legacy
  pending_approval:     { variant: 'amber',   label: "En attente d'approbation" },
  declined_by_traveler: { variant: 'danger',  label: 'Refusée par le voyageur' },
}

// ─── Badge générique ───────────────────────────────────────────────────────

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children:   React.ReactNode
  variant?:   BadgeVariant
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  )
}

// ─── BookingStatusBadge ────────────────────────────────────────────────────

export function BookingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as BookingStatusCode]
  if (!config) return <Badge variant="default">{status}</Badge>
  return (
    <Badge variant={config.variant} aria-label={`Statut : ${config.label}`}>
      {config.label}
    </Badge>
  )
}

// ─── StatusBadge — cliquable pour filtres dashboard ───────────────────────

interface StatusBadgeProps {
  code:       BookingStatusCode
  clickable?: boolean
  active?:    boolean
  onClick?:   () => void
  className?: string
}

export function StatusBadge({
  code,
  clickable = false,
  active    = false,
  onClick,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[code]
  if (!config) return null

  const base = cn(
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
    'transition-all duration-150',
    variantClasses[config.variant],
    clickable && 'cursor-pointer hover:opacity-80 min-h-[36px] active:scale-[0.97]',
    active && 'ring-2 ring-offset-1 ring-current',
    className,
  )

  if (clickable && onClick) {
    return (
      <button type="button" onClick={onClick} className={base}
        role="status" aria-label={`Filtrer par statut : ${config.label}`} aria-pressed={active}>
        {config.label}
      </button>
    )
  }

  return (
    <span className={base} role="status" aria-label={`Statut : ${config.label}`}>
      {config.label}
    </span>
  )
}

// ─── Export helper ─────────────────────────────────────────────────────────

export { statusConfig }