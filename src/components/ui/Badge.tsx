import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

type BadgeVariant =
  | 'default' | 'teal' | 'amber' | 'success'
  | 'warning' | 'danger' | 'info' | 'gray' | 'indigo'
 
export type BookingStatusCode =
  | 'en_paiement' | 'confirmee' | 'en_transit' | 'livree'
  | 'termine' | 'annule' | 'expiree' | 'en_litige'
  | 'remboursee' | 'paiement_echoue'
  | 'pending_approval' | 'declined_by_traveler'
 
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  teal:    'bg-teal-50 text-teal-800 border-teal-200',
  amber:   'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
  gray:    'bg-slate-50 text-slate-500 border-slate-200',
  indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200',
}
 
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
  pending_approval:     { variant: 'amber',   label: "En attente d'approbation" },
  declined_by_traveler: { variant: 'danger',  label: 'Refusée par le voyageur' },
}
 
export function Badge({
  children, variant = 'default', className,
}: {
  children: React.ReactNode; variant?: BadgeVariant; className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      'transition-all duration-150',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  )
}
 
export function BookingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as BookingStatusCode]
  if (!config) return <Badge variant="default">{status}</Badge>
  return (
    <Badge variant={config.variant} aria-label={`Statut : ${config.label}`}>
      {config.label}
    </Badge>
  )
}
 
interface StatusBadgeProps {
  code:       BookingStatusCode
  clickable?: boolean
  active?:    boolean
  onClick?:   () => void
  className?: string
}
 
export function StatusBadge({ code, clickable = false, active = false, onClick, className }: StatusBadgeProps) {
  const config = statusConfig[code]
  if (!config) return null
 
  const base = cn(
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
    'transition-all duration-150',
    variantClasses[config.variant],
    clickable && 'cursor-pointer hover:opacity-90 min-h-[32px] active:scale-[0.97]',
    active && 'ring-2 ring-offset-1 ring-current shadow-sm',
    className,
  )
 
  if (clickable && onClick) {
    return (
      <button type="button" onClick={onClick} className={base}
        aria-pressed={active} aria-label={`Filtrer : ${config.label}`}>
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
 
export { statusConfig }