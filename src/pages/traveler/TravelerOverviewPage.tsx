import { Link } from 'react-router-dom'
import { ArrowRight, Home, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { useAuthStore } from '@/store/authStore'
import { Card, Button, Avatar, SkeletonList } from '@/components/ui'
import { useTrips } from '@/hooks/useTrips'
import { useBookings } from '@/hooks/useBookings'
import { approveBooking, declineBooking } from '@/api/bookings'
import { cn, formatDate, tripStatusColor } from '@/lib/utils'
import type { Booking } from '@/types'

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, variant }: {
  label:   string
  value:   string
  variant: 'primary' | 'success' | 'info'
}) {
  const colors = {
    primary: 'text-[#1B3A6B]',
    success: 'text-emerald-600',
    info:    'text-blue-600',
  }
  return (
    <Card>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[variant]}`}>{value}</p>
    </Card>
  )
}

// ─── Pending Request Card ──────────────────────────────────────────────────

function PendingRequestCard({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: () => approveBooking(booking.id),
    onSuccess: () => {
      toast.success('Réservation approuvée.')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? "Erreur lors de l'approbation.")
    },
  })

  const declineMutation = useMutation({
    mutationFn: () => declineBooking(booking.id),
    onSuccess: () => {
      toast.success('Réservation refusée.')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Erreur lors du refus.')
    },
  })

  const isPending   = approveMutation.isPending || declineMutation.isPending
  const departure   = booking.trip?.departure   ?? '—'
  const destination = booking.trip?.destination ?? '—'
  const kg          = (booking.kg_reserved / 1000).toFixed(1)
  const senderName  = booking.user?.full_name ?? booking.user?.email ?? 'Expéditeur'
  const totalAmount = booking.items.reduce((s, i) => s + i.price, 0)

  // content_items agrégés depuis tous les items
  const contentItems = booking.items.flatMap((item) => item.luggage?.content_items ?? [])

  const CATEGORY_EMOJI: Record<string, string> = {
    document:  '📄',
    phone:     '📱',
    computer:  '💻',
    clothes:   '👕',
    cosmetics: '💄',
    medicine:  '💊',
    other:     '📦',
  }

  return (
    <Card className="flex flex-col gap-3">
      {/* Expéditeur */}
      <div className="flex items-center gap-3">
        <Avatar name={senderName} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{senderName}</p>
          <p className="text-xs text-gray-500">{formatDate(booking.created_at)}</p>
        </div>
      </div>

      {/* Trajet */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <span>{departure}</span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden />
        <span>{destination}</span>
      </div>

      {/* Content items */}
      {contentItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {contentItems.map((ci, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
              {CATEGORY_EMOJI[ci.category] ?? '📦'} {ci.description}
            </span>
          ))}
        </div>
      )}

      {/* Poids + montant */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{kg} kg réservé</span>
        <span className="font-bold text-[#1B3A6B] font-mono">
          {(totalAmount / 100).toFixed(2)} €
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="danger" size="sm" className="flex-1"
          loading={declineMutation.isPending} disabled={isPending}
          onClick={() => declineMutation.mutate()}
          leftIcon={<XCircle className="w-4 h-4" />}
        >
          Refuser
        </Button>
        <Button
          variant="primary" size="sm" className="flex-1"
          loading={approveMutation.isPending} disabled={isPending}
          onClick={() => approveMutation.mutate()}
          leftIcon={<CheckCircle className="w-4 h-4" />}
        >
          Accepter
        </Button>
      </div>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TravelerOverviewPage() {
  const user        = useAuthStore((s) => s.user)
  const tripsQuery  = useTrips()
  const bookingsQuery = useBookings()

  if (tripsQuery.isLoading || bookingsQuery.isLoading) {
    return (
      <div className="p-6">
        <SkeletonList count={3} />
      </div>
    )
  }

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

  // Filtrer demandes en attente : bookings pending_approval sur MES trajets
  const myTripIds = new Set(trips.map((t) => t.id))
  const pendingRequests = bookings.filter(
    (b) => b.status === 'pending_approval' && myTripIds.has(b.trip_id),
  )

  // Stats
  const actifs           = trips.filter((t) => t.status.code === 'active').length
  const totalBookings    = bookings.filter((b) => myTripIds.has(b.trip_id)).length
  const capaciteMoyenne  = trips.length > 0
    ? trips.reduce((sum, t) =>
        sum + (t.capacity > 0 ? (t.grams_disponible / t.capacity) * 100 : 0), 0,
      ) / trips.length
    : 0

  const recent = [...trips]
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
          <p className="text-gray-500 mt-1 text-sm">Voici un aperçu de vos trajets.</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors shrink-0 mt-1"
        >
          <Home size={15} aria-hidden />
          <span className="hidden sm:inline">Accueil</span>
        </Link>
      </div>

      {/* ── Demandes en attente — SECTION PRIORITAIRE ──────────────────── */}
      {pendingRequests.length > 0 && (
        <section className="mb-8" aria-label="Demandes en attente">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Demandes en attente
            </h3>
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((booking) => (
              <PendingRequestCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Publier */}
      <Link
        to="/traveler/trips/new"
        className="flex items-center justify-center gap-2 w-full mb-6 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-6 py-3.5 rounded-[14px] text-sm transition-colors duration-200 min-h-[48px]"
      >
        <Plus size={16} aria-hidden />
        Publier un trajet
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Trajets actifs"           value={String(actifs)}                         variant="primary" />
        <StatCard label="Réservations reçues"      value={String(totalBookings)}                  variant="success" />
        <StatCard label="Capacité moy. disponible" value={`${capaciteMoyenne.toFixed(0)} %`}      variant="info"    />
      </div>

      {/* Trajets récents */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Trajets récents</h3>
            <Link to="/traveler/trips" className="text-xs text-[#1B3A6B] hover:underline font-medium">
              Voir tout
            </Link>
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
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                        tripStatusColor[trip.status.code] ?? 'bg-gray-100 text-gray-700',
                      )}>
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