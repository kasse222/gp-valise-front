import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Package, Plane, ChevronDown } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { Card, Button, SkeletonList, StatusBadge } from '@/components/ui'
import { useTrips } from '@/hooks/useTrips'
import { useBookings } from '@/hooks/useBookings'
import { cn, tripStatusColor, formatDate } from '@/lib/utils'
import { PageHero } from '@/components/ui/PageHero'
import { EarningsBlock } from '@/components/traveler/EarningsBlock'
import { ShareProfileBlock } from '@/components/traveler/ShareProfileBlock'
import type { BookingStatusCode } from '@/components/ui/Badge'
import type { Booking } from '@/types'

// ─── Carte booking style booking.com ──────────────────────────────────────────

function TransitBookingCard({ booking }: { booking: Booking }) {
  const departure   = booking.trip?.departure   ?? '—'
  const destination = booking.trip?.destination ?? '—'
  const kg          = booking.kg_reserved ? (booking.kg_reserved / 1000).toFixed(1) + ' kg' : null
  const tripDate    = booking.trip?.date ? formatDate(booking.trip.date) : null
  const sender      = booking.user?.first_name
    ? `${booking.user.first_name} ${booking.user.last_name?.[0] ?? ''}.`
    : booking.user?.email ?? 'Expéditeur'

  return (
    <Link to={`/traveler/bookings/${booking.id}`} className="block group">
      <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#1B3A6B]/30 transition-all">

        {/* Header corridor — bleu comme booking.com */}
        <div className="bg-[#1B3A6B] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm min-w-0">
            <span className="truncate">{departure}</span>
            <Plane className="w-3.5 h-3.5 text-white/60 shrink-0" aria-hidden />
            <span className="truncate">{destination}</span>
          </div>
          <StatusBadge code={booking.status as BookingStatusCode} />
        </div>

        {/* Corps */}
        <div className="px-4 py-3 flex flex-col gap-2.5">

          {/* Expéditeur */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#EBF4FF] flex items-center justify-center text-[#1B3A6B] text-xs font-bold shrink-0">
              {sender[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-sm text-gray-700 font-medium truncate">{sender}</span>
          </div>

          {/* Infos clés */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {kg && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" aria-hidden />
                {kg}
              </span>
            )}
            {tripDate && (
              <span>📅 {tripDate}</span>
            )}
            {booking.items?.[0]?.luggage?.content_items?.length ? (
              <span>
                {booking.items[0].luggage!.content_items.map((ci) => {
                  const EMOJI: Record<string, string> = {
                    document: '📄', phone: '📱', computer: '💻',
                    clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
                  }
                  return EMOJI[ci.category] ?? '📦'
                }).join(' ')}
              </span>
            ) : null}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-xs text-indigo-600 font-semibold">📦 Scanner à la livraison</span>
            <span className="text-xs text-[#1B3A6B] font-semibold group-hover:underline">
              Voir →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, variant }: {
  label: string; value: string; variant: 'primary' | 'success' | 'info'
}) {
  const colors = { primary: 'text-[#1B3A6B]', success: 'text-emerald-600', info: 'text-blue-600' }
  return (
    <Card>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[variant]}`}>{value}</p>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 4

export default function TravelerOverviewPage() {
  const user          = useAuthStore((s) => s.user)
  const tripsQuery    = useTrips()
  const bookingsQuery = useBookings()
  const [showAll, setShowAll] = useState(false)

  if (tripsQuery.isLoading || bookingsQuery.isLoading) return <div className="p-6"><SkeletonList count={3} /></div>
  if (tripsQuery.isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => tripsQuery.refetch()}>Réessayer</Button>
      </div>
    )
  }

  const trips     = tripsQuery.data ?? []
  const bookings  = bookingsQuery.data ?? []
  const myTripIds = new Set(trips.map((t) => t.id))

  const inTransit  = bookings.filter((b) => b.status === 'en_transit' && myTripIds.has(b.trip_id))
  const displayed  = showAll ? inTransit : inTransit.slice(0, PREVIEW_COUNT)
  const remaining  = inTransit.length - PREVIEW_COUNT

  const actifs          = trips.filter((t) => t.status.code === 'active').length
  const totalBookings   = bookings.filter((b) => myTripIds.has(b.trip_id)).length
  const capaciteMoyenne = trips.length > 0
    ? trips.reduce((sum, t) => sum + (t.capacity > 0 ? (t.grams_disponible / t.capacity) * 100 : 0), 0) / trips.length
    : 0

  const recent = [...trips]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="p-4 sm:p-6 md:p-8">

      <PageHero
        title={`Bonjour, ${user?.first_name} 👋`}
        subtitle="Voici un aperçu de vos trajets."
        right={
          <Link to="/traveler/trips/new"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition-colors min-h-[40px]">
            <Plus size={15} aria-hidden />
            Publier
          </Link>
        }
      />

      {/* Colis en transit */}
      {inTransit.length > 0 && (
        <section className="mb-8" aria-label="Colis en transit">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-indigo-600" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Colis en transit</h3>
            <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {inTransit.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {displayed.map((booking) => (
              <TransitBookingCard key={booking.id} booking={booking} />
            ))}
          </div>

          {/* Bouton voir plus / voir moins */}
          {inTransit.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#1B3A6B] bg-[#EBF4FF] hover:bg-[#1B3A6B] hover:text-white rounded-[10px] transition-colors"
            >
              <ChevronDown className={cn('w-4 h-4 transition-transform', showAll && 'rotate-180')} aria-hidden />
              {showAll ? 'Voir moins' : `Voir les ${remaining} autres colis`}
            </button>
          )}
        </section>
      )}

      <EarningsBlock />
      <ShareProfileBlock />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Trajets actifs"           value={String(actifs)}                     variant="primary" />
        <StatCard label="Réservations reçues"      value={String(totalBookings)}             variant="success" />
        <StatCard label="Capacité moy. disponible" value={`${capaciteMoyenne.toFixed(0)} %`} variant="info"    />
      </div>

      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Trajets récents</h3>
            <Link to="/traveler/trips" className="text-xs text-[#1B3A6B] hover:underline font-medium">Voir tout</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recent.map((trip) => (
              <Link key={trip.id} to={`/traveler/trips/${trip.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-gray-900 text-sm truncate">{trip.departure}</span>
                      <ArrowRight size={14} className="shrink-0 text-gray-400" aria-hidden />
                      <span className="font-medium text-gray-900 text-sm truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', tripStatusColor[trip.status.code] ?? 'bg-gray-100 text-gray-700')}>
                        {trip.status.label}
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {(trip.grams_disponible / 1000).toFixed(1)} kg dispo
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}