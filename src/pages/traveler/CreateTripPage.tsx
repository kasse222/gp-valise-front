import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { MapPin } from 'lucide-react'

import { Button, Card, Input } from '@/components/ui'
import { CitySelect } from '@/components/ui/CitySelect'
import { MapPickerField } from '@/components/ui/MapPickerField'
import { createTrip } from '@/api/trips'

interface Coords { lat: number; lng: number }

export default function CreateTripPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [departure,          setDeparture]          = useState('')
  const [destination,        setDestination]        = useState('')
  const [date,               setDate]               = useState('')
  const [availableKg,        setAvailableKg]        = useState('10')
  const [pricePerKg,         setPricePerKg]         = useState('8')
  const [typeTrip,           setTypeTrip]           = useState('standard')
  const [pickupAddress,      setPickupAddress]      = useState('')
  const [pickupCity,         setPickupCity]         = useState('')
  const [exactCoords,        setExactCoords]        = useState<Coords | null>(null)
  const [approxCoords,       setApproxCoords]       = useState<Coords | null>(null)
  const [pickupInstructions, setPickupInstructions] = useState('')

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      toast.success('Trajet créé avec succès !')
      navigate('/traveler/trips')
    },
    onError: (error: AxiosError<{ message?: string }>) => {
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
      ...(pickupAddress && pickupCity ? {
        pickup_address:          pickupAddress,
        pickup_city:             pickupCity,
        pickup_latitude:         exactCoords?.lat,
        pickup_longitude:        exactCoords?.lng,
        pickup_approx_latitude:  approxCoords?.lat,
        pickup_approx_longitude: approxCoords?.lng,
        pickup_instructions:     pickupInstructions || undefined,
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

            <CitySelect label="Ville de départ" value={departure} onChange={setDeparture} placeholder="ex : Dakar" required />
            <CitySelect label="Destination" value={destination} onChange={setDestination} placeholder="ex : Paris" required />

            <Input label="Date et heure de départ" type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} />

            {/* Capacité slider */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 select-none">
                Capacité disponible (kg) <span className="text-red-500" aria-hidden>*</span>
              </label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={50} step={0.5} value={availableKg}
                  onChange={(e) => setAvailableKg(e.target.value)}
                  aria-label="Capacité disponible en kg"
                  className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                <span className="min-w-[4rem] text-center bg-[#EBF4FF] text-[#1B3A6B] font-bold text-sm px-3 py-1.5 rounded-[10px] font-mono">
                  {availableKg} kg
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400"><span>1 kg</span><span>50 kg</span></div>
            </div>

            {/* Prix slider */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 select-none">
                Prix par kg (€/kg) <span className="text-red-500" aria-hidden>*</span>
              </label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={100} step={0.5} value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  aria-label="Prix par kilogramme en euros"
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

        {/* Point de dépôt */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
            <h2 className="text-sm font-semibold text-gray-700">Point de dépôt colis</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Où les expéditeurs déposent leur colis. L'adresse exacte est révélée après paiement confirmé.
          </p>

          <div className="flex flex-col gap-4">
            <Input
              label="Adresse"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="12 rue de la Paix"
              helper="Masquée jusqu'au paiement confirmé"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Localisation sur la carte</label>
              <MapPickerField
                initialCity={pickupCity}
                onCityChange={setPickupCity}
                onCoords={(exact, approx) => {
                  setExactCoords(exact.lat !== 0 ? exact : null)
                  setApproxCoords(approx.lat !== 0 ? approx : null)
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Instructions <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                rows={2}
                placeholder="Ex : Sonner à l'interphone, bâtiment B…"
                className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]"
              />
            </div>
          </div>
        </Card>

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