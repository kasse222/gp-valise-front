import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Shield, MapPin, Calendar, Package, Star } from 'lucide-react'

import { useTravelerProfile } from '@/hooks/useTravelerProfile'
import {  Spinner } from '@/components/ui'
import { formatAmount, formatDate } from '@/lib/utils'

const COUNTRY_FLAG: Record<string, string> = {
  SN: '🇸🇳', FR: '🇫🇷', MA: '🇲🇦', CI: '🇨🇮',
  BJ: '🇧🇯', TG: '🇹🇬', ML: '🇲🇱', GN: '🇬🇳',
  BE: '🇧🇪', DE: '🇩🇪', ES: '🇪🇸', GB: '🇬🇧',
  CA: '🇨🇦', US: '🇺🇸',
}

// ── Trip card ─────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: any }) {
  const currency = trip.currency ?? 'XOF'
  const kgDispo  = (trip.grams_disponible / 1000).toFixed(1)

  return (
    <div
      className="bg-white border border-slate-100 rounded-[18px] overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
    >
      <div
        className="px-5 py-3.5 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg, #0f2544 0%, #1B3A6B 100%)' }}
      >
        <MapPin className="w-3.5 h-3.5 text-white/50 shrink-0" />
        <span className="font-bold text-white text-sm truncate">{trip.departure}</span>
        <ArrowRight className="w-3.5 h-3.5 text-white/50 shrink-0" />
        <span className="font-bold text-white text-sm truncate">{trip.destination}</span>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          {trip.date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(trip.date)}
            </span>
          )}
          <span className="font-semibold text-slate-600">{kgDispo} kg dispo</span>
        </div>

        <p className="text-xl font-black text-[#1B3A6B] font-mono">
          {formatAmount(trip.price_per_kg, currency)}
          <span className="text-sm text-slate-400 font-semibold ml-1">/kg</span>
        </p>

        <Link
          to={`/trips/${trip.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold rounded-full transition-all duration-200 min-h-[48px] mt-1"
        >
          Réserver ce trajet
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GpPublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: profile, isLoading, isError } = useTravelerProfile(Number(id))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 mb-2">Profil introuvable</h1>
        <p className="text-sm text-slate-500 mb-6">Ce voyageur n'existe pas ou n'est plus actif.</p>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold rounded-full transition-all duration-200"
        >
          Voir tous les trajets
        </Link>
      </div>
    )
  }

  const flag     = profile.country ? (COUNTRY_FLAG[profile.country] ?? '🌍') : '🌍'
  const initials = profile.first_name.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div
        className="relative px-4 pt-14 pb-10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #1B3A6B 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))' }}
          >
            <span className="text-2xl font-black text-white">{initials}</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1.5">{profile.first_name}</h1>

          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="text-white/60 text-sm mb-4">
            {flag} {profile.country ?? '—'} · Membre depuis {profile.member_since}
          </p>

          {profile.kyc_verified && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/15 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/25">
              <Shield className="w-3.5 h-3.5" />
              Identité vérifiée
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 -mt-4">
          <div className="bg-white border border-slate-100 rounded-[16px] p-4 text-center"
            style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }}>
            <p className="text-3xl font-black text-[#1B3A6B]">{profile.active_trips_count}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Trajet{profile.active_trips_count > 1 ? 's' : ''} actif{profile.active_trips_count > 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-[16px] p-4 text-center"
            style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }}>
            <p className="text-3xl font-black text-slate-700">{profile.total_trips_count}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Total trajets</p>
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-700 mb-3">Trajets disponibles</h2>

        {profile.active_trips.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[16px] text-center py-10"
            style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Aucun trajet actif pour le moment.</p>
            <p className="text-xs text-slate-400 mt-1">Revenez bientôt ou consultez tous les trajets.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {profile.active_trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 mb-3 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Paiement sécurisé par escrow SafeMove
          </p>
          <Link to="/trips" className="text-xs text-[#1B3A6B] hover:underline font-bold">
            Voir tous les trajets disponibles →
          </Link>
        </div>
      </div>
    </div>
  )
}