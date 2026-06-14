import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Filter } from 'lucide-react'

import { Button, Card, Spinner, EmptyState, StatusBadge } from '@/components/ui'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBookings } from '@/hooks/useBookings'
import { formatDate } from '@/lib/utils'
import type { Booking } from '@/types'
import { PageHero } from '@/components/ui/PageHero'

const FILTER_STATUSES: BookingStatusCode[] = [
  'en_paiement', 'confirmee', 'livree', 'termine',
  'en_litige', 'annule', 'expiree', 'remboursee',
]

function BookingRow({ booking }: { booking: Booking }) {
  const kgDisplay   = (booking.kg_reserved / 1000).toFixed(1) + ' kg'
  const departure   = booking.trip?.departure   ?? '—'
  const destination = booking.trip?.destination ?? '—'

  return (
    <Link to={`/sender/bookings/${booking.id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 min-h-[64px]">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[#EBF4FF] flex items-center justify-center">
          <Package className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{departure} → {destination}</p>
          <p className="text-xs text-gray-500 mt-0.5">{kgDisplay} · {formatDate(booking.created_at)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <StatusBadge code={booking.status as BookingStatusCode} />
        <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden />
      </div>
    </Link>
  )
}

export default function BookingsPage() {
  const { data, isLoading, isError, refetch } = useBookings()
  const [activeStatus, setActiveStatus] = useState<BookingStatusCode | null>(null)

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement des réservations.</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const bookings     = data ?? []
  const usedStatuses = FILTER_STATUSES.filter((s) => bookings.some((b) => b.status === s))
  const filtered     = activeStatus ? bookings.filter((b) => b.status === activeStatus) : bookings
  const sorted       = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <PageHero
        title="Mes réservations"
        subtitle={`${bookings.length} réservation${bookings.length > 1 ? 's' : ''} au total`}
      />

      {usedStatuses.length > 1 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap" role="group" aria-label="Filtrer par statut">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
          <button onClick={() => setActiveStatus(null)} aria-pressed={activeStatus === null}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${activeStatus === null ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tous ({bookings.length})
          </button>
          {usedStatuses.map((status) => (
            <StatusBadge key={status} code={status} clickable active={activeStatus === status}
              onClick={() => setActiveStatus(activeStatus === status ? null : status)} />
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={Package} title="Aucune réservation"
          description="Tu n'as pas encore de réservation. Explore les trajets disponibles pour commencer."
          action={<Link to="/trips" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B3A6B] hover:underline">Rechercher un trajet →</Link>} />
      ) : (
        <Card className="p-0 overflow-hidden">
          {sorted.map((booking) => <BookingRow key={booking.id} booking={booking} />)}
        </Card>
      )}
    </div>
  )
}