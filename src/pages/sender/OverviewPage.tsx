import { Link } from 'react-router-dom'
import { ArrowRight, Search, Home, Clock, AlertCircle } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { Card, Spinner, StatusBadge, Button, EmptyState } from '@/components/ui'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBookings } from '@/hooks/useBookings'
import { formatDate } from '@/lib/utils'
import { Package } from 'lucide-react'

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  variant,
}: {
  label:   string
  value:   string | number
  variant: 'primary' | 'danger' | 'success'
}) {
  const colors = {
    primary: 'text-[#1B3A6B]',
    danger:  'text-red-600',
    success: 'text-emerald-600',
  }

  return (
    <Card>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[variant]}`}>{value}</p>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, refetch } = useBookings()

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const bookings = data ?? []

  // Stats
  const pendingApproval = bookings.filter((b) => b.status === 'pending_approval')
  const pendingPayment  = bookings.filter((b) => b.status === 'en_paiement')
  const actifs          = bookings.filter((b) => b.status === 'confirmee' || b.status === 'livree').length
  const enLitige        = bookings.filter((b) => b.status === 'en_litige').length
  const termines        = bookings.filter((b) => b.status === 'termine' || b.status === 'remboursee').length

  const recent = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.first_name} 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Voici un aperçu de vos envois.</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors shrink-0 mt-1"
        >
          <Home size={15} aria-hidden />
          <span className="hidden sm:inline">Accueil</span>
        </Link>
      </div>

      {/* Alert PENDING_APPROVAL — prioritaire */}
      {pendingApproval.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {pendingApproval.length} réservation{pendingApproval.length > 1 ? 's' : ''} en attente d'approbation
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Le paiement sera disponible une fois le voyageur a accepté votre demande.
            </p>
            <Link
              to="/sender/bookings"
              className="inline-block mt-2 text-xs font-semibold text-amber-800 hover:underline"
            >
              Voir mes réservations →
            </Link>
          </div>
        </div>
      )}

      {/* Alert EN_PAIEMENT */}
      {pendingPayment.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-[14px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-800">
              {pendingPayment.length} réservation{pendingPayment.length > 1 ? 's' : ''} à payer
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Finalisez votre paiement avant expiration du délai.
            </p>
            <Link
              to="/sender/bookings"
              className="inline-block mt-2 text-xs font-semibold text-blue-800 hover:underline"
            >
              Payer maintenant →
            </Link>
          </div>
        </div>
      )}

      {/* CTA Rechercher */}
      <Link
        to="/trips"
        className="flex items-center justify-center gap-2 w-full mb-6 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-6 py-3.5 rounded-[14px] text-sm transition-colors duration-200 min-h-[48px]"
      >
        <Search size={16} aria-hidden />
        Rechercher un trajet
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Réservations actives" value={actifs}   variant="primary" />
        <StatCard label="En litige"            value={enLitige} variant="danger"  />
        <StatCard label="Terminées"            value={termines} variant="success" />
      </div>

      {/* Réservations récentes */}
      {recent.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucune réservation"
          description="Explorez les trajets disponibles pour envoyer votre premier colis."
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Réservations récentes</h3>
            <Link
              to="/sender/bookings"
              className="text-xs text-[#1B3A6B] hover:underline font-medium"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recent.map((booking) => (
              <Link key={booking.id} to={`/sender/bookings/${booking.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {booking.trip?.departure ?? '—'}
                      </span>
                      <ArrowRight size={14} className="shrink-0 text-gray-400" aria-hidden />
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {booking.trip?.destination ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge code={booking.status as BookingStatusCode} />
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {formatDate(booking.created_at)}
                      </span>
                    </div>
                  </div>
                  {booking.status === 'pending_approval' && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      En attente d'approbation du voyageur
                    </p>
                  )}
                  {booking.status === 'en_paiement' && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      ⏱ Paiement requis avant expiration
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}