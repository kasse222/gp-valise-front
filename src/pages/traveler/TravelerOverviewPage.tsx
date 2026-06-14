import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Package } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { Card, Button, SkeletonList } from '@/components/ui'
import { useTrips } from '@/hooks/useTrips'
import { useBookings } from '@/hooks/useBookings'
import { cn, tripStatusColor } from '@/lib/utils'
import { PageHero } from '@/components/ui/PageHero'

function StatCard({ label, value, variant }: {
  label:   string; value: string; variant: 'primary' | 'success' | 'info'
}) {
  const colors = { primary: 'text-[#1B3A6B]', success: 'text-emerald-600', info: 'text-blue-600' }
  return (
    <Card>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[variant]}`}>{value}</p>
    </Card>
  )
}

export default function TravelerOverviewPage() {
  const user          = useAuthStore((s) => s.user)
  const tripsQuery    = useTrips()
  const bookingsQuery = useBookings()

  if (tripsQuery.isLoading || bookingsQuery.isLoading) return <div className="p-6"><SkeletonList count={3} /></div>
  if (tripsQuery.isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => tripsQuery.refetch()}>Réessayer</Button>
      </div>
    )
  }

  const trips    = tripsQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const myTripIds = new Set(trips.map((t) => t.id))

  const inTransit = bookings.filter((b) => b.status === 'en_transit' && myTripIds.has(b.trip_id))

  const actifs          = trips.filter((t) => t.status.code === 'active').length
  const totalBookings   = bookings.filter((b) => myTripIds.has(b.trip_id)).length
  const capaciteMoyenne = trips.length > 0
    ? trips.reduce((sum, t) => sum + (t.capacity > 0 ? (t.grams_disponible / t.capacity) * 100 : 0), 0) / trips.length
    : 0

  const recent = [...trips].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)

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

      {inTransit.length > 0 && (
        <section className="mb-8" aria-label="Colis en transit">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-indigo-600" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Colis en transit</h3>
            <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{inTransit.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inTransit.map((booking) => (
              <Link key={booking.id} to={`/traveler/bookings/${booking.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <span>{booking.trip?.departure ?? '—'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden />
                    <span>{booking.trip?.destination ?? '—'}</span>
                  </div>
                  <p className="text-xs text-gray-500">{booking.user?.full_name ?? booking.user?.email ?? 'Expéditeur'}</p>
                  <span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                    📦 Scanner à la livraison
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Trajets actifs"           value={String(actifs)}                    variant="primary" />
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
                      <span className="text-xs text-gray-400 hidden sm:inline">{(trip.grams_disponible / 1000).toFixed(1)} kg dispo</span>
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