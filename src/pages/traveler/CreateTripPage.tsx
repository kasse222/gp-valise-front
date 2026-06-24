import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { Package, Home, Plane, Check, ChevronRight, ChevronLeft } from 'lucide-react'

import { Button, Card, Input } from '@/components/ui'
import { CitySelect } from '@/components/ui/CitySelect'
import { CountrySelect } from '@/components/ui/CountrySelect'
import { MapPickerField } from '@/components/ui/MapPickerField'
import { createTrip } from '@/api/trips'
import { currencyForCountry, currencySymbol } from '@/lib/utils'

interface Coords { lat: number; lng: number }

const nowLocal = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

const STEPS = [
  { n: 1, label: 'Itinéraire' },
  { n: 2, label: 'Capacité' },
  { n: 3, label: 'Points RDV' },
]

// ─── Barre de progression ──────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done   = current > step.n
        const active = current === step.n
        return (
          <div key={step.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                done   ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white' :
                active ? 'bg-white border-[#1B3A6B] text-[#1B3A6B]' :
                         'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? <Check className="w-4 h-4" /> : step.n}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-[#1B3A6B]' : done ? 'text-[#1B3A6B]' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${done ? 'bg-[#1B3A6B]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Hero résumé ───────────────────────────────────────────────────────────

function TripSummaryHero({
  departure, destination, date, availableKg, pricePerKg, symbol,
}: {
  departure: string; destination: string; date: string
  availableKg: string; pricePerKg: string; symbol: string
}) {
  const hasRoute = departure && destination
  return (
    <div className="bg-[#1B3A6B] rounded-[20px] px-6 py-5 mb-6 text-white">
      <p className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-2">Votre trajet</p>
      {hasRoute ? (
        <div className="flex items-center gap-3 text-lg font-bold mb-2">
          <span>{departure}</span>
          <Plane className="w-4 h-4 text-white/60 shrink-0" aria-hidden />
          <span>{destination}</span>
        </div>
      ) : (
        <p className="text-white/50 text-sm mb-2 italic">Renseignez les villes de départ et d'arrivée</p>
      )}
      <div className="flex flex-wrap gap-3 text-sm text-white/80">
        {date && <span>📅 {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
        {availableKg && <span>⚖️ {availableKg} kg</span>}
        {/* Devise native du pays de départ */}
        {pricePerKg && <span>💰 {pricePerKg} {symbol}/kg</span>}
        {availableKg && pricePerKg && (
          <span className="ml-auto font-bold text-white">
            ≈ {(Number(availableKg) * Number(pricePerKg)).toFixed(0)} {symbol} max
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────

export default function CreateTripPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)

  // Étape 1 — Itinéraire
  const [departureCountry, setDepartureCountry] = useState('')
  const [departure,        setDeparture]        = useState('')
  const [destCountry,      setDestCountry]      = useState('')
  const [destination,      setDestination]      = useState('')
  const [date,             setDate]             = useState('')

  // Étape 2 — Capacité
  const [availableKg, setAvailableKg] = useState('10')
  const [pricePerKg,  setPricePerKg]  = useState('8')
  const [typeTrip,    setTypeTrip]    = useState('standard')

  // Devise dérivée du pays de départ — miroir de CurrencyEnum::forCountry() backend
  const tripCurrency = currencyForCountry(departureCountry)
  const tripSymbol   = currencySymbol[tripCurrency] ?? tripCurrency

  // Étape 3 — Points RDV
  const [pickupAddress,        setPickupAddress]        = useState('')
  const [pickupCity,           setPickupCity]           = useState('')
  const [pickupExact,          setPickupExact]          = useState<Coords | null>(null)
  const [pickupApprox,         setPickupApprox]         = useState<Coords | null>(null)
  const [pickupInstructions,   setPickupInstructions]   = useState('')
  const [deliveryAddress,      setDeliveryAddress]      = useState('')
  const [deliveryCity,         setDeliveryCity]         = useState('')
  const [deliveryExact,        setDeliveryExact]        = useState<Coords | null>(null)
  const [deliveryApprox,       setDeliveryApprox]       = useState<Coords | null>(null)
  const [deliveryInstructions, setDeliveryInstructions] = useState('')

  useEffect(() => { if (departure)   setPickupCity(departure)   }, [departure])
  useEffect(() => { if (destination) setDeliveryCity(destination) }, [destination])

  // Restaurer depuis sessionStorage (retour KYC)
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingTrip')
    if (!pending) return
    try {
      const d = JSON.parse(pending)
      if (d.departure)            setDeparture(d.departure)
      if (d.destination)          setDestination(d.destination)
      if (d.date)                 setDate(d.date)
      if (d.availableKg)          setAvailableKg(d.availableKg)
      if (d.pricePerKg)           setPricePerKg(d.pricePerKg)
      if (d.typeTrip)             setTypeTrip(d.typeTrip)
      if (d.pickupInstructions)   setPickupInstructions(d.pickupInstructions)
      if (d.deliveryInstructions) setDeliveryInstructions(d.deliveryInstructions)
      sessionStorage.removeItem('pendingTrip')
      toast.success('Votre trajet a été restauré.')
    } catch {}
  }, [])

  const sameRoute =
    !!departureCountry && !!destCountry && departureCountry === destCountry &&
    !!departure && !!destination &&
    departure.trim().toLowerCase() === destination.trim().toLowerCase()

  const step1Valid = !!departure && !!destination && !!date && !sameRoute
  const step2Valid = !!availableKg && !!pricePerKg

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      toast.success('Trajet créé avec succès !')
      navigate('/traveler/trips')
    },
    onError: (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
      if (error.response?.data?.errors?.kyc) {
        sessionStorage.setItem('pendingTrip', JSON.stringify({
          departure, destination, date, availableKg, pricePerKg, typeTrip,
          pickupInstructions, deliveryInstructions,
        }))
        navigate('/traveler/profile', { state: { kycRequired: true } })
        return
      }
      toast.error(error.response?.data?.message ?? 'Une erreur est survenue')
    },
  })

  function handleSubmit() {
    mutation.mutate({
      departure, destination, date,
      capacity:     Math.round(Number(availableKg) * 1000),
      price_per_kg: Math.round(Number(pricePerKg) * 100),
      type_trip:    typeTrip,
      ...(pickupExact ? {
        pickup_address:          pickupAddress || `${pickupExact.lat.toFixed(5)}, ${pickupExact.lng.toFixed(5)}`,
        pickup_city:             pickupCity || departure,
        pickup_latitude:         pickupExact.lat,
        pickup_longitude:        pickupExact.lng,
        pickup_approx_latitude:  pickupApprox?.lat,
        pickup_approx_longitude: pickupApprox?.lng,
        pickup_instructions:     pickupInstructions || undefined,
      } : {}),
      ...(deliveryExact ? {
        delivery_address:          deliveryAddress || `${deliveryExact.lat.toFixed(5)}, ${deliveryExact.lng.toFixed(5)}`,
        delivery_city:             deliveryCity || destination,
        delivery_latitude:         deliveryExact.lat,
        delivery_longitude:        deliveryExact.lng,
        delivery_approx_latitude:  deliveryApprox?.lat,
        delivery_approx_longitude: deliveryApprox?.lng,
        delivery_instructions:     deliveryInstructions || undefined,
      } : {}),
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">

      {/* Hero résumé — passe le symbole de devise */}
      <TripSummaryHero
        departure={departure} destination={destination}
        date={date} availableKg={availableKg} pricePerKg={pricePerKg}
        symbol={tripSymbol}
      />

      {/* Barre de progression */}
      <StepBar current={step} />

      {/* ── Étape 1 : Itinéraire ─────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-5">🗺️ Itinéraire</h2>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <CountrySelect label="Pays de départ" value={departureCountry}
                onChange={(code) => { setDepartureCountry(code); setDeparture('') }} required />
              <CitySelect label="Ville de départ" value={departure} onChange={setDeparture}
                placeholder="ex : Dakar" countryCode={departureCountry} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CountrySelect label="Pays de destination" value={destCountry}
                onChange={(code) => { setDestCountry(code); setDestination('') }} required />
              <CitySelect label="Ville de destination" value={destination} onChange={setDestination}
                placeholder="ex : Paris" countryCode={destCountry} required />
            </div>
            {sameRoute && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-[10px] text-sm text-red-700">
                ⚠️ Le départ et la destination ne peuvent pas être identiques.
              </div>
            )}
            <Input label="Date et heure de départ" type="datetime-local" required
              value={date} min={nowLocal()} onChange={(e) => setDate(e.target.value)} />
          </div>
        </Card>
      )}

      {/* ── Étape 2 : Capacité & Prix ─────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-5">⚖️ Capacité & Prix</h2>
          <div className="flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Capacité disponible (kg) *</label>
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={50} step={0.5} value={availableKg}
                  onChange={(e) => setAvailableKg(e.target.value)}
                  className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                <input type="number" min={1} max={50} step={0.5} value={availableKg}
                  onChange={(e) => setAvailableKg(e.target.value)}
                  className="w-20 text-center bg-[#EBF4FF] text-[#1B3A6B] font-bold text-sm px-2 py-1.5 rounded-[10px] border border-[#1B3A6B]/20 focus:outline-none" />
              </div>
              <div className="flex justify-between text-xs text-gray-400"><span>1 kg</span><span>50 kg</span></div>
            </div>

            <div className="flex flex-col gap-2">
              {/* Label dynamique selon la devise du pays de départ */}
              <label className="text-sm font-medium text-gray-700">
                Prix par kg ({tripSymbol}/kg) *
              </label>
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={100} step={0.5} value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                <input type="number" min={1} max={100} step={0.5} value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="w-20 text-center bg-[#EBF4FF] text-[#1B3A6B] font-bold text-sm px-2 py-1.5 rounded-[10px] border border-[#1B3A6B]/20 focus:outline-none" />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>1 {tripSymbol}</span>
                <span>100 {tripSymbol}</span>
              </div>
            </div>

            {/* Récap prix — devise native */}
            <div className="flex items-center justify-between bg-[#EBF4FF] rounded-[12px] px-4 py-3">
              <span className="text-sm text-[#1B3A6B]">Gain maximum estimé</span>
              <span className="text-lg font-bold text-[#1B3A6B] font-mono">
                {(Number(availableKg) * Number(pricePerKg)).toFixed(0)} {tripSymbol}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Type de trajet</label>
              <select value={typeTrip} onChange={(e) => setTypeTrip(e.target.value)} required
                className="w-full min-h-[48px] px-4 py-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all">
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="sur_devis">Sur devis</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* ── Étape 3 : Points de RDV ───────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
              <h2 className="text-sm font-semibold text-gray-700">📦 Où récupérer le colis ?</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Adresse révélée après paiement confirmé.</p>
            <div className="flex flex-col gap-3">
              <MapPickerField initialCity={departure} onCityChange={setPickupCity}
                onAddressChange={setPickupAddress}
                onCoords={(exact, approx) => {
                  setPickupExact(exact.lat !== 0 ? exact : null)
                  setPickupApprox(approx.lat !== 0 ? approx : null)
                }} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Instructions <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea value={pickupInstructions} onChange={(e) => setPickupInstructions(e.target.value)}
                  rows={2} placeholder="Ex : Sonner à l'interphone…"
                  className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
              <h2 className="text-sm font-semibold text-gray-700">🎯 Où remettre le colis ?</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Adresse révélée après paiement confirmé.</p>
            <div className="flex flex-col gap-3">
              <MapPickerField initialCity={destination} onCityChange={setDeliveryCity}
                onAddressChange={setDeliveryAddress}
                onCoords={(exact, approx) => {
                  setDeliveryExact(exact.lat !== 0 ? exact : null)
                  setDeliveryApprox(approx.lat !== 0 ? approx : null)
                }} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Instructions <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={2} placeholder="Ex : Appeler à l'arrivée…"
                  className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]" />
              </div>
            </div>
          </Card>

          <p className="text-xs text-gray-400 text-center">Les points de RDV sont optionnels — vous pouvez les ajouter plus tard.</p>
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-6 pb-8">
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)}
            leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Précédent
          </Button>
        )}
        {step === 1 && (
          <Link to="/traveler/trips" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Annuler
          </Link>
        )}
        <div className="flex-1" />
        {step < 3 && (
          <Button variant="primary"
            disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
            onClick={() => setStep(step + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}>
            Suivant
          </Button>
        )}
        {step === 3 && (
          <Button variant="primary" loading={mutation.isPending} onClick={handleSubmit}>
            Publier le trajet ✈️
          </Button>
        )}
      </div>
    </div>
  )
}