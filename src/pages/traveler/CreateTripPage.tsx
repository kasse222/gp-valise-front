/**
 * CreateTripPage v2
 * Stepper animé, layout form côté gauche / carte côté droit,
 * résumé trajet sticky, cohérent avec les maquettes
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import {
  Package, Home, Plane, Check, ChevronRight, ChevronLeft,
  ArrowRight, AlertCircle, Calendar,
} from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { CitySelect } from '@/components/ui/CitySelect'
import { CountrySelect } from '@/components/ui/CountrySelect'
import { MapPickerField } from '@/components/ui/MapPickerField'
import { createTrip } from '@/api/trips'
import { currencyForCountry, currencySymbol } from '@/lib/utils'

// currencySymbol is a Record<string, string> — use bracket access, not function call

interface Coords { lat: number; lng: number }

const nowLocal = () => {
  const d = new Date(); d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

const STEPS = [
  { n: 1, label: 'Itinéraire', icon: Plane },
  { n: 2, label: 'Capacité',   icon: Package },
  { n: 3, label: 'Points RDV', icon: Home },
]

interface CurrencyPriceConfig { min: number; max: number; step: number; default: number; hasSubunit: boolean }

const PRICE_CONFIG: Record<string, CurrencyPriceConfig> = {
  XOF: { min: 500,  max: 15000, step: 100, default: 2000, hasSubunit: false },
  EUR: { min: 1,    max: 100,   step: 0.5, default: 8,    hasSubunit: true  },
  MAD: { min: 5,    max: 500,   step: 5,   default: 80,   hasSubunit: true  },
  GBP: { min: 1,    max: 100,   step: 0.5, default: 8,    hasSubunit: true  },
  USD: { min: 1,    max: 100,   step: 0.5, default: 8,    hasSubunit: true  },
}

const CATEGORIES = [
  { value: 'phone',     label: 'Téléphone',   icon: '📱' },
  { value: 'computer',  label: 'Ordinateur',  icon: '💻' },
  { value: 'cosmetics', label: 'Cosmétiques', icon: '💄' },
  { value: 'document',  label: 'Document',    icon: '📄' },
  { value: 'clothes',   label: 'Vêtements',   icon: '👕' },
  { value: 'medicine',  label: 'Médicaments', icon: '💊' },
  { value: 'other',     label: 'Autre',       icon: '📦' },
]

// ── Stepper ───────────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center w-full mb-0">
      {STEPS.map((step, i) => {
        const done   = current > step.n
        const active = current === step.n
        const Icon   = step.icon
        return (
          <div key={step.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-400
                ${done   ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white shadow-[0_0_0_4px_rgba(27,58,107,0.15)]' : ''}
                ${active ? 'bg-white border-[#1B3A6B] text-[#1B3A6B] shadow-[0_0_0_4px_rgba(27,58,107,0.12)]' : ''}
                ${!done && !active ? 'bg-white border-slate-200 text-slate-300' : ''}
              `}>
                {done
                  ? <Check className="w-5 h-5" aria-hidden />
                  : <Icon className="w-4 h-4" aria-hidden />}
                {active && (
                  <span className="absolute inset-0 rounded-full animate-ping border-2 border-[#1B3A6B]/25" aria-hidden />
                )}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap transition-colors ${
                active || done ? 'text-[#1B3A6B]' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-3 mb-5 h-0.5 rounded-full overflow-hidden bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#1B3A6B] transition-all duration-500"
                  style={{ width: done ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Summary hero ──────────────────────────────────────────────────────────────

function TripSummaryHero({ departure, destination, date, availableKg, pricePerKg, symbol }: {
  departure: string; destination: string; date: string
  availableKg: number; pricePerKg: number; symbol: string
}) {
  if (!departure && !destination) return null
  return (
    <div
      className="rounded-[18px] px-5 py-4 text-white mb-0"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1B3A6B 100%)' }}
    >
      <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Votre trajet</p>
      <div className="flex items-center gap-2 font-black text-lg mb-2">
        <span>{departure || '—'}</span>
        <div className="flex items-center gap-1">
          <div className="flex-1 h-px bg-white/20 w-4" />
          <Plane className="w-3.5 h-3.5 text-white/60" />
          <div className="flex-1 h-px bg-white/20 w-4" />
        </div>
        <span>{destination || '—'}</span>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-white/60">
        {date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        )}
        {availableKg > 0 && <span>📦 {availableKg} kg</span>}
        {pricePerKg > 0 && <span className="font-bold text-white">{symbol}{pricePerKg}/kg</span>}
      </div>
    </div>
  )
}

// ── Category toggle ───────────────────────────────────────────────────────────

function CategoryToggle({ selected, onChange }: {
  selected: string[]; onChange: (cats: string[]) => void
}) {
  const toggle = (val: string) => {
    onChange(selected.includes(val)
      ? selected.filter(v => v !== val)
      : [...selected, val])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => {
        const active = selected.includes(cat.value)
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => toggle(cat.value)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold
              border-2 transition-all duration-150
              ${active
                ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-[#1B3A6B]/40 hover:bg-[#EBF4FF]'}
            `}
          >
            {cat.icon} {cat.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateTripPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [step, setStep] = useState(1)

  // Step 1 — Itinéraire
  const [departureCountry,  setDepartureCountry]  = useState('')
  const [departureCity,     setDepartureCity]      = useState('')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [destinationCity,   setDestinationCity]    = useState('')
  const [date,              setDate]               = useState(nowLocal())
  const [isRoundTrip,       setIsRoundTrip]        = useState(false)
  const [flightNumber,      setFlightNumber]       = useState('')

  // Step 2 — Capacité
  const currency    = currencyForCountry(departureCountry)
  const priceConfig = PRICE_CONFIG[currency] ?? PRICE_CONFIG['EUR']
  const sym         = currencySymbol[currency] ?? currency

  const [capacityKg,     setCapacityKg]     = useState(10)
  const [pricePerKg,     setPricePerKg]     = useState(priceConfig.default)
  const [acceptedCats,   setAcceptedCats]   = useState<string[]>([])
  // Tarifs spéciaux par catégorie — null = prix de base
  const [categoryFees,   setCategoryFees]   = useState<Record<string, number | null>>({})

  const setCategoryFee = (cat: string, value: number | null) => {
    setCategoryFees(prev => ({ ...prev, [cat]: value }))
  }

  useEffect(() => {
    const cfg = PRICE_CONFIG[currency] ?? PRICE_CONFIG['EUR']
    setPricePerKg(cfg.default)
  }, [currency])

  // Step 3 — Points RDV
  const [pickupCity,       setPickupCity]       = useState('')
  const [pickupAddress,    setPickupAddress]    = useState('')
  const [pickupExact,      setPickupExact]      = useState<Coords | null>(null)
  const [pickupApprox,     setPickupApprox]     = useState<Coords | null>(null)
  const [pickupInstructions, setPickupInstructions] = useState('')

  const [deliveryCity,     setDeliveryCity]     = useState('')
  const [deliveryAddress,  setDeliveryAddress]  = useState('')
  const [deliveryExact,    setDeliveryExact]    = useState<Coords | null>(null)
  const [deliveryApprox,   setDeliveryApprox]   = useState<Coords | null>(null)
  const [deliveryInstructions, setDeliveryInstructions] = useState('')

  // Prefill cities from step 1
  useEffect(() => {
    if (departureCity && !pickupCity)   setPickupCity(departureCity)
    if (destinationCity && !deliveryCity) setDeliveryCity(destinationCity)
  }, [departureCity, destinationCity])

  // Validation
  const step1Valid = !!(departureCountry && departureCity && destinationCountry && destinationCity && date)
  const step2Valid = capacityKg > 0 && pricePerKg >= priceConfig.min

  // KYC check from sessionStorage
  useEffect(() => {
    const pendingTrip = sessionStorage.getItem('pendingTrip')
    if (pendingTrip) {
      try {
        const data = JSON.parse(pendingTrip)
        if (data.departure)    setDepartureCity(data.departure)
        if (data.destination)  setDestinationCity(data.destination)
        if (data.date)         setDate(data.date)
        if (data.capacityKg)   setCapacityKg(data.capacityKg)
        if (data.pricePerKg)   setPricePerKg(data.pricePerKg)
        sessionStorage.removeItem('pendingTrip')
        toast.success('Données récupérées — vérification KYC validée ✓')
      } catch {}
    }
  }, [])

  const pricePerKgForBackend = priceConfig.hasSubunit
    ? Math.round(pricePerKg * 100)
    : Math.round(pricePerKg)

  const mutation = useMutation({
    mutationFn: () => createTrip({
      departure:    departureCity,
      destination:  destinationCity,
      date,
      capacity:     Math.round(capacityKg * 1000),
      price_per_kg: pricePerKgForBackend,
      currency:     currency,
      type_trip:    isRoundTrip ? 'round_trip' : 'one_way',
      // Tarifs spéciaux par catégorie
      ...(Object.keys(categoryFees).length > 0 ? {
        category_fees: Object.entries(categoryFees)
          .filter(([, v]) => v !== null && v > 0)
          .map(([cat, fee]) => ({
            category: cat,
            fee: Math.round((fee as number) * (priceConfig.hasSubunit ? 100 : 1)),
          })),
      } : {}),
      ...(pickupExact ? {
        pickup_address:          pickupAddress || `${pickupExact.lat.toFixed(5)}, ${pickupExact.lng.toFixed(5)}`,
        pickup_city:             pickupCity || departureCity,
        pickup_latitude:         pickupExact.lat,
        pickup_longitude:        pickupExact.lng,
        pickup_approx_latitude:  pickupApprox?.lat,
        pickup_approx_longitude: pickupApprox?.lng,
        pickup_instructions:     pickupInstructions || undefined,
      } : {}),
      ...(deliveryExact ? {
        delivery_address:          deliveryAddress || `${deliveryExact.lat.toFixed(5)}, ${deliveryExact.lng.toFixed(5)}`,
        delivery_city:             deliveryCity || destinationCity,
        delivery_latitude:         deliveryExact.lat,
        delivery_longitude:        deliveryExact.lng,
        delivery_approx_latitude:  deliveryApprox?.lat,
        delivery_approx_longitude: deliveryApprox?.lng,
        delivery_instructions:     deliveryInstructions || undefined,
      } : {}),
    } as any),
    onSuccess: () => {
      toast.success('Trajet publié avec succès ! ✈️')
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      navigate('/traveler/trips')
    },
    onError: (err: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
      if (err.response?.data?.errors?.kyc) {
        sessionStorage.setItem('pendingTrip', JSON.stringify({
          departure: departureCity, destination: destinationCity, date,
          capacityKg, pricePerKg,
        }))
        toast.error('Vérification KYC requise avant de publier.')
        navigate('/traveler/profile', { state: { kycRequired: true } })
        return
      }
      toast.error(err.response?.data?.message ?? 'Une erreur est survenue.')
    },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link to="/traveler/trips"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1B3A6B] mb-4 transition-colors group">
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Mes trajets
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Créer un nouveau trajet</h1>
          <p className="text-slate-500 text-sm mt-1">Renseignez les informations de votre trajet</p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">

          {/* Left — form */}
          <div className="flex flex-col gap-6">

            {/* Stepper + step content card */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-6 sm:p-8"
              style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
              <StepBar current={step} />
              <div className="mt-8">

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
                        <Plane className="w-4 h-4 text-[#1B3A6B]" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Itinéraire</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <CountrySelect label="Pays de départ" value={departureCountry}
                        onChange={setDepartureCountry} required placeholder="Choisir un pays…" />
                      <CitySelect label="Ville de départ" value={departureCity}
                        onChange={setDepartureCity} countryCode={departureCountry} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <CountrySelect label="Pays de destination" value={destinationCountry}
                        onChange={setDestinationCountry} required placeholder="Choisir un pays…" />
                      <CitySelect label="Ville de destination" value={destinationCity}
                        onChange={setDestinationCity} countryCode={destinationCountry} required />
                    </div>

                    <Input label="Date et heure de départ" type="datetime-local"
                      value={date} onChange={e => setDate(e.target.value)}
                      min={nowLocal()} required />

                    <Input label="Numéro de vol" value={flightNumber}
                      onChange={e => setFlightNumber(e.target.value)}
                      placeholder="Ex : AT 702" helper="Optionnel — améliore la confiance des expéditeurs" />

                    {/* Round trip toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[12px] border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Trajet aller-retour</p>
                        <p className="text-xs text-slate-400 mt-0.5">Vous prévoyez un retour ?</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRoundTrip(v => !v)}
                        className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                          isRoundTrip ? 'bg-[#1B3A6B]' : 'bg-slate-200'
                        }`}
                        aria-checked={isRoundTrip}
                        role="switch"
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                          isRoundTrip ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#1B3A6B]" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Capacité & Tarif</h2>
                    </div>

                    {/* Capacity slider */}
                    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-[14px] border border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">Capacité disponible</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={capacityKg}
                            onChange={e => setCapacityKg(Math.max(0.5, Math.min(50, Number(e.target.value))))}
                            className="w-16 text-center bg-white border border-slate-200 text-[#1B3A6B] font-black text-sm px-2 py-1.5 rounded-[8px] focus:outline-none focus:border-[#1B3A6B]"
                          />
                          <span className="text-sm font-bold text-slate-500">kg</span>
                        </div>
                      </div>
                      <input type="range" min={0.5} max={50} step={0.5} value={capacityKg}
                        onChange={e => setCapacityKg(Number(e.target.value))}
                        className="w-full h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>0.5 kg</span><span>50 kg</span>
                      </div>
                    </div>

                    {/* Price slider */}
                    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-[14px] border border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">Prix par kg</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={pricePerKg}
                            onChange={e => setPricePerKg(Number(e.target.value))}
                            className="w-20 text-center bg-white border border-slate-200 text-[#1B3A6B] font-black text-sm px-2 py-1.5 rounded-[8px] focus:outline-none focus:border-[#1B3A6B]"
                          />
                          <span className="text-sm font-bold text-slate-500">{currency}</span>
                        </div>
                      </div>
                      <input type="range" min={priceConfig.min} max={priceConfig.max} step={priceConfig.step}
                        value={pricePerKg} onChange={e => setPricePerKg(Number(e.target.value))}
                        className="w-full h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{sym}{priceConfig.min}</span><span>{sym}{priceConfig.max}</span>
                      </div>
                    </div>

                    {/* Potential earnings */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[14px]">
                      <p className="text-sm font-bold text-emerald-800 mb-1">💰 Gains potentiels</p>
                      <p className="text-2xl font-black text-emerald-700">
                        {sym}{(capacityKg * pricePerKg).toLocaleString('fr-FR')} {currency}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">si tous les {capacityKg} kg sont réservés</p>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">
                        Types de colis acceptés{' '}
                        <span className="text-slate-400 font-normal">(optionnel — tous si vide)</span>
                      </label>
                      <CategoryToggle selected={acceptedCats} onChange={setAcceptedCats} />
                    </div>

                    {/* Tarifs spéciaux par catégorie */}
                    {acceptedCats.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-sm font-bold text-slate-700">
                            Tarifs spéciaux par catégorie
                          </label>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Laisser vide = prix de base {sym}{pricePerKg}/kg. Indiquer un prix spécifique pour les forfaits premium.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {CATEGORIES.filter(c => acceptedCats.includes(c.value)).map(cat => {
                            const fee = categoryFees[cat.value]
                            const hasCustom = fee !== null && fee !== undefined
                            return (
                              <div key={cat.value}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-[12px] border border-slate-100">
                                <span className="text-lg shrink-0">{cat.icon}</span>
                                <span className="text-sm font-semibold text-slate-700 flex-1 min-w-0">
                                  {cat.label}
                                </span>

                                {/* Toggle prix custom */}
                                <button
                                  type="button"
                                  onClick={() => setCategoryFee(
                                    cat.value,
                                    hasCustom ? null : pricePerKg
                                  )}
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                                    hasCustom
                                      ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                                      : 'bg-white text-slate-500 border-slate-200 hover:border-[#1B3A6B]/40'
                                  }`}
                                >
                                  {hasCustom ? 'Personnalisé' : 'Prix de base'}
                                </button>

                                {/* Input si prix custom activé */}
                                {hasCustom && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <input
                                      type="number"
                                      value={fee ?? ''}
                                      onChange={e => setCategoryFee(cat.value, Number(e.target.value) || null)}
                                      min={priceConfig.min}
                                      max={priceConfig.max * 3}
                                      step={priceConfig.step}
                                      className="w-20 text-center bg-white border border-[#1B3A6B]/30 text-[#1B3A6B] font-black text-sm px-2 py-1.5 rounded-[8px] focus:outline-none focus:border-[#1B3A6B]"
                                    />
                                    <span className="text-xs text-slate-400 font-medium">{currency}/kg</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Preview gains avec tarifs custom */}
                        {Object.values(categoryFees).some(v => v !== null) && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-[12px] text-xs text-blue-800">
                            💡 Les tarifs par catégorie permettent de fixer un prix différent selon le type de colis (ex: tarif premium pour l'électronique).
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
                        <Home className="w-4 h-4 text-[#1B3A6B]" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Points de rendez-vous</h2>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-[12px] flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        Optionnel — vous pouvez ajouter ces points plus tard. L'adresse exacte est révélée aux expéditeurs uniquement après paiement confirmé.
                      </p>
                    </div>

                    {/* Pickup */}
                    <div className="p-5 bg-slate-50 rounded-[16px] border border-slate-100 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <h3 className="text-sm font-bold text-slate-800">Où récupérer le colis ?</h3>
                      </div>
                      <MapPickerField
                        initialCity={pickupCity}
                        initialCoords={null}
                        onCityChange={setPickupCity}
                        onAddressChange={setPickupAddress}
                        onCoords={(exact, approx) => {
                          setPickupExact(exact.lat !== 0 ? exact : null)
                          setPickupApprox(approx.lat !== 0 ? approx : null)
                        }}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">
                          Instructions <span className="text-slate-400">(optionnel)</span>
                        </label>
                        <textarea value={pickupInstructions} onChange={e => setPickupInstructions(e.target.value)}
                          rows={2} placeholder="Ex : Sonner à l'interphone…"
                          className="w-full rounded-[10px] border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/15 transition-all" />
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className="p-5 bg-slate-50 rounded-[16px] border border-slate-100 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <h3 className="text-sm font-bold text-slate-800">Où remettre le colis ?</h3>
                      </div>
                      <MapPickerField
                        initialCity={deliveryCity}
                        initialCoords={null}
                        onCityChange={setDeliveryCity}
                        onAddressChange={setDeliveryAddress}
                        onCoords={(exact, approx) => {
                          setDeliveryExact(exact.lat !== 0 ? exact : null)
                          setDeliveryApprox(approx.lat !== 0 ? approx : null)
                        }}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">
                          Instructions <span className="text-slate-400">(optionnel)</span>
                        </label>
                        <textarea value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)}
                          rows={2} placeholder="Ex : Appeler à l'arrivée…"
                          className="w-full rounded-[10px] border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/15 transition-all" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <Button variant="secondary" onClick={() => setStep(step - 1)}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}>
                    Précédent
                  </Button>
                ) : (
                  <Link to="/traveler/trips" className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium">
                    Annuler
                  </Link>
                )}

                <div className="flex-1" />

                {step < 3 ? (
                  <Button variant="primary"
                    disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                    onClick={() => setStep(step + 1)}
                    rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Suivant
                  </Button>
                ) : (
                  <Button variant="primary" loading={mutation.isPending} onClick={() => mutation.mutate()}
                    rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Publier le trajet ✈️
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right — sticky summary */}
          <div className="sticky top-6 flex flex-col gap-4">
            <TripSummaryHero
              departure={departureCity}
              destination={destinationCity}
              date={date}
              availableKg={capacityKg}
              pricePerKg={pricePerKg}
              symbol={sym}
            />

            {/* Tips card */}
            <div className="bg-white border border-slate-100 rounded-[18px] p-5"
              style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <p className="text-xs font-bold text-[#1B3A6B] uppercase tracking-widest mb-3">💡 Conseil</p>
              {step === 1 && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ajoutez les adresses exactes pour faciliter la prise en charge et la livraison de vos colis. L'adresse n'est révélée qu'après paiement.
                </p>
              )}
              {step === 2 && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fixez un prix compétitif pour attirer plus d'expéditeurs. Le prix moyen pour Paris-Dakar est <strong>8€/kg</strong>.
                </p>
              )}
              {step === 3 && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  Les points de rendez-vous sont facultatifs mais augmentent la confiance des expéditeurs et votre taux de réservation.
                </p>
              )}
            </div>

            {/* Garanties */}
            <div className="bg-white border border-slate-100 rounded-[18px] p-5"
              style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Inclus avec SafeMove</p>
              <div className="flex flex-col gap-2.5">
                {[
                  'Paiement escrow — libéré après livraison',
                  'Profil GP avec vos propres clients',
                  'QR code + code secret de remise',
                  'Support en cas de litige',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}