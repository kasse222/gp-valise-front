import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Filter, Plus, ArrowRight, Calendar, Package } from 'lucide-react'

import { Button, Spinner, EmptyState, PageHero } from '@/components/ui'
import { useTrips } from '@/hooks/useTrips'
import { cn, formatAmount, formatDate, tripStatusLabel, tripStatusColor } from '@/lib/utils'
import type { Trip } from '@/types'

const STATUS_FILTERS = ['pending', 'active', 'completed', 'cancelled'] as const
type TripStatus = (typeof STATUS_FILTERS)[number]

// ── Trip Card ─────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: Trip }) {
  const navigate     = useNavigate()
  const currency     = trip.currency ?? 'XOF'
  const dispoKg      = (trip.grams_disponible / 1000).toFixed(1)
  const totalKg      = (trip.capacity / 1000).toFixed(1)
  const pct          = trip.capacity > 0
    ? Math.round(((trip.capacity - trip.grams_disponible) / trip.capacity) * 100)
    : 0
  const barColor     = pct < 50 ? 'bg-emerald-500' : pct <= 80 ? 'bg-amber-500' : 'bg-red-500'
  const statusCls    = tripStatusColor[trip.status.code] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  const statusLabel  = tripStatusLabel[trip.status.code] ?? trip.status.label

  return (
    <div
      onClick={() => navigate(`/traveler/trips/${trip.id}`)}
      className="group bg-white border border-slate-100 rounded-[18px] overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-200"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
    >
      {/* Header corridor */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-3"
        style={{ background: 'linear-gradient(135deg, #0f2544 0%, #1B3A6B 100%)' }}
      >
        <div className="flex items-center gap-2 text-white font-bold text-sm min-w-0">
          <span className="truncate">{trip.departure}</span>
          <Plane className="w-3.5 h-3.5 text-white/50 shrink-0" aria-hidden />
          <span className="truncate">{trip.destination}</span>
        </div>
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0',
          statusCls,
        )}>
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {/* Date */}
        {trip.date && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" aria-hidden />
            {formatDate(trip.date)}
          </div>
        )}

        {/* Price + capacity */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xl font-black text-[#1B3A6B]">
              {formatAmount(trip.price_per_kg, currency)}
            </span>
            <span className="text-sm text-slate-400 font-semibold ml-1">/kg</span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span className="font-semibold text-slate-700">{dispoKg} kg</span> / {totalKg} kg
          </div>
        </div>

        {/* Capacity bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {dispoKg} kg disponibles
          </span>
          <span className="text-xs text-[#1B3A6B] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            Voir <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

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

  const trips        = data ?? []
  const usedStatuses = [...new Set(trips.map(t => t.status.code))]
    .filter((s): s is TripStatus => STATUS_FILTERS.includes(s as TripStatus))
  const filtered     = activeStatus ? trips.filter(t => t.status.code === activeStatus) : trips

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <PageHero
        title="Mes trajets"
        subtitle={
          trips.length > 0
            ? `${trips.length} trajet${trips.length > 1 ? 's' : ''} créé${trips.length > 1 ? 's' : ''}`
            : 'Aucun trajet pour le moment'
        }
        right={
          <Button
            variant="secondary"
            size="sm"
            className="!bg-white/15 !text-white !border-white/25 hover:!bg-white/25"
            onClick={() => navigate('/traveler/trips/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nouveau trajet
          </Button>
        }
      />

      {trips.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="Aucun trajet créé"
          description="Publie ton premier trajet et commence à transporter des bagages en gagnant sur chaque kilo."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/traveler/trips/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Proposer un trajet
            </Button>
          }
        />
      ) : (
        <>
          {/* Filtres statut */}
          {usedStatuses.length > 1 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap" role="group" aria-label="Filtrer par statut">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
              <button
                onClick={() => setActiveStatus(null)}
                aria-pressed={activeStatus === null}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 min-h-[34px] border',
                  activeStatus === null
                    ? 'bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                )}
              >
                Tous ({trips.length})
              </button>
              {usedStatuses.map(status => (
                <button
                  key={status}
                  aria-pressed={activeStatus === status}
                  onClick={() => setActiveStatus(status === activeStatus ? null : status)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 min-h-[34px] border',
                    activeStatus === status
                      ? 'bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                  )}
                >
                  {tripStatusLabel[status] ?? status}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Aucun trajet pour ce statut.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(trip => <TripCard key={trip.id} trip={trip} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}