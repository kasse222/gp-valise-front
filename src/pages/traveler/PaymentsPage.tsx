import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, AlertCircle,
  ExternalLink, MapPin, CheckCircle, Clock,
  Plane, Calendar, Weight,
} from 'lucide-react'

import { Button, Card, Spinner, StatusBadge, EmptyState} from '@/components/ui'
import { PickupLocationCard } from '@/components/ui/PickupLocationCard'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBooking } from '@/hooks/useBooking'
import { formatAmount, formatDate } from '@/lib/utils'

const CATEGORY_EMOJI: Record<string, string> = {
  document: '📄', phone: '📱', computer: '💻',
  clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
}

// ── Timeline progression ──────────────────────────────────────────────────────

type StepStatus = 'done' | 'active' | 'pending'

function TimelineStep({ icon, label, sub, status, isLast = false }: {
  icon: React.ReactNode; label: string; sub?: string
  status: StepStatus; isLast?: boolean
}) {
  return (
    <div className="flex flex-col items-center flex-1 relative">
      {!isLast && (
        <div className="absolute top-[18px] left-1/2 w-full h-0.5 bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#1B3A6B] transition-all duration-700"
            style={{ width: status === 'done' ? '100%' : '0%' }}
          />
        </div>
      )}
      <div className={`
        relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500
        ${status === 'done'   ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white shadow-[0_0_0_3px_rgba(27,58,107,0.12)]' : ''}
        ${status === 'active' ? 'bg-white border-[#1B3A6B] text-[#1B3A6B] shadow-[0_0_0_3px_rgba(27,58,107,0.12)]' : ''}
        ${status === 'pending' ? 'bg-white border-slate-200 text-slate-300' : ''}
      `}>
        {status === 'done' ? <CheckCircle className="w-4 h-4" /> : icon}
        {status === 'active' && (
          <span className="absolute inset-0 rounded-full animate-ping border-2 border-[#1B3A6B]/20" />
        )}
      </div>
      <p className={`text-[10px] font-bold mt-1.5 text-center leading-tight ${
        status !== 'pending' ? 'text-[#1B3A6B]' : 'text-slate-400'
      }`}>{label}</p>
      {sub && <p className="text-[9px] text-slate-400 text-center mt-0.5">{sub}</p>}
    </div>
  )
}

