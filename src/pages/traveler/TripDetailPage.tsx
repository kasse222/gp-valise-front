import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Package, ChevronRight, CheckCircle, XCircle, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { Button, Card, Spinner, StatusBadge } from '@/components/ui'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useTrip } from '@/hooks/useTrips'
import { useBookings } from '@/hooks/useBookings'
import { approveBooking, declineBooking } from '@/api/bookings'
import { cn, formatAmount, formatDate, tripStatusColor } from '@/lib/utils'
import { updateTrip } from '@/api/trips'

// ─── Capacity Bar ──────────────────────────────────────────────────────────

function CapacityBar({ capacity, gramsDisponible }: { capacity: number; gramsDisponible: number }) {
  const used    = capacity - gramsDisponible
  const pct     = capacity > 0 ? Math.min((used / capacity) * 100, 100) : 0
  const usedKg  = (used / 1000).toFixed(1)
  const totalKg = (capacity / 1000).toFixed(1)
  const dispoKg = (gramsDisponible / 1000).toFixed(1)
  const barColor = pct < 50 ? 'bg-emerald-500' : pct <= 80 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="col-span-2">
      <div className="flex items-baseline justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-900">{usedKg} kg utilisés / {totalKg} kg total</span>
        <span className="text-xs text-gray-500">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-1.5">{dispoKg} kg disponibles</p>
    </div>
  )
}

// ─── Booking Row avec actions approve/decline ──────────────────────────────

