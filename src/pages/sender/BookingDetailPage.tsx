import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Package, AlertCircle, ExternalLink, MapPin } from 'lucide-react'

import { Button, Card, Spinner, StatusBadge, EmptyState } from '@/components/ui'
import { PickupLocationCard } from '@/components/ui/PickupLocationCard'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBooking } from '@/hooks/useBooking'
import { formatAmount, formatDate } from '@/lib/utils'

export default function TravelerBookingDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const bookingId   = Number(id)

  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>

  if (isError || !booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement de la réservation.</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const tripDate    = booking.trip?.date ? booking.trip.date.split('-').reverse().join('/') : null
  const kgDisplay   = (booking.kg_reserved / 1000).toFixed(1) + ' kg'
  const totalAmount = booking.items.reduce((sum, item) => sum + item.price, 0)
  const status      = booking.status as BookingStatusCode
  const isExpired   = status === 'expiree'

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Back */}
      <Link
        to={`/traveler/trips/${booking.trip_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Retour au trajet
      </Link>

      {/* Hero */}
      <div className="bg-[#1B3A6B] rounded-[20px] px-6 py-6 mb-6 text-white flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Réservation #{booking.id}</h1>
          <p className="text-white/70 text-sm mt-1">{formatDate(booking.created_at)}</p>
        </div>
        <StatusBadge code={status} />
      </div>

      {/* Banner expirée */}
      {isExpired && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex items-start gap-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
          <span>Cette réservation n'a pas été payée à temps. Aucune action n'est requise de votre côté.</span>
        </div>
      )}

      {/* Expéditeur */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Expéditeur</h2>
        {booking.user?.email ? (
          <p className="text-sm text-gray-900">{booking.user.email}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Informations non disponibles (réservation expirée ou annulée)
          </p>
        )}
        <div className="mt-3">
          <Link
            to={`/traveler/trips/${booking.trip_id}`}
            className="inline-flex items-center gap-1 text-xs text-[#1B3A6B] hover:underline"
          >
            Voir le détail du trajet <ExternalLink className="w-3 h-3" aria-hidden />
          </Link>
        </div>
      </Card>

      {/* Trajet */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trajet</h2>
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <span>{booking.trip?.departure ?? '—'}</span>
          <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden />
          <span>{booking.trip?.destination ?? '—'}</span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {tripDate && (
            <div>
              <dt className="text-gray-500">Date du trajet</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{tripDate}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Poids réservé</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{kgDisplay}</dd>
          </div>
          {booking.comment && (
            <div className="col-span-2">
              <dt className="text-gray-500">Commentaire</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{booking.comment}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* ── Pickup Location — TRAVELER peut définir si confirmée ────────── */}
      <PickupLocationCard
        bookingId={bookingId}
        isTraveler={true}
        bookingStatus={status}
      />

      {/* Gains potentiels */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Gains potentiels</h2>
        <p className="text-sm text-gray-500 mb-1">
          {isExpired
            ? 'Montant qui aurait été gagné si la réservation avait été confirmée :'
            : 'Montant à percevoir après livraison confirmée :'}
        </p>
        <p className="text-xl font-bold text-[#1B3A6B] font-mono">
          {formatAmount(totalAmount, 'EUR')}
        </p>
      </Card>

      {/* Items */}
{/* Contenu du colis */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contenu du colis</h2>
        {booking.items.length === 0 ? (
          <EmptyState icon={Package} title="Aucun article" description="Cette réservation ne contient aucun article déclaré." />
        ) : (
          <div className="flex flex-col gap-4">
            {booking.items.map((item) => {
              const contentItems = item.luggage?.content_items ?? []
              const photoPath    = item.luggage?.photo_path ?? null

              const CATEGORY_EMOJI: Record<string, string> = {
                document: '📄', phone: '📱', computer: '💻',
                clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
              }

              return (
                <div key={item.id} className="flex flex-col gap-3 p-3 bg-gray-50 rounded-[12px]">
                  {/* Photo colis */}
                  {photoPath && (
                    <img
                      src={photoPath}
                      alt="Photo du colis"
                      className="w-full max-h-48 object-cover rounded-[10px] border border-gray-200"
                    />
                  )}

                  {/* Header item */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.luggage?.description ?? `Colis #${item.id}`}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                        {item.luggage?.tracking_id?.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ⚖️ {(item.kg_reserved / 1000).toFixed(1)} kg
                      </p>
                    </div>
                    <span className="font-bold text-gray-900 font-mono shrink-0">{formatAmount(item.price, 'EUR')}</span>
                  </div>

                  {/* Content items */}
                  {contentItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {contentItems.map((ci, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium">
                          {CATEGORY_EMOJI[ci.category] ?? '📦'} {ci.description}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Lien suivi colis */}
                  {item.luggage?.tracking_id && (
                    <Link to={`/track/${item.luggage.tracking_id}`}
                      className="inline-flex items-center gap-2 self-start px-3 py-2 bg-[#EBF4FF] hover:bg-[#1B3A6B] hover:text-white text-[#1B3A6B] text-xs font-semibold rounded-[8px] transition-colors">
                      <MapPin className="w-3.5 h-3.5" aria-hidden />
                      Suivre ce colis
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Historique */}
      <Card>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historique des statuts</h2>
        {booking.status_history.length === 0 ? (
          <EmptyState icon={Package} title="Aucun historique" description="Aucun changement de statut enregistré." />
        ) : (
          <ol className="space-y-3">
            {booking.status_history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#1B3A6B] flex-shrink-0" aria-hidden />
                <div>
                  <p className="text-gray-900">
                    {entry.old_label && <span className="text-gray-500">{entry.old_label} → </span>}
                    <span className="font-medium">{entry.new_label}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.changed_at)}</p>
                  {entry.reason && <p className="text-xs text-gray-500 mt-0.5">{entry.reason}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}