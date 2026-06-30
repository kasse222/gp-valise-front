import { Link } from 'react-router-dom'
import { ArrowRight, Search, Clock, AlertCircle, Package, TrendingUp, AlertOctagon, CheckCircle2 } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { Spinner, StatusBadge, Button, EmptyState, PageHero } from '@/components/ui'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBookings } from '@/hooks/useBookings'
import { formatDate } from '@/lib/utils'

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, variant, icon: Icon }: {
  label:   string
  value:   string | number
  variant: 'primary' | 'danger' | 'success'
  icon:    React.ElementType
}) {
  const colors = {
    primary: { text: 'text-[#1B3A6B]', bg: 'bg-[#EBF4FF]' },
    danger:  { text: 'text-red-600',   bg: 'bg-red-50' },
    success: { text: 'text-emerald-600', bg: 'bg-emerald-50' },
  }[variant]

  return (
    <div className="bg-white border border-slate-100 rounded-[16px] p-5"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
      <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${colors.text}`} aria-hidden />
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-3xl font-black ${colors.text}`}>{value}</p>
    </div>
  )
}

// ── Alert banner ─────────────────────────────────────────────────────────────

function AlertBanner({ icon: Icon, count, label, sub, href, cta, tone }: {
  icon:  React.ElementType
  count: number
  label: string
  sub:   string
  href:  string
  cta:   string
  tone:  'amber' | 'blue'
}) {
  const colors = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', title: 'text-amber-800', sub: 'text-amber-700', link: 'text-amber-800' },
    blue:  { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: 'text-blue-600',  title: 'text-blue-800',  sub: 'text-blue-700',  link: 'text-blue-800' },
  }[tone]

  return (
    <div className={`mb-4 p-4 rounded-[14px] border flex items-start gap-3 ${colors.bg} ${colors.border}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} aria-hidden />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${colors.title}`}>
          {count} {label}
        </p>
        <p className={`text-xs mt-0.5 ${colors.sub}`}>{sub}</p>
        <Link to={href} className={`inline-flex items-center gap-1 mt-2 text-xs font-bold hover:underline ${colors.link}`}>
          {cta} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, refetch } = useBookings()

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const bookings        = data ?? []
  const pendingApproval = bookings.filter(b => b.status === 'pending_approval')
  const pendingPayment  = bookings.filter(b => b.status === 'en_paiement')
  const actifs          = bookings.filter(b => b.status === 'confirmee' || b.status === 'livree').length
  const enLitige        = bookings.filter(b => b.status === 'en_litige').length
  const termines        = bookings.filter(b => b.status === 'termine' || b.status === 'remboursee').length
  const recent          = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">

      <PageHero
        title={`Bonjour, ${user?.first_name} 👋`}
        subtitle="Voici un aperçu de vos envois."
      />

      {pendingApproval.length > 0 && (
        <AlertBanner
          icon={Clock}
          count={pendingApproval.length}
          label={`réservation${pendingApproval.length > 1 ? 's' : ''} en attente d'approbation`}
          sub="Le paiement sera disponible une fois le voyageur a accepté votre demande."
          href="/sender/bookings"
          cta="Voir mes réservations"
          tone="amber"
        />
      )}

      {pendingPayment.length > 0 && (
        <AlertBanner
          icon={AlertCircle}
          count={pendingPayment.length}
          label={`réservation${pendingPayment.length > 1 ? 's' : ''} à payer`}
          sub="Finalisez votre paiement avant expiration du délai."
          href="/sender/bookings"
          cta="Payer maintenant"
          tone="blue"
        />
      )}

      <Link to="/trips"
        className="flex items-center justify-center gap-2 w-full mb-6 bg-[#1B3A6B] hover:bg-[#2351a0] text-white font-bold px-6 py-4 rounded-full text-sm transition-all duration-200 min-h-[52px] shadow-sm hover:shadow-md">
        <Search size={16} aria-hidden />
        Rechercher un trajet
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Réservations actives" value={actifs}   variant="primary" icon={TrendingUp} />
        <StatCard label="En litige"            value={enLitige} variant="danger"  icon={AlertOctagon} />
        <StatCard label="Terminées"            value={termines} variant="success" icon={CheckCircle2} />
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucune réservation"
          description="Explorez les trajets disponibles pour envoyer votre premier colis."
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Réservations récentes</h3>
            <Link to="/sender/bookings" className="text-xs text-[#1B3A6B] hover:underline font-bold">Voir tout</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recent.map(booking => (
              <Link key={booking.id} to={`/sender/bookings/${booking.id}`} className="block group">
                <div className="bg-white border border-slate-100 rounded-[16px] p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-slate-900 text-sm truncate">{booking.trip?.departure ?? '—'}</span>
                      <ArrowRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                      <span className="font-bold text-slate-900 text-sm truncate">{booking.trip?.destination ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge code={booking.status as BookingStatusCode} />
                      <span className="text-xs text-slate-400 hidden sm:inline font-medium">{formatDate(booking.created_at)}</span>
                    </div>
                  </div>
                  {booking.status === 'en_paiement' && (
                    <p className="text-xs text-blue-600 mt-2 font-bold">⏱ Paiement requis avant expiration</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}