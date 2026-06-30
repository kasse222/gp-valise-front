import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Plane, Calendar, MapPin, Package,
  ShieldCheck, Clock, ChevronRight, Shield, Star,
} from 'lucide-react'

import { getTrip } from '@/api/trips'
import { formatDate, formatAmount } from '@/lib/utils'
import { Button, Card, Spinner } from '@/components/ui'
import { useAuthStore, isSender } from '@/store/authStore'
import type { Trip } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  document:  { emoji: '📄', label: 'Documents' },
  phone:     { emoji: '📱', label: 'Téléphones' },
  computer:  { emoji: '💻', label: 'Ordinateurs' },
  clothes:   { emoji: '👕', label: 'Vêtements' },
  cosmetics: { emoji: '💄', label: 'Cosmétiques' },
  medicine:  { emoji: '💊', label: 'Médicaments' },
  other:     { emoji: '📦', label: 'Autres' },
}

function KgBar({ available, total }: { available: number; total: number }) {
  const pct   = total > 0 ? Math.round((available / total) * 100) : 0
  const color = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 font-semibold shrink-0">{pct}% dispo</span>
    </div>
  )
}

// ── Traveler card ─────────────────────────────────────────────────────────────

function TravelerCard({ trip }: { trip: Trip }) {
  const user = trip.user
  if (!user) return null

  return (
    <Card>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Votre voyageur</h2>
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black shrink-0"
          style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}
        >
          {user.first_name?.[0]?.toUpperCase() ?? '?'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900 text-base">
                {user.first_name} {user.last_name?.[0]}.
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-slate-400 ml-1 font-medium">Nouveau</span>
              </div>
            </div>
            {user.kyc_verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shrink-0">
                <Shield className="w-3 h-3" />
                Vérifié
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
          </Link>
        </div>
      </div>
    </Card>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-slate-700 font-medium">Trajet introuvable.</p>
        <Button variant="secondary" onClick={() => navigate('/trips')}>
          Voir tous les trajets
        </Button>
      </div>
    )
  }

  const kgDispo       = trip.grams_disponible / 1000
  const kgTotal       = trip.capacity / 1000
  const tripCurrency  = (trip as any).currency ?? 'XOF'
  const isReservable  = trip.is_reservable && kgDispo > 0
  const categoryFees  = (trip as any).category_fees ?? []

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#1B3A6B] transition-colors min-h-[44px] font-medium"
          aria-label="Retour"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <Link to="/" aria-label="Accueil Safe Move">
          <img src="/logo-nav-hori.png" alt="Safe Move" className="h-10" />
        </Link>
        {!isLoggedIn ? (
          <Link to="/login" className="text-sm font-bold text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Se connecter
          </Link>
        ) : (
          <Link to={isSender(user!.role) ? '/sender' : '/traveler'}
            className="text-sm font-bold text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Mon espace
          </Link>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5 pb-32">

        {/* Hero route */}
        <div
          className="rounded-[22px] px-6 py-7 text-white"
          style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1B3A6B 100%)' }}
        >
          <div className="flex items-center gap-3 text-xl font-black mb-2">
            <span>{trip.departure}</span>
            <div className="flex items-center gap-1.5 flex-1">
              <div className="h-px bg-white/25 flex-1 max-w-8" />
              <Plane className="h-4 w-4 text-white/60 shrink-0" />
              <div className="h-px bg-white/25 flex-1 max-w-8" />
            </div>
            <span>{trip.destination}</span>
          </div>

          {trip.date && (
            <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
              <Calendar className="h-4 w-4" />
              {formatDate(trip.date)}
            </div>
          )}

          <div className="flex items-center gap-3 mt-5">
            <span className="text-2xl font-black font-mono">{formatAmount(trip.price_per_kg, tripCurrency)}</span>
            <span className="text-white/60 text-sm">/ kg</span>
            {trip.type_badge && (
              <span className="ml-auto px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 border border-white/20 text-white">
                {trip.type_badge.label}
              </span>
            )}
          </div>
        </div>

        {/* Capacité */}
        <Card>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Capacité</h2>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-slate-500">Disponible</span>
            <span className="font-bold text-slate-900 font-mono">{kgDispo.toFixed(1)} kg / {kgTotal.toFixed(0)} kg</span>
          </div>
          <KgBar available={kgDispo} total={kgTotal} />
          {!isReservable && (
            <p className="text-xs text-red-600 mt-3 font-semibold flex items-center gap-1.5">
              ⚠️ Ce trajet n'est plus disponible à la réservation.
            </p>
          )}
        </Card>

        {/* Voyageur */}
        <TravelerCard trip={trip} />

        {/* Points de rendez-vous */}
        {(trip.pickup_location || trip.delivery_location) && (
          <Card>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Points de rendez-vous</h2>
            <div className="flex flex-col gap-3">
              {trip.pickup_location && (
                <div className="flex items-start gap-3 p-3.5 bg-[#EBF4FF] rounded-[12px] border border-[#1B3A6B]/10">
                  <MapPin className="w-4 h-4 text-[#1B3A6B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#1B3A6B] mb-0.5">📦 Dépôt du colis</p>
                    <p className="text-sm text-slate-700 font-semibold">{trip.pickup_location.city ?? trip.departure}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Adresse exacte révélée après paiement</p>
                  </div>
                </div>
              )}
              {trip.delivery_location && (
                <div className="flex items-start gap-3 p-3.5 bg-[#EBF4FF] rounded-[12px] border border-[#1B3A6B]/10">
                  <MapPin className="w-4 h-4 text-[#1B3A6B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#1B3A6B] mb-0.5">🎯 Remise du colis</p>
                    <p className="text-sm text-slate-700 font-semibold">{trip.delivery_location.city ?? trip.destination}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Adresse exacte révélée après paiement</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Tarifs par catégorie (si présents) */}
        {categoryFees.length > 0 && (
          <Card>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tarifs spéciaux</h2>
            <div className="flex flex-col gap-2">
              {categoryFees.map((cf: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-[10px] border border-slate-100">
                  <span className="text-sm font-medium text-slate-700">
                    {CATEGORY_LABELS[cf.category]?.emoji ?? '📦'} {cf.category_label ?? CATEGORY_LABELS[cf.category]?.label ?? cf.category}
                  </span>
                  <span className="font-bold text-[#1B3A6B] font-mono text-sm">
                    {formatAmount(cf.fee, tripCurrency)}/kg
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Colis acceptés */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-[#1B3A6B]" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Colis acceptés</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, { emoji, label }]) => (
              <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                {emoji} {label}
              </span>
            ))}
          </div>
        </Card>

        {/* Garanties */}
        <Card>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Garanties Safe Move</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: ShieldCheck, text: 'Paiement sécurisé en escrow — libéré après livraison' },
              { icon: Clock,       text: 'Fenêtre de remboursement 48h après livraison' },
              { icon: Package,     text: 'Code de livraison unique — QR + code secret' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <div className="w-7 h-7 rounded-lg bg-[#EBF4FF] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#1B3A6B]" />
                </div>
                <span className="pt-0.5">{text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CTA sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 sm:px-6 py-4 z-40"
        style={{ boxShadow: '0 -4px 20px rgba(15,23,42,0.08)' }}>
        <div className="max-w-2xl mx-auto">
          {canBook && isReservable && (
            <button
              onClick={() => navigate('/trips', { state: { openBooking: trip.id } })}
              className="w-full flex items-center justify-center gap-2 bg-[#1B3A6B] hover:bg-[#2351a0] text-white font-bold py-4 rounded-full transition-all duration-200 text-sm shadow-md"
            >
              Réserver ce trajet
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {canBook && !isReservable && (
            <Button variant="secondary" className="w-full" onClick={() => navigate('/trips')}>
              Voir d'autres trajets
            </Button>
          )}
          {!isLoggedIn && (
            <div className="flex flex-col gap-2">
              <Link to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1B3A6B] hover:bg-[#2351a0] text-white font-bold px-6 py-4 rounded-full transition-all duration-200 text-sm shadow-md">
                Se connecter pour réserver
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/register"
                className="w-full inline-flex items-center justify-center text-sm text-[#1B3A6B] font-bold hover:underline min-h-[36px]">
                Créer un compte gratuitement
              </Link>
            </div>
          )}
          {isLoggedIn && !canBook && (
            <p className="text-center text-sm text-slate-500 py-2">
              Seuls les expéditeurs peuvent réserver un trajet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}