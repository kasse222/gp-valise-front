/**
 * Sender BookingDetailPage v2
 * Inspiré des maquettes : route hero, voyageur card, timeline progression,
 * section paiement avec countdown, articles avec emojis
 */

import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Plane, Package, MapPin,
  AlertCircle, ExternalLink, Star, Shield, Clock,
  CheckCircle, Calendar, Weight,
} from 'lucide-react'

import { Button, Card, Spinner, CountdownTimer } from '@/components/ui'
import { PickupLocationCard } from '@/components/ui/PickupLocationCard'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBooking } from '@/hooks/useBooking'
import { formatAmount, formatDate } from '@/lib/utils'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  en_paiement:      { label: 'Paiement en attente', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  confirmee:        { label: 'Confirmée',            color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  en_transit:       { label: 'En transit ✈️',         color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  livree:           { label: 'Livrée',               color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200' },
  termine:          { label: 'Terminée',             color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  annule:           { label: 'Annulée',              color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200' },
  expiree:          { label: 'Expirée',              color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200' },
  en_litige:        { label: 'En litige',            color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  remboursee:       { label: 'Remboursée',           color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200' },
  paiement_echoue:  { label: 'Paiement échoué',      color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  pending_approval: { label: "En attente d'approbation", color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
}

// ── Category emoji ────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  document: '📄', phone: '📱', computer: '💻',
  clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
}

// ── Timeline step ─────────────────────────────────────────────────────────────

type TimelineStatus = 'done' | 'active' | 'pending'

function TimelineStep({ icon, label, sub, status, isLast = false }: {
  icon:    React.ReactNode
  label:   string
  sub?:    string
  status:  TimelineStatus
  isLast?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 relative">
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute top-[18px] left-1/2 w-full h-0.5 transition-all duration-700"
          style={{
            background: status === 'done'
              ? 'linear-gradient(90deg, #1B3A6B, #3b82f6)'
              : '#e2e8f0',
          }}
          aria-hidden
        />
      )}

      {/* Icon circle */}
      <div
        className={`
          relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500
          ${status === 'done'   ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white shadow-[0_0_0_4px_rgba(27,58,107,0.15)]' : ''}
          ${status === 'active' ? 'bg-white border-[#1B3A6B] text-[#1B3A6B] shadow-[0_0_0_4px_rgba(27,58,107,0.15)]' : ''}
          ${status === 'pending' ? 'bg-white border-slate-200 text-slate-300' : ''}
        `}
      >
        {status === 'done'
          ? <CheckCircle className="w-4 h-4" aria-hidden />
          : <span className={status === 'active' ? 'animate-pulse' : ''}>{icon}</span>}
        {status === 'active' && (
          <span className="absolute inset-0 rounded-full animate-ping border-2 border-[#1B3A6B]/30" aria-hidden />
        )}
      </div>

      {/* Label */}
      <p className={`text-[10px] font-bold text-center mt-1 leading-tight transition-colors ${
        status !== 'pending' ? 'text-[#1B3A6B]' : 'text-slate-400'
      }`}>{label}</p>
      {sub && <p className="text-[9px] text-slate-400 text-center">{sub}</p>}
    </div>
  )
}

function getTimelineStatus(bookingStatus: string, stepStatuses: string[]): TimelineStatus {
  const order = ['en_paiement', 'confirmee', 'en_transit', 'livree', 'termine']
  const currentIdx = order.indexOf(bookingStatus)
  const stepIdx    = order.findIndex(s => stepStatuses.includes(s))
  if (currentIdx > stepIdx) return 'done'
  if (currentIdx === stepIdx) return 'active'
  return 'pending'
}

// ── Route hero ────────────────────────────────────────────────────────────────

function RouteHero({ booking }: { booking: any }) {
  const status     = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.en_paiement
  const departure  = booking.trip?.departure ?? '—'
  const dest       = booking.trip?.destination ?? '—'
  const tripDate   = booking.trip?.date ? formatDate(booking.trip.date) : null
  const kgDisplay  = (booking.kg_reserved / 1000).toFixed(1) + ' kg'
  const totalAmt   = booking.items.reduce((s: number, i: any) => s + i.price, 0)
  const currency   = (booking.trip as any)?.currency ?? 'XOF'

  return (
    <div
      className="rounded-[24px] overflow-hidden mb-6"
      style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.10)' }}
    >
      {/* Top — dark gradient */}
      <div
        className="px-6 py-5 flex items-start justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1B3A6B 100%)' }}
      >
        <div className="min-w-0">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
            Réservation #{booking.id}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xl font-black text-white">
              <span>{departure}</span>
              <div className="flex items-center gap-1">
                <div className="w-8 h-px bg-white/30" aria-hidden />
                <Plane className="w-4 h-4 text-white/70" aria-hidden />
                <div className="w-8 h-px bg-white/30" aria-hidden />
              </div>
              <span>{dest}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/60">
            {tripDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden />
                {tripDate}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5" aria-hidden />
              {kgDisplay}
            </span>
            <span className="font-black text-white text-lg">
              {formatAmount(totalAmt, currency)}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${status.color} ${status.bg} ${status.border}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Bottom — white timeline */}
      <div className="bg-white px-6 py-5 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Suivi de votre réservation</p>
        <div className="flex items-start gap-0">
          <TimelineStep
            icon={<Package className="w-4 h-4" />}
            label="Réservée"
            sub={formatDate(booking.created_at)}
            status={getTimelineStatus(booking.status, ['en_paiement', 'pending_approval', 'confirmee', 'en_transit', 'livree', 'termine'])}
          />
          <TimelineStep
            icon={<Clock className="w-4 h-4" />}
            label="Paiement"
            sub={booking.status === 'en_paiement' ? 'En attente' : undefined}
            status={getTimelineStatus(booking.status, ['confirmee', 'en_transit', 'livree', 'termine'])}
          />
          <TimelineStep
            icon={<Package className="w-4 h-4" />}
            label="Dépôt"
            sub="À venir"
            status={getTimelineStatus(booking.status, ['en_transit', 'livree', 'termine'])}
          />
          <TimelineStep
            icon={<Plane className="w-4 h-4" />}
            label="En transport"
            sub="À venir"
            status={getTimelineStatus(booking.status, ['livree', 'termine'])}
          />
          <TimelineStep
            icon={<CheckCircle className="w-4 h-4" />}
            label="Livré"
            sub="À venir"
            status={getTimelineStatus(booking.status, ['termine'])}
            isLast
          />
        </div>
      </div>
    </div>
  )
}

// ── Traveler card ─────────────────────────────────────────────────────────────

function TravelerCard({ trip }: { trip: any }) {
  const user = trip?.user
  if (!user) return null

  return (
    <Card className="mb-4">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Votre voyageur</h2>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black shrink-0"
          style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}
        >
          {user.first_name?.[0]?.toUpperCase() ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900 text-base">
                {user.first_name} {user.last_name?.[0]}.
              </p>
              {/* Star rating placeholder */}
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
                <span className="text-xs text-slate-400 ml-1 font-medium">4.9</span>
              </div>
            </div>
            {user.kyc_verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shrink-0">
                <Shield className="w-3 h-3" />
                KYC vérifié
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {user.trips_count > 0 && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                {user.trips_count} trajet{user.trips_count > 1 ? 's' : ''} réalisé{user.trips_count > 1 ? 's' : ''}
              </span>
            )}
            {user.member_since && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                Membre {user.member_since}
              </span>
            )}
          </div>

          <Link
            to={`/gp/${user.id}`}
            className="inline-flex items-center gap-1 text-xs text-[#1B3A6B] font-bold hover:underline mt-2"
          >
            Voir son profil
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SenderBookingDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const bookingId = Number(id)
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

  const status      = booking.status as BookingStatusCode
  const isExpired   = status === 'expiree'
  const isPending   = status === 'en_paiement'
  const currency    = (booking.trip as any)?.currency ?? 'XOF'
  const totalAmount = booking.items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Back */}
      <Link
        to="/sender/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1B3A6B] mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
        Retour aux réservations
      </Link>

      {/* Route hero + timeline */}
      <RouteHero booking={booking} />

      {/* Expired banner */}
      {isExpired && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex items-start gap-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
          Cette réservation n'a pas été payée à temps. Aucune action n'est requise de votre côté.
        </div>
      )}

      {/* Payment countdown for pending */}
      {isPending && booking.payment_expires_at && (
        <div className="mb-4 p-5 bg-white border border-amber-200 rounded-[18px] flex flex-col gap-3"
          style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Paiement sécurisé
              </p>
              <p className="text-sm text-slate-500 mt-0.5">Montant total</p>
            </div>
            <p className="font-black text-[#1B3A6B] text-2xl">{formatAmount(totalAmount, currency)}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Temps restant pour payer</p>
            <CountdownTimer expiresAt={booking.payment_expires_at} />
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              style={{ width: '60%' }} aria-hidden />
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#1B3A6B] hover:bg-[#2351a0] text-white font-bold py-3 rounded-full text-sm transition-all duration-200">
              📱 Mobile Money
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#EBF4FF] font-bold py-3 rounded-full text-sm transition-all duration-200">
              💳 Carte bancaire
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" />Paiement 100% sécurisé</span>
          </div>
        </div>
      )}

      {/* Traveler */}
      <TravelerCard trip={booking.trip} />

      {/* Pickup location */}
      <PickupLocationCard
        bookingId={bookingId}
        isTraveler={false}
        bookingStatus={status}
      />

      {/* Articles */}
      <Card className="mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Vos articles ({booking.items.length})
        </h2>

        {booking.items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Package className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Aucun article déclaré.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {booking.items.map((item) => {
              const contentItems = item.luggage?.content_items ?? []
              const photoPath    = item.luggage?.photo_path ?? null

              return (
                <div key={item.id} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-[14px] border border-slate-100">
                  {photoPath && (
                    <img src={photoPath} alt="Photo du colis"
                      className="w-full max-h-40 object-cover rounded-[10px] border border-slate-200" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm">
                        {item.luggage?.description ?? `Colis #${item.id}`}
                      </p>
                      {item.luggage?.tracking_id && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          #{item.luggage.tracking_id.slice(0, 8)}…
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        ⚖️ {(item.kg_reserved / 1000).toFixed(1)} kg
                      </p>
                    </div>
                    <span className="font-black text-[#1B3A6B] font-mono shrink-0">
                      {formatAmount(item.price, currency)}
                    </span>
                  </div>

                  {contentItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {contentItems.map((ci, idx) => (
                        <span key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-medium">
                          {CATEGORY_EMOJI[ci.category] ?? '📦'} {ci.description}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.luggage?.tracking_id && (
                    <Link to={`/track/${item.luggage.tracking_id}`}
                      className="self-start inline-flex items-center gap-2 px-3 py-2 bg-[#EBF4FF] hover:bg-[#1B3A6B] hover:text-white text-[#1B3A6B] text-xs font-bold rounded-[8px] transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                      Suivre ce colis
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Expéditeur info */}
      <Card className="mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Expéditeur</h2>
        {booking.user?.email ? (
          <p className="text-sm text-slate-900 font-medium">{booking.user.email}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">Information non disponible</p>
        )}
        <Link
          to={`/traveler/trips/${booking.trip_id}`}
          className="inline-flex items-center gap-1 text-xs text-[#1B3A6B] font-bold hover:underline mt-2"
        >
          Voir le détail du trajet <ExternalLink className="w-3 h-3" />
        </Link>
      </Card>

      {/* Historique */}
      <Card>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Historique des statuts
        </h2>
        {booking.status_history.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Aucun historique.</p>
        ) : (
          <ol className="space-y-0">
            {booking.status_history.map((entry, i) => (
              <li key={entry.id} className="flex gap-3 pb-4 last:pb-0 relative">
                {i < booking.status_history.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-100" aria-hidden />
                )}
                <div className={`mt-1 w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10 ${
                  i === 0 ? 'bg-[#1B3A6B] border-[#1B3A6B]' : 'bg-white border-slate-300'
                }`} aria-hidden />
                <div>
                  <p className={`text-sm ${i === 0 ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                    {entry.old_label && (
                      <span className="text-slate-400">{entry.old_label} → </span>
                    )}
                    <span className="font-semibold">{entry.new_label}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(entry.changed_at)}</p>
                  {entry.reason && (
                    <p className="text-xs text-slate-500 mt-0.5 italic">{entry.reason}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}