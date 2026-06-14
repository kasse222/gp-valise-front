import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight, Scale, FileText, MessageSquare } from 'lucide-react'

import { Card, Spinner, Button, StatusBadge } from '@/components/ui'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBookings } from '@/hooks/useBookings'
import { formatDate } from '@/lib/utils'
import type { Booking } from '@/types'
import { PageHero } from '@/components/ui/PageHero'

function getDisputedAt(booking: Booking): string {
  const entry = booking.status_history.find((h) => h.new_status === 'en_litige')
  return entry ? entry.changed_at : booking.created_at
}

function DisputeRow({ booking }: { booking: Booking }) {
  const departure   = booking.trip?.departure   ?? '—'
  const destination = booking.trip?.destination ?? '—'
  const kgDisplay   = (booking.kg_reserved / 1000).toFixed(1) + ' kg'

  return (
    <div className="border-b border-gray-100 last:border-0">
      <Link to={`/sender/bookings/${booking.id}`}
        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{departure} → {destination}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kgDisplay} · Litige ouvert le {formatDate(getDisputedAt(booking))}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <StatusBadge code={booking.status as BookingStatusCode} />
          <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden />
        </div>
      </Link>
    </div>
  )
}

export default function DisputesPage() {
  const { data, isLoading, isError, refetch } = useBookings()

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement des litiges.</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const disputes = (data ?? []).filter((b) => b.status === 'en_litige')

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <PageHero
        title="Mes litiges"
        subtitle={disputes.length > 0 ? `${disputes.length} litige${disputes.length > 1 ? 's' : ''} en cours` : 'Aucun litige en cours'}
      />

      {disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-[14px]">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-gray-400" aria-hidden />
          </div>
          <p className="text-gray-500 font-medium">Aucun litige en cours</p>
          <p className="text-sm text-gray-400 mt-1 max-w-md">Si un problème survient avec une réservation, vous pourrez ouvrir un litige depuis la page de la réservation.</p>
          <Link to="/sender/bookings" className="mt-6 inline-flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline">
            <FileText className="w-4 h-4" aria-hidden />
            Voir mes réservations
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex items-start gap-3 text-sm text-amber-800">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            <p>Cliquez sur une réservation pour accéder au fil de discussion du litige.</p>
          </div>
          <Card className="p-0 overflow-hidden">
            {disputes.map((booking) => <DisputeRow key={booking.id} booking={booking} />)}
          </Card>
        </>
      )}
    </div>
  )
}