function getStepStatus(currentStatus: string, targetStatuses: string[]): StepStatus {
  const ORDER = ['en_paiement', 'pending_approval', 'confirmee', 'en_transit', 'livree', 'termine']
  const cur   = ORDER.indexOf(currentStatus)
  const tgt   = Math.max(...targetStatuses.map(s => ORDER.indexOf(s)))
  if (cur > tgt) return 'done'
  if (targetStatuses.includes(currentStatus)) return 'active'
  return 'pending'
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TravelerBookingDetailPage() {
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
  const tripDate    = booking.trip?.date ? booking.trip.date.split('-').reverse().join('/') : null
  const kgDisplay   = (booking.kg_reserved / 1000).toFixed(1) + ' kg'
  const totalAmount = booking.items.reduce((sum, item) => sum + item.price, 0)
  const currency    = (booking.trip as any)?.currency ?? 'XOF'

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Back */}
      <Link
        to={`/traveler/trips/${booking.trip_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1B3A6B] mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Retour au trajet
      </Link>

      {/* Hero route + statut */}
      <div
        className="rounded-[22px] overflow-hidden mb-6"
        style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.10)' }}
      >
        <div
          className="px-6 py-5 flex items-start justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1B3A6B 100%)' }}
        >
          <div className="min-w-0">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">
              Réservation #{booking.id}
            </p>
            <div className="flex items-center gap-2 text-white font-black text-lg mb-2">
              <span>{booking.trip?.departure ?? '—'}</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-px bg-white/25" />
                <Plane className="w-4 h-4 text-white/60" />
                <div className="w-6 h-px bg-white/25" />
              </div>
              <span>{booking.trip?.destination ?? '—'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-white/55 text-sm">
              {tripDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {tripDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5" /> {kgDisplay}
              </span>
              <span className="font-black text-white font-mono">
                {formatAmount(totalAmount, currency)}
              </span>
            </div>
          </div>
          <StatusBadge code={status} />
        </div>

        {/* Timeline */}
        <div className="bg-white px-6 py-5 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Progression
          </p>
          <div className="flex items-start gap-0">
            <TimelineStep
              icon={<Package className="w-4 h-4" />}
              label="Créée"
              sub={formatDate(booking.created_at)}
              status={getStepStatus(status, ['en_paiement', 'pending_approval', 'confirmee', 'en_transit', 'livree', 'termine'])}
            />
            <TimelineStep
              icon={<Clock className="w-4 h-4" />}
              label="Paiement"
              status={getStepStatus(status, ['confirmee', 'en_transit', 'livree', 'termine'])}
            />
            <TimelineStep
              icon={<Package className="w-4 h-4" />}
              label="Dépôt"
              status={getStepStatus(status, ['en_transit', 'livree', 'termine'])}
            />
            <TimelineStep
              icon={<Plane className="w-4 h-4" />}
              label="Transit"
              status={getStepStatus(status, ['livree', 'termine'])}
            />
            <TimelineStep
              icon={<CheckCircle className="w-4 h-4" />}
              label="Livré"
              status={getStepStatus(status, ['termine'])}
              isLast
            />
          </div>
        </div>
      </div>

      {/* Expired banner */}
      {isExpired && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex items-start gap-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          Cette réservation n'a pas été payée à temps. Aucune action n'est requise de votre côté.
        </div>
      )}

      {/* Expéditeur */}
      <Card className="mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Expéditeur</h2>
        {booking.user?.email ? (
          <p className="text-sm font-medium text-slate-900">{booking.user.email}</p>
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

      {/* Pickup location */}
      <PickupLocationCard
        bookingId={bookingId}
        isTraveler={true}
        bookingStatus={status}
      />

      {/* Gains */}
      <Card className="mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Gains {isExpired ? 'potentiels' : 'à percevoir'}
        </h2>
        <p className="text-xs text-slate-400 mb-2">
          {isExpired
            ? 'Montant qui aurait été gagné si confirmée'
            : 'Libéré après livraison confirmée'}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-2xl font-black text-[#1B3A6B] font-mono">
            {formatAmount(totalAmount, currency)}
          </p>
          {!isExpired && (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
              Escrow sécurisé ✓
            </span>
          )}
        </div>
      </Card>

      {/* Contenu du colis */}
      <Card className="mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Contenu du colis
        </h2>
        {booking.items.length === 0 ? (
          <EmptyState icon={Package} title="Aucun article" description="Aucun article déclaré." />
        ) : (
          <div className="flex flex-col gap-4">
            {booking.items.map(item => {
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
                    <Link
                      to={`/track/${item.luggage.tracking_id}`}
                      className="self-start inline-flex items-center gap-2 px-3 py-2 bg-[#EBF4FF] hover:bg-[#1B3A6B] hover:text-white text-[#1B3A6B] text-xs font-bold rounded-[8px] transition-colors"
                    >
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

      {/* Historique */}
      <Card>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Historique des statuts
        </h2>
        {booking.status_history.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Aucun changement de statut enregistré.</p>
        ) : (
          <ol className="space-y-0">
            {booking.status_history.map((entry, i) => (
              <li key={entry.id} className="flex gap-3 pb-4 last:pb-0 relative">
                {i < booking.status_history.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-100" aria-hidden />
                )}
                <div className={`mt-1 w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10 ${
                  i === 0 ? 'bg-[#1B3A6B] border-[#1B3A6B]' : 'bg-white border-slate-300'
                }`} />
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