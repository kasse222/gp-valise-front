import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Shield, MapPin, Calendar, Package } from 'lucide-react'

import { useTravelerProfile } from '@/hooks/useTravelerProfile'
import { Card, Spinner } from '@/components/ui'
import { formatAmount, formatDate } from '@/lib/utils'

const COUNTRY_FLAG: Record<string, string> = {
  SN: '🇸🇳', FR: '🇫🇷', MA: '🇲🇦', CI: '🇨🇮',
  BJ: '🇧🇯', TG: '🇹🇬', ML: '🇲🇱', GN: '🇬🇳',
  BE: '🇧🇪', DE: '🇩🇪', ES: '🇪🇸', GB: '🇬🇧',
  CA: '🇨🇦', US: '🇺🇸',
}

export default function GpPublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: profile, isLoading, isError } = useTravelerProfile(Number(id))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Profil introuvable</h1>
        <p className="text-sm text-gray-500 mb-6">Ce voyageur n'existe pas ou n'est plus actif.</p>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 px-4 py-3 bg-[#1B3A6B] text-white text-sm font-semibold rounded-[10px] hover:bg-[#152d54] transition-colors"
        >
          Voir tous les trajets
        </Link>
      </div>
    )
  }

  const flag     = profile.country ? (COUNTRY_FLAG[profile.country] ?? '🌍') : '🌍'
  const initials = profile.first_name.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B3A6B] px-4 pt-12 pb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{profile.first_name}</h1>
          <p className="text-white/70 text-sm mb-4">
            {flag} {profile.country ?? '—'} · Membre depuis {profile.member_since}
          </p>
          {profile.kyc_verified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" aria-hidden />
              Identité vérifiée
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-3xl font-bold text-[#1B3A6B]">{profile.active_trips_count}</p>
            <p className="text-xs text-gray-500 mt-1">Trajet{profile.active_trips_count > 1 ? 's' : ''} actif{profile.active_trips_count > 1 ? 's' : ''}</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-gray-700">{profile.total_trips_count}</p>
            <p className="text-xs text-gray-500 mt-1">Total trajets</p>
          </Card>
        </div>

        <h2 className="text-base font-semibold text-gray-900 mb-3">Trajets disponibles</h2>

        {profile.active_trips.length === 0 ? (
          <Card className="text-center py-8">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden />
            <p className="text-sm text-gray-500">Aucun trajet actif pour le moment.</p>
            <p className="text-xs text-gray-400 mt-1">Revenez bientôt ou consultez tous les trajets.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {profile.active_trips.map((trip) => {
              const currency = (trip as any).currency ?? 'XOF'
              return (
                <Card key={trip.id} className="p-4">
                  <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
                    <span>{trip.departure}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      {trip.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" aria-hidden />
                          {formatDate(trip.date)}
                        </span>
                      )}
                      <span>{(trip.grams_disponible / 1000).toFixed(1)} kg dispo</span>
                    </div>
                    <span className="font-bold text-[#1B3A6B] font-mono shrink-0">
                      {formatAmount(trip.price_per_kg, currency)}/kg
                    </span>
                  </div>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#1B3A6B] text-white text-sm font-semibold rounded-[10px] hover:bg-[#152d54] transition-colors min-h-[48px]"
                  >
                    Réserver ce trajet
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-3">Paiement sécurisé par escrow SafeMove</p>
          <Link to="/trips" className="text-xs text-[#1B3A6B] hover:underline font-medium">
            Voir tous les trajets disponibles →
          </Link>
        </div>
      </div>
    </div>
  )
}