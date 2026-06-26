import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Plane, Calendar, MapPin, Package,
  ShieldCheck, Clock, ChevronRight,
} from 'lucide-react'

import { getTrip } from '@/api/trips'
import { formatDate, formatAmount } from '@/lib/utils'
import { Button, Card, Spinner } from '@/components/ui'
import { useAuthStore, isSender } from '@/store/authStore'
import type { Trip } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  document:  '📄',
  phone:     '📱',
  computer:  '💻',
  clothes:   '👕',
  cosmetics: '💄',
  medicine:  '💊',
  other:     '📦',
}

function KgBar({ available, total }: { available: number; total: number }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0
  const color = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 shrink-0">{pct}% dispo</span>
    </div>
  )
}

// ─── TravelerCard ──────────────────────────────────────────────────────────

function TravelerCard({ trip }: { trip: Trip }) {
  const user = trip.user
  if (!user) return null
  return (
    <Card>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Voyageur</h2>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-lg font-bold shrink-0">
          {user.first_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {user.first_name} {user.last_name?.[0]}.
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {user.kyc_verified && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                🛡️ Identité vérifiée
              </span>
            )}
            {user.trips_count > 0 && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                📦 {user.trips_count} trajet{user.trips_count > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {user.member_since && (
            <p className="text-xs text-gray-400 mt-1">Membre depuis {user.member_since}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TripDetailPublicPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const user       = useAuthStore((s) => s.user)
  const isLoggedIn = user !== null
  const canBook    = isLoggedIn && isSender(user!.role)

  const { data: trip, isLoading, isError } = useQuery<Trip>({
    queryKey:  ['trip-public', id],
    queryFn:   () => getTrip(Number(id)),
    staleTime: 30_000,
    enabled:   !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-700 font-medium">Trajet introuvable.</p>
        <Button variant="secondary" onClick={() => navigate('/trips')}>
          Voir tous les trajets
        </Button>
      </div>
    )
  }

  const kgDispo   = trip.grams_disponible / 1000
  const kgTotal   = trip.capacity / 1000
  const tripCurrency = (trip as any).currency ?? 'XOF'
  const isReservable = trip.is_reservable && kgDispo > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors min-h-[44px]"
          aria-label="Retour"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour
        </button>
        <Link to="/" aria-label="Accueil Safe Move">
          <img src="/logo-nav-hori.png" alt="Safe Move" className="h-14" />
        </Link>
        {!isLoggedIn ? (
          <Link to="/login" className="text-sm font-medium text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Se connecter
          </Link>
        ) : (
          <Link to={isSender(user!.role) ? '/sender' : '/traveler'}
            className="text-sm font-medium text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Mon espace
          </Link>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">

        {/* Hero */}
        <div className="bg-[#1B3A6B] rounded-[20px] px-6 py-8 text-white">
          <div className="flex items-center gap-3 text-xl font-bold mb-2">
            <span>{trip.departure}</span>
            <Plane className="h-5 w-5 text-white/60 shrink-0" aria-hidden />
            <span>{trip.destination}</span>
          </div>
          {trip.date && (
            <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <Calendar className="h-4 w-4" aria-hidden />
              {formatDate(trip.date)}
            </div>
          )}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xl font-bold font-mono">{formatAmount(trip.price_per_kg, tripCurrency)}</span>
            <span className="text-white/70 text-sm">/ kg</span>
            {trip.type_badge && (
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                {trip.type_badge.label}
              </span>
            )}
          </div>
        </div>

        {/* Capacité */}
        <Card>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Capacité</h2>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600">Disponible</span>
            <span className="font-bold text-gray-900 font-mono">{kgDispo.toFixed(1)} kg / {kgTotal.toFixed(0)} kg</span>
          </div>
          <KgBar available={kgDispo} total={kgTotal} />
          {!isReservable && (
            <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Ce trajet n'est plus disponible à la réservation.</p>
          )}
        </Card>

        {/* Voyageur */}
        <TravelerCard trip={trip} />

        {/* Points de dépôt / remise */}
        {(trip.pickup_location || trip.delivery_location) && (
          <Card>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Points de rendez-vous</h2>
            <div className="flex flex-col gap-3">
              {trip.pickup_location && (
                <div className="flex items-start gap-3 p-3 bg-[#EBF4FF] rounded-[10px]">
                  <MapPin className="w-4 h-4 text-[#1B3A6B] shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold text-[#1B3A6B] mb-0.5">📦 Dépôt du colis</p>
                    <p className="text-sm text-gray-700 font-medium">{trip.pickup_location.city ?? trip.departure}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Adresse exacte révélée après paiement</p>
                  </div>
                </div>
              )}
              {trip.delivery_location && (
                <div className="flex items-start gap-3 p-3 bg-[#EBF4FF] rounded-[10px]">
                  <MapPin className="w-4 h-4 text-[#1B3A6B] shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold text-[#1B3A6B] mb-0.5">🎯 Remise du colis</p>
                    <p className="text-sm text-gray-700 font-medium">{trip.delivery_location.city ?? trip.destination}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Adresse exacte révélée après paiement</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Types de colis acceptés */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colis acceptés</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_EMOJI).map(([key, emoji]) => (
              <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {emoji} {key === 'document' ? 'Documents' :
                         key === 'phone'    ? 'Téléphones' :
                         key === 'computer' ? 'Ordinateurs' :
                         key === 'clothes'  ? 'Vêtements' :
                         key === 'cosmetics'? 'Cosmétiques' :
                         key === 'medicine' ? 'Médicaments' : 'Autres'}
              </span>
            ))}
          </div>
        </Card>

        {/* Garanties */}
        <Card>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Garanties Safe Move</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: ShieldCheck, text: 'Paiement sécurisé en escrow — libéré après livraison' },
              { icon: Clock,       text: 'Fenêtre de remboursement 48h après livraison' },
              { icon: Package,     text: 'Code de livraison unique — QR + code secret' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <Icon className="w-4 h-4 text-[#1B3A6B] shrink-0 mt-0.5" aria-hidden />
                {text}
              </div>
            ))}
          </div>
        </Card>

        {/* CTA sticky */}
        <div className="sticky bottom-4 mt-2">
          {canBook && isReservable && (
            <Button
              variant="primary"
              className="w-full shadow-lg"
              onClick={() => navigate('/trips', { state: { openBooking: trip.id } })}
            >
              Réserver ce trajet
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden />
            </Button>
          )}
          {canBook && !isReservable && (
            <Button variant="secondary" className="w-full" onClick={() => navigate('/trips')}>
              Voir d'autres trajets
            </Button>
          )}
          {!isLoggedIn && (
            <div className="flex flex-col gap-2">
              <Link to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-6 py-3.5 rounded-full transition-colors min-h-[52px] shadow-lg text-sm">
                Se connecter pour réserver
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link to="/register"
                className="w-full inline-flex items-center justify-center text-sm text-[#1B3A6B] font-medium hover:underline min-h-[44px]">
                Créer un compte gratuitement
              </Link>
            </div>
          )}
          {isLoggedIn && !canBook && (
            <p className="text-center text-sm text-gray-500">
              Seuls les expéditeurs peuvent réserver un trajet.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}