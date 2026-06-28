import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plane, ChevronRight, Filter } from 'lucide-react'

import { Card, Spinner, Button, EmptyState } from '@/components/ui'
import { useTrips } from '@/hooks/useTrips'
import { cn, formatAmount, formatDate, tripStatusLabel, tripStatusColor } from '@/lib/utils'
import type { Trip } from '@/types'
import { PageHero } from '@/components/ui/PageHero'

const STATUS_FILTERS = ['pending', 'active', 'completed', 'cancelled'] as const
type TripStatus = (typeof STATUS_FILTERS)[number]

function TripRow({ trip }: { trip: Trip }) {
  const tripCurrency = trip.currency ?? 'XOF'
  const disponibleKg = (trip.grams_disponible / 1000).toFixed(1) + ' kg'
  return (
    <Link to={`/traveler/trips/${trip.id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 min-h-[64px]">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[#EBF4FF] flex items-center justify-center">
          <Plane className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{trip.departure} → {trip.destination}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {trip.date ? `${formatDate(trip.date)} · ` : ''}{disponibleKg} dispo · {formatAmount(trip.price_per_kg, tripCurrency)}/kg
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', tripStatusColor[trip.status.code] ?? 'bg-gray-100 text-gray-700')}>
          {tripStatusLabel[trip.status.code] ?? trip.status.label}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden />
      </div>
    </Link>
  )
}

export default function TripsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useTrips()
  const [activeStatus, setActiveStatus] = useState<TripStatus | null>(null)

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement des trajets.</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const trips    = data ?? []
  const filtered = activeStatus ? trips.filter((t) => t.status.code === activeStatus) : trips
  const usedStatuses = [...new Set(trips.map((t) => t.status.code))].filter((s): s is TripStatus => STATUS_FILTERS.includes(s as TripStatus))

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <PageHero
        title="Mes trajets"
        subtitle={trips.length > 0 ? `${trips.length} trajet${trips.length > 1 ? 's' : ''} créé${trips.length > 1 ? 's' : ''}` : 'Aucun trajet pour le moment'}
        right={
          <Button variant="secondary" size="sm"
            className="!bg-white/20 !text-white !border-white/30 hover:!bg-white/30"
            onClick={() => navigate('/traveler/trips/new')}>
            + Nouveau
          </Button>
        }
      />

      {trips.length === 0 ? (
        <EmptyState icon={Plane} title="Aucun trajet créé"
          description="Crée ton premier trajet et commence à transporter des bagages."
          action={<Button variant="primary" size="sm" onClick={() => navigate('/traveler/trips/new')}>Proposer un trajet</Button>} />
      ) : (
        <>
          {usedStatuses.length > 1 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap" role="group">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
              <button onClick={() => setActiveStatus(null)} aria-pressed={activeStatus === null}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${activeStatus === null ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Tous ({trips.length})
              </button>
              {usedStatuses.map((status) => (
                <button key={status} aria-pressed={activeStatus === status}
                  onClick={() => setActiveStatus(status === activeStatus ? null : status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${activeStatus === status ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {tripStatusLabel[status] ?? status}
                </button>
              ))}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Aucun trajet pour ce statut.</div>
          ) : (
            <Card className="p-0 overflow-hidden">
              {filtered.map((trip) => <TripRow key={trip.id} trip={trip} />)}
            </Card>
          )}
        </>
      )}
    </div>
  )
}