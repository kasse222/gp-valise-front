/**
 * TrackingPage v2.0
 * Suivi de colis — Stepper animé, carte de statut visuelle,
 * timeline historique, design premium
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  Package, Plane, CheckCircle, Clock, Truck,
  ArrowLeft, MapPin, Search,
} from 'lucide-react'

import { Button, Card, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

interface TrackingData {
  tracking_id:   string
  description:   string
  weight_kg:     number
  content_items: Array<{ category: string; description: string }>
  status: { label: string; step: number; color: string }
  trip: {
    departure:     string
    destination:   string
    date:          string | null
    flight_number: string | null
  } | null
  history: Array<{ label: string; changed_at: string }>
}

// ── Steps ────────────────────────────────────────────────────────────────────

const DELIVERY_STEPS = [
  { step: 1, label: 'Paiement',    icon: Clock        },
  { step: 2, label: 'Confirmé',    icon: CheckCircle  },
  { step: 3, label: 'En transit',  icon: Truck        },
  { step: 4, label: 'À récupérer', icon: MapPin       },
  { step: 5, label: 'Livré',       icon: CheckCircle  },
]

// ── Animated Progress Stepper ────────────────────────────────────────────────

function ProgressStepper({ currentStep }: { currentStep: number }) {
  const [animStep, setAnimStep] = useState(0)

  // Animate steps in sequence on mount
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setAnimStep(i)
      if (i >= currentStep) clearInterval(interval)
    }, 200)
    return () => clearInterval(interval)
  }, [currentStep])

  if (currentStep === 0) return null

  return (
    <div className="flex items-center justify-between w-full" aria-label="Progression de la livraison">
      {DELIVERY_STEPS.map((s, i) => {
        const done   = animStep > s.step
        const active = animStep === s.step
        const future = animStep < s.step
        const Icon   = s.icon

        return (
          <div key={s.step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              {/* Step circle */}
              <div
                className={cn(
                  'relative w-10 h-10 rounded-full flex items-center justify-center border-2',
                  'transition-all duration-500',
                  done   && 'bg-[#1B3A6B] border-[#1B3A6B] text-white shadow-[0_0_0_4px_rgba(27,58,107,0.15)]',
                  active && 'bg-white border-[#1B3A6B] text-[#1B3A6B] shadow-[0_0_0_4px_rgba(27,58,107,0.15)]',
                  future && 'bg-white border-slate-200 text-slate-300',
                )}
                aria-label={`${s.label} — ${done ? 'terminé' : active ? 'en cours' : 'à venir'}`}
              >
                {done ? (
                  <CheckCircle className="w-5 h-5" aria-hidden />
                ) : (
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-all duration-300',
                      active && 'animate-[sm-pulse_2s_ease-in-out_infinite]',
                    )}
                    aria-hidden
                  />
                )}
                {/* Glow for active */}
                {active && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      animation: 'sm-pulse-glow 2s ease-in-out infinite',
                    }}
                    aria-hidden
                  />
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-semibold text-center leading-tight transition-colors duration-300',
                  done || active ? 'text-[#1B3A6B]' : 'text-slate-400',
                )}
              >
                {s.label}
              </span>
            </div>

            {/* Connector line */}
            {i < DELIVERY_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1.5 mb-5 rounded-full overflow-hidden bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#1B3A6B] transition-all duration-500"
                  style={{ width: animStep > s.step ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── cn helper (local) ────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── Status Banner ─────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   dot: 'bg-amber-400' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800',    dot: 'bg-blue-400' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-800',  dot: 'bg-indigo-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  red:     { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     dot: 'bg-red-500' },
  gray:    { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-600',   dot: 'bg-slate-400' },
}

// ── Page ─────────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  document: '📄', phone: '📱', computer: '💻',
  clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
}

export default function TrackingPage() {
  const { tracking_id } = useParams<{ tracking_id: string }>()
  const navigate        = useNavigate()

  const { data, isLoading, isError } = useQuery<TrackingData>({
    queryKey:  ['track', tracking_id],
    queryFn:   async () => (await axios.get(`/api/v1/track/${tracking_id}`)).data,
    enabled:   !!tracking_id,
    staleTime: 30_000,
    retry:     false,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav
        className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30"
        style={{ boxShadow: '0 1px 0 0 #e2e8f0' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors min-h-[44px] group"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden
          />
          Accueil
        </button>
        <img src="/logo-nav-hori.png" alt="Safe Move" className="h-12" />
        <div className="w-20" aria-hidden />
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">

        {/* Hero */}
        <div
          className="rounded-[20px] px-6 py-6 text-white overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0f2544 0%, #1B3A6B 60%, #2351a0 100%)',
            boxShadow: '0 4px 24px rgba(27,58,107,0.25)',
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden
          />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
              <Package className="w-6 h-6 text-white/90" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white">Suivi de colis</h1>
              <p className="text-white/60 text-xs font-mono break-all mt-1">{tracking_id}</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Recherche du colis…</p>
          </div>
        )}

        {/* Not found */}
        {isError && (
          <Card>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Search className="w-7 h-7 text-slate-400" aria-hidden />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">Colis introuvable</p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Vérifiez l'identifiant de suivi et réessayez.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        )}

        {/* Data */}
        {data && (
          <>
            {/* Status banner */}
            {(() => {
              const c = colorMap[data.status.color] ?? colorMap.gray
              return (
                <div
                  className={cn(
                    'p-4 rounded-[14px] border flex items-center gap-3',
                    c.bg, c.border,
                  )}
                  role="status"
                  aria-label={`Statut : ${data.status.label}`}
                >
                  <span
                    className={cn('w-2.5 h-2.5 rounded-full shrink-0', c.dot)}
                    style={data.status.step > 0 && data.status.step < 5
                      ? { animation: 'sm-pulse-glow 2s ease-in-out infinite' }
                      : {}}
                    aria-hidden
                  />
                  <p className={cn('font-bold text-sm', c.text)}>{data.status.label}</p>
                </div>
              )
            })()}

            {/* Progress stepper */}
            {data.status.step > 0 && (
              <Card>
                <ProgressStepper currentStep={data.status.step} />
              </Card>
            )}

            {/* Trip info */}
            {data.trip && (
              <Card>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Trajet</h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-bold text-slate-900 text-lg">{data.trip.departure}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <Plane className="w-4 h-4 text-[#1B3A6B] shrink-0" aria-hidden />
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <span className="font-bold text-slate-900 text-lg">{data.trip.destination}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  {data.trip.date && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                      {formatDate(data.trip.date)}
                    </span>
                  )}
                  {data.trip.flight_number && (
                    <span className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                      Vol {data.trip.flight_number}
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Colis */}
            <Card>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Contenu du colis
              </h2>
              <p className="text-sm text-slate-700 mb-3">{data.description}</p>
              {data.weight_kg > 0 && (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-full px-3 py-1.5 border border-slate-100 mb-3">
                  ⚖️ {data.weight_kg.toFixed(1)} kg
                </div>
              )}
              {data.content_items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.content_items.map((ci, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF4FF] text-[#1B3A6B] text-xs rounded-full font-medium border border-[#1B3A6B]/10"
                    >
                      {CATEGORY_EMOJI[ci.category] ?? '📦'} {ci.description}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Historique */}
            {data.history.length > 0 && (
              <Card>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                  Historique
                </h2>
                <ol className="space-y-0">
                  {data.history.map((entry, i) => (
                    <li key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                      {/* Timeline line */}
                      {i < data.history.length - 1 && (
                        <div
                          className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-100"
                          aria-hidden
                        />
                      )}
                      {/* Dot */}
                      <div
                        className={cn(
                          'mt-1 w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10',
                          i === 0
                            ? 'bg-[#1B3A6B] border-[#1B3A6B]'
                            : 'bg-white border-slate-300',
                        )}
                        aria-hidden
                      />
                      <div>
                        <p className={cn(
                          'text-sm',
                          i === 0 ? 'font-semibold text-slate-900' : 'text-slate-600',
                        )}>
                          {entry.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(entry.changed_at)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            <p className="text-xs text-slate-400 text-center pb-4">
              Suivi mis à jour automatiquement à chaque étape.
            </p>
          </>
        )}
      </div>
    </div>
  )
}