function BookingRow({ booking }: { booking: ReturnType<typeof useBookings>['data'] extends (infer T)[] | undefined ? T : never }) {
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: () => approveBooking(booking.id),
    onSuccess: () => {
      toast.success('Réservation approuvée.')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Erreur.')
    },
  })

  const declineMutation = useMutation({
    mutationFn: () => declineBooking(booking.id),
    onSuccess: () => {
      toast.success('Réservation refusée.')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Erreur.')
    },
  })

  const isPending   = booking.status === 'pending_approval'
  const isBusy      = approveMutation.isPending || declineMutation.isPending
  const kgDisplay   = (booking.kg_reserved / 1000).toFixed(1) + ' kg'
  const senderEmail = booking.user?.email ?? '—'

  return (
    <div className="border-b border-gray-100 last:border-0">
      <Link
        to={`/traveler/bookings/${booking.id}`}
        className="flex items-center justify-between py-3 text-sm hover:bg-gray-50 transition-colors -mx-4 px-4 min-h-[56px]"
      >
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{senderEmail}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {kgDisplay} · {formatDate(booking.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <StatusBadge code={booking.status as BookingStatusCode} />
          <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden />
        </div>
      </Link>

      {/* Actions inline si pending_approval */}
      {isPending && (
        <div className="flex gap-2 pb-3 px-0">
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            loading={declineMutation.isPending}
            disabled={isBusy}
            onClick={() => declineMutation.mutate()}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            Refuser
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            loading={approveMutation.isPending}
            disabled={isBusy}
            onClick={() => approveMutation.mutate()}
            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
          >
            Accepter
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Trip Pickup Form ──────────────────────────────────────────────────────

function TripPickupForm({ trip }: { trip: ReturnType<typeof useTrip>['data'] }) {
  const queryClient = useQueryClient()
  const [address,      setAddress]      = useState(trip?.pickup_address      ?? '')
  const [city,         setCity]         = useState(trip?.pickup_city         ?? '')
  const [lat,          setLat]          = useState(String(trip?.pickup_latitude              ?? ''))
  const [lng,          setLng]          = useState(String(trip?.pickup_longitude             ?? ''))
  const [approxLat,    setApproxLat]    = useState(String(trip?.pickup_approx_latitude       ?? ''))
  const [approxLng,    setApproxLng]    = useState(String(trip?.pickup_approx_longitude      ?? ''))
  const [instructions, setInstructions] = useState(trip?.pickup_instructions ?? '')
  const [open,         setOpen]         = useState(!trip?.pickup_address)

  const mutation = useMutation({
    mutationFn: () => updateTrip(trip!.id, {
      pickup_address:               address,
      pickup_city:                  city,
      pickup_latitude:              lat       ? Number(lat)       : undefined,
      pickup_longitude:             lng       ? Number(lng)       : undefined,
      pickup_approx_latitude:       approxLat ? Number(approxLat) : undefined,
      pickup_approx_longitude:      approxLng ? Number(approxLng) : undefined,
      pickup_instructions:          instructions || undefined,
    }),
    onSuccess: () => {
      toast.success('Point de dépôt enregistré.')
      queryClient.invalidateQueries({ queryKey: ['trip', trip!.id] })
      setOpen(false)
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Une erreur est survenue.')
    },
  })

  if (!open && trip?.pickup_address) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <p className="font-medium text-gray-900">{trip.pickup_address}</p>
          <p className="text-gray-500 text-xs mt-0.5">{trip.pickup_city}</p>
          {trip.pickup_instructions && (
            <p className="text-xs text-gray-400 mt-1">ℹ️ {trip.pickup_instructions}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>Modifier</Button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Adresse</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 rue de la Paix" required
            className="w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Ville</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar" required
            className="w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Latitude exacte</label>
          <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="14.6937"
            className="w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B]" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Longitude exacte</label>
          <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-17.4441"
            className="w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B]" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Lat. approx (~500m)</label>
          <input type="number" step="any" value={approxLat} onChange={(e) => setApproxLat(e.target.value)} placeholder="14.69"
            className="w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B]" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Lng. approx (~500m)</label>
          <input type="number" step="any" value={approxLng} onChange={(e) => setApproxLng(e.target.value)} placeholder="-17.44"
            className="w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B]" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Instructions (optionnel)</label>
          <input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Ex : Sonner à l'interphone…"
            className="w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B]" />
        </div>
      </div>
      <div className="flex gap-2">
        {trip?.pickup_address && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
          Enregistrer
        </Button>
      </div>
    </form>
  )
}

export default function TripDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const tripId   = Number(id)

  const { data: trip, isLoading, isError, refetch } = useTrip(tripId)
  const { data: allBookings } = useBookings()

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>

  if (isError || !trip) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement du trajet.</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const bookings = (allBookings ?? []).filter((b) => b.trip_id === tripId)
  const pendingCount = bookings.filter((b) => b.status === 'pending_approval').length
  const tripDate = trip.date ? trip.date.split('-').reverse().join('/') : null

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <Link
        to="/traveler/trips"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Mes trajets
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-1 flex-wrap">
            <span>{trip.departure}</span>
            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" aria-hidden />
            <span>{trip.destination}</span>
          </div>
          {tripDate && <p className="text-sm text-gray-500">{tripDate}</p>}
        </div>
        <span className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0',
          tripStatusColor[trip.status.code] ?? 'bg-gray-100 text-gray-700',
        )}>
          {trip.status.label}
        </span>
      </div>

      {/* Informations */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Informations</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <CapacityBar capacity={trip.capacity} gramsDisponible={trip.grams_disponible} />
          <div>
            <dt className="text-gray-500">Prix au kg</dt>
            <dd className="font-medium text-gray-900 mt-0.5 font-mono">
              {formatAmount(trip.price_per_kg, 'EUR')}
            </dd>
          </div>
          {trip.flight_number && (
            <div>
              <dt className="text-gray-500">Numéro de vol</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{trip.flight_number}</dd>
            </div>
          )}
          {trip.type_badge && (
            <div>
              <dt className="text-gray-500">Type de trajet</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{trip.type_badge.label}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Point de dépôt — modifiable par le traveler */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Point de dépôt colis</h2>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          L'adresse exacte est masquée pour les expéditeurs jusqu'à confirmation du paiement.
        </p>
        <TripPickupForm trip={trip} />
      </Card>

      {/* Réservations reçues */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Réservations reçues
          </h2>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingCount} en attente
              </span>
            )}
            {bookings.length > 0 && (
              <span className="text-xs text-gray-500">{bookings.length} total</span>
            )}
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="w-8 h-8 text-gray-300 mb-2" aria-hidden />
            <p className="text-sm text-gray-400">Aucune réservation pour ce trajet.</p>
          </div>
        ) : (
          <div>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}