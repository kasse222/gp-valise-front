import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import { Button, Card, Input } from '@/components/ui'
import { CitySelect } from '@/components/ui/CitySelect'
import { createTrip } from '@/api/trips'

export default function CreateTripPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  const [departure,    setDeparture]    = useState('')
  const [destination,  setDestination]  = useState('')
  const [date,         setDate]         = useState('')
  const [availableKg,  setAvailableKg]  = useState('')
  const [pricePerKg,   setPricePerKg]   = useState('')
  const [typeTrip,     setTypeTrip]     = useState('standard')

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
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proposer un trajet</h1>
        <p className="text-sm text-gray-500 mt-1">Renseignez les informations de votre trajet</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Départ — CitySelect avec datalist mondial */}
          <CitySelect
            label="Ville de départ"
            value={departure}
            onChange={setDeparture}
            placeholder="ex : Dakar"
            required
          />

          {/* Destination — CitySelect avec datalist mondial */}
          <CitySelect
            label="Destination"
            value={destination}
            onChange={setDestination}
            placeholder="ex : Paris"
            required
          />

          {/* Date */}
          <Input
            label="Date et heure de départ"
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Capacité */}
          {/* Capacité — slider */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 select-none">
              Capacité disponible (kg) <span className="text-red-500" aria-hidden>*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={50}
                step={0.5}
                value={availableKg || 10}
                onChange={(e) => setAvailableKg(e.target.value)}
                required
                aria-label="Capacité disponible en kg"
                className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer"
              />
              <span className="min-w-[4rem] text-center bg-[#EBF4FF] text-[#1B3A6B] font-bold text-sm px-3 py-1.5 rounded-[10px] font-mono">
                {availableKg || 10} kg
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 kg</span>
              <span>50 kg</span>
            </div>
          </div>

          {/* Prix */}
          <Input
            label="Prix par kg (€/kg)"
            type="number"
            required
            min="1"
            max="100"
            step="0.5"
            placeholder="ex : 8"
            helper="Montant en € par kilogramme transporté"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
          />

          {/* Type de trajet */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 select-none">
              Type de trajet
            </label>
            <select
              required
              value={typeTrip}
              onChange={(e) => setTypeTrip(e.target.value)}
              className="w-full min-h-[48px] px-4 py-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all duration-200"
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="sur_devis">Sur devis</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              Publier le trajet
            </Button>
            <Link
              to="/traveler/trips"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}