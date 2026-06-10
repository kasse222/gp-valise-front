import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { Package, Home } from 'lucide-react'

import { Button, Card, Input } from '@/components/ui'
import { CitySelect } from '@/components/ui/CitySelect'
import { CountrySelect } from '@/components/ui/CountrySelect'
import { MapPickerField } from '@/components/ui/MapPickerField'

import { createTrip } from '@/api/trips'

interface Coords { lat: number; lng: number }

export default function CreateTripPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  // ── Trajet ───────────────────────────────────────────────────────────
  const [departureCountry, setDepartureCountry] = useState('')
  const [departure,        setDeparture]        = useState('')
  const [destCountry,      setDestCountry]      = useState('')
  const [destination,      setDestination]      = useState('')
  const [date,             setDate]             = useState('')
  const [availableKg,      setAvailableKg]      = useState('10')
  const [pricePerKg,       setPricePerKg]       = useState('8')
  const [typeTrip,         setTypeTrip]         = useState('standard')

  // ── Pickup ───────────────────────────────────────────────────────────
  const [pickupAddress,      setPickupAddress]      = useState('')
  const [pickupCity,         setPickupCity]         = useState(departure)
  const [pickupExact,        setPickupExact]        = useState<Coords | null>(null)
  const [pickupApprox,       setPickupApprox]       = useState<Coords | null>(null)
  const [pickupInstructions, setPickupInstructions] = useState('')

  // ── Delivery ─────────────────────────────────────────────────────────
  const [deliveryAddress,      setDeliveryAddress]      = useState('')
  const [deliveryCity,         setDeliveryCity]         = useState(destination)
  const [deliveryExact,        setDeliveryExact]        = useState<Coords | null>(null)
  const [deliveryApprox,       setDeliveryApprox]       = useState<Coords | null>(null)
  const [deliveryInstructions, setDeliveryInstructions] = useState('')

  // Sync pickup/delivery city avec departure/destination
  useEffect(() => { if (departure)   setPickupCity(departure)   }, [departure])
  useEffect(() => { if (destination) setDeliveryCity(destination) }, [destination])
  // Restaurer le trajet en attente après retour de KYC
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingTrip')
    if (!pending) return
    try {
      const data = JSON.parse(pending)
      if (data.departure)            setDeparture(data.departure)
      if (data.destination)          setDestination(data.destination)
      if (data.date)                 setDate(data.date)
      if (data.availableKg)          setAvailableKg(data.availableKg)
      if (data.pricePerKg)           setPricePerKg(data.pricePerKg)
      if (data.typeTrip)             setTypeTrip(data.typeTrip)
      if (data.pickupInstructions)   setPickupInstructions(data.pickupInstructions)
      if (data.deliveryInstructions) setDeliveryInstructions(data.deliveryInstructions)
      sessionStorage.removeItem('pendingTrip')
      toast.success('Votre trajet a été restauré.')
    } catch {}
  }, [])

    const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      toast.success('Trajet créé avec succès !')
      navigate('/traveler/trips')
    },
    onError: (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.data?.errors?.kyc) {
      // Sauvegarder l'état du formulaire
      sessionStorage.setItem('pendingTrip', JSON.stringify({
        departure, destination, date,
        availableKg, pricePerKg, typeTrip,
        pickupAddress, pickupCity, pickupInstructions,
        deliveryAddress, deliveryCity, deliveryInstructions,
      }))
      navigate('/traveler/profile', { state: { kycRequired: true } })
      return
    }
    toast.error(error.response?.data?.message ?? 'Une erreur est survenue')
  },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    mutation.mutate({
      departure,
      destination,
      date,
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proposer un trajet</h1>
        <p className="text-sm text-gray-500 mt-1">Renseignez les informations de votre trajet</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Informations trajet */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Informations du trajet</h2>
          <div className="flex flex-col gap-5">

            {/* Départ */}
            <div className="grid grid-cols-2 gap-3">
              <CountrySelect
                label="Pays de départ"
                value={departureCountry}
                onChange={(code) => { setDepartureCountry(code); setDeparture('') }}
                required
              />
              <CitySelect
                label="Ville de départ"
                value={departure}
                onChange={setDeparture}
                placeholder="ex : Dakar"
                countryCode={departureCountry}
                required
              />
            </div>

            {/* Destination */}
            <div className="grid grid-cols-2 gap-3">
              <CountrySelect
                label="Pays de destination"
                value={destCountry}
                onChange={(code) => { setDestCountry(code); setDestination('') }}
                required
              />
              <CitySelect
                label="Ville de destination"
                value={destination}
                onChange={setDestination}
                placeholder="ex : Paris"
                countryCode={destCountry}
                required
              />
            </div>

            <Input label="Date et heure de départ" type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} />

            {/* Capacité */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 select-none">
                Capacité disponible (kg) <span className="text-red-500" aria-hidden>*</span>
              </label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={50} step={0.5} value={availableKg}
                  onChange={(e) => setAvailableKg(e.target.value)}
                  className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                <span className="min-w-[4rem] text-center bg-[#EBF4FF] text-[#1B3A6B] font-bold text-sm px-3 py-1.5 rounded-[10px] font-mono">
                  {availableKg} kg
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400"><span>1 kg</span><span>50 kg</span></div>
            </div>

            {/* Prix */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 select-none">
                Prix par kg (€/kg) <span className="text-red-500" aria-hidden>*</span>
              </label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={100} step={0.5} value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                <span className="min-w-[4rem] text-center bg-[#EBF4FF] text-[#1B3A6B] font-bold text-sm px-3 py-1.5 rounded-[10px] font-mono">
                  {pricePerKg} €
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400"><span>1 €</span><span>100 €</span></div>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 select-none">Type de trajet</label>
              <select value={typeTrip} onChange={(e) => setTypeTrip(e.target.value)} required
                className="w-full min-h-[48px] px-4 py-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all">
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="sur_devis">Sur devis</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 2 cartes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 📦 Pickup */}
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
              <h2 className="text-sm font-semibold text-gray-700">📦 Où récupérer le colis ?</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Adresse révélée après paiement confirmé.</p>
            <div className="flex flex-col gap-3">
              <MapPickerField
                initialCity={departure}
                onCityChange={setPickupCity}
                onAddressChange={setPickupAddress}
                onCoords={(exact, approx) => {
                  setPickupExact(exact.lat !== 0 ? exact : null)
                  setPickupApprox(approx.lat !== 0 ? approx : null)
                }}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Instructions <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea value={pickupInstructions} onChange={(e) => setPickupInstructions(e.target.value)}
                  rows={2} placeholder="Ex : Sonner à l'interphone…"
                  className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]" />
              </div>
            </div>
          </Card>

          {/* 🎯 Delivery */}
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
              <h2 className="text-sm font-semibold text-gray-700">🎯 Où remettre le colis ?</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Adresse révélée après paiement confirmé.</p>
            <div className="flex flex-col gap-3">
              <MapPickerField
                initialCity={destination}
                onCityChange={setDeliveryCity}
                onAddressChange={setDeliveryAddress}
                onCoords={(exact, approx) => {
                  setDeliveryExact(exact.lat !== 0 ? exact : null)
                  setDeliveryApprox(approx.lat !== 0 ? approx : null)
                }}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Instructions <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={2} placeholder="Ex : Appeler à l'arrivée…"
                  className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pb-8">
          <Button type="submit" variant="primary" loading={mutation.isPending}>
            Publier le trajet
          </Button>
          <Link to="/traveler/trips" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}

interface Coords { lat: number; lng: number }