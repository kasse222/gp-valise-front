import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  Package, Plane, CheckCircle, Clock, Truck,
  ArrowLeft, MapPin, AlertCircle, Search,
} from 'lucide-react'

import { Button, Card, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

interface TrackingData {
  tracking_id:   string
  description:   string
  weight_kg:     number
  content_items: Array<{ category: string; description: string }>
  status: {
    label: string
    step:  number
    color: string
  }
  trip: {
    departure:     string
    destination:   string
    date:          string | null
    flight_number: string | null
  } | null
  history: Array<{
    label:      string
    changed_at: string
  }>
}

// ─── Étapes de livraison ────────────────────────────────────────────────────

const DELIVERY_STEPS = [
  { step: 1, label: 'Paiement',    icon: Clock   },
  { step: 2, label: 'Confirmé',    icon: CheckCircle },
  { step: 3, label: 'En transit',  icon: Truck   },
  { step: 4, label: 'À récupérer', icon: MapPin  },
  { step: 5, label: 'Livré',       icon: CheckCircle },
]

function ProgressStepper({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null
  return (
    <div className="flex items-center justify-between px-2 mb-6">
      {DELIVERY_STEPS.map((s, i) => {
        const done   = currentStep > s.step
        const active = currentStep === s.step
        const Icon   = s.icon
        return (
          <div key={s.step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white' :
                active ? 'bg-white border-[#1B3A6B] text-[#1B3A6B]' :
                         'bg-white border-gray-200 text-gray-300'
              }`}>
                <Icon className="w-4 h-4" aria-hidden />
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${
                active ? 'text-[#1B3A6B]' : done ? 'text-[#1B3A6B]' : 'text-gray-400'
              }`}>{s.label}</span>
            </div>
            {i < DELIVERY_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full ${done ? 'bg-[#1B3A6B]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TrackingPage() {
  const { tracking_id } = useParams<{ tracking_id: string }>()
  const navigate        = useNavigate()

  const { data, isLoading, isError } = useQuery<TrackingData>({
    queryKey: ['track', tracking_id],
    queryFn:  async () => {
      const res = await axios.get(`/api/v1/track/${tracking_id}`)
      return res.data
    },
    enabled:   !!tracking_id,
    staleTime: 30_000,
    retry:     false,
  })

  const CATEGORY_EMOJI: Record<string, string> = {
    document: '📄', phone: '📱', computer: '💻',
    clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
  }

  const colorMap: Record<string, string> = {
    amber:   'bg-amber-50 border-amber-200 text-amber-800',
    blue:    'bg-blue-50 border-blue-200 text-blue-800',
    indigo:  'bg-indigo-50 border-indigo-200 text-indigo-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    red:     'bg-red-50 border-red-200 text-red-800',
    gray:    'bg-gray-50 border-gray-200 text-gray-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors min-h-[44px]">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Accueil
        </button>
        <img src="/logo-nav-hori.png" alt="Safe Move" className="h-14" />
        <div className="w-20" /> {/* spacer */}
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-5">

        {/* Hero */}
        <div className="bg-[#1B3A6B] rounded-[20px] px-6 py-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Package className="w-5 h-5 text-white/70" aria-hidden />
            <h1 className="text-xl font-bold">Suivi de colis</h1>
          </div>
          <p className="text-white/60 text-xs font-mono break-all">{tracking_id}</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {/* Erreur / introuvable */}
        {isError && (
          <Card>
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Colis introuvable</p>
                <p className="text-sm text-gray-500 mt-1">
                  Vérifiez l'identifiant de suivi et réessayez.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        )}

        {/* Données */}
        {data && (
          <>
            {/* Statut banner */}
            <div className={`p-4 rounded-[14px] border flex items-center gap-3 ${colorMap[data.status.color] ?? colorMap.gray}`}>
              <AlertCircle className="w-5 h-5 shrink-0" aria-hidden />
              <p className="font-semibold text-sm">{data.status.label}</p>
            </div>

            {/* Barre de progression */}
            {data.status.step > 0 && (
              <Card>
                <ProgressStepper currentStep={data.status.step} />
              </Card>
            )}

            {/* Trajet */}
            {data.trip && (
              <Card>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trajet</h2>
                <div className="flex items-center gap-3 text-base font-bold text-gray-900 mb-3">
                  <span>{data.trip.departure}</span>
                  <Plane className="w-4 h-4 text-[#1B3A6B] shrink-0" aria-hidden />
                  <span>{data.trip.destination}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  {data.trip.date && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden />
                      {formatDate(data.trip.date)}
                    </span>
                  )}
                  {data.trip.flight_number && (
                    <span className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-gray-400" aria-hidden />
                      Vol {data.trip.flight_number}
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Contenu */}
            <Card>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contenu du colis</h2>
              <p className="text-sm text-gray-700 mb-3">{data.description}</p>
              {data.weight_kg > 0 && (
                <p className="text-xs text-gray-500 mb-3">⚖️ {data.weight_kg.toFixed(1)} kg</p>
              )}
              {data.content_items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.content_items.map((ci, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EBF4FF] text-[#1B3A6B] text-xs rounded-full font-medium">
                      {CATEGORY_EMOJI[ci.category] ?? '📦'} {ci.description}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Historique */}
            {data.history.length > 0 && (
              <Card>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historique</h2>
                <ol className="space-y-3">
                  {data.history.map((entry, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-[#1B3A6B]' : 'bg-gray-300'}`} aria-hidden />
                      <div>
                        <p className="font-medium text-gray-900">{entry.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.changed_at)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* Footer info */}
            <p className="text-xs text-gray-400 text-center pb-4">
              Ce suivi est mis à jour automatiquement à chaque étape de la livraison.
            </p>
          </>
        )}
      </div>
    </div>
  )
}