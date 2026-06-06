/**
 * PickupLocation — Chantier 6
 * GET /api/v1/bookings/:id/pickup-location
 * POST /api/v1/bookings/:id/pickup-location (traveler uniquement)
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Copy, ExternalLink, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import { Button, Card, Input, Spinner } from '@/components/ui'
import client from '@/api/client'

// ─── Types ─────────────────────────────────────────────────────────────────

interface PickupLocation {
  id:                    number
  booking_id:            number
  address:               string | null
  city:                  string | null
  latitude:              number | null
  longitude:             number | null
  approximate_latitude:  number | null
  approximate_longitude: number | null
  instructions:          string | null
  revealed:              boolean
}

interface PickupLocationPayload {
  address:               string
  city:                  string
  latitude:              number
  longitude:             number
  approximate_latitude:  number
  approximate_longitude: number
  instructions?:         string
}

// ─── API ───────────────────────────────────────────────────────────────────

async function getPickupLocation(bookingId: number): Promise<PickupLocation | null> {
  try {
    const { data } = await client.get<{ data: PickupLocation }>(
      `/bookings/${bookingId}/pickup-location`,
    )
    return data.data
  } catch (err) {
    const status = (err as AxiosError)?.response?.status
    if (status === 404) return null
    throw err
  }
}

async function savePickupLocation(
  bookingId: number,
  payload: PickupLocationPayload,
): Promise<PickupLocation> {
  const { data } = await client.post<{ data: PickupLocation }>(
    `/bookings/${bookingId}/pickup-location`,
    payload,
  )
  return data.data
}

// ─── Sender view — adresse masquée ou révélée ──────────────────────────────

function SenderPickupView({ location }: { location: PickupLocation }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = [location.address, location.city].filter(Boolean).join(', ')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleMaps = () => {
    const lat = location.latitude
    const lng = location.longitude
    if (lat && lng) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank', 'noopener')
    }
  }

  if (!location.revealed) {
    return (
      <div className="flex flex-col gap-3">
        {/* Zone approximative */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-[10px]">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-medium text-amber-800">Adresse masquée</p>
            <p className="text-xs text-amber-700 mt-0.5">
              L'adresse exacte sera révélée après confirmation du paiement.
            </p>
          </div>
        </div>

        {/* Carte approximative (~500m) */}
        {location.approximate_latitude && location.approximate_longitude && (
          <div className="rounded-[10px] overflow-hidden border border-gray-200 h-40 bg-gray-100 flex items-center justify-center">
            <iframe
              title="Zone approximative de dépôt"
              width="100%"
              height="160"
              loading="lazy"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${location.approximate_latitude},${location.approximate_longitude}&z=14&output=embed`}
            />
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Zone approximative (~500m) — adresse exacte disponible après paiement
        </p>
      </div>
    )
  }

  // Revealed — adresse exacte
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-[10px]">
        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-800">Adresse de dépôt</p>
          <p className="text-sm text-emerald-900 font-semibold mt-0.5">
            {[location.address, location.city].filter(Boolean).join(', ')}
          </p>
          {location.instructions && (
            <p className="text-xs text-emerald-700 mt-1">
              ℹ️ {location.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Carte exacte */}
      {location.latitude && location.longitude && (
        <div className="rounded-[10px] overflow-hidden border border-gray-200 h-48">
          <iframe
            title="Point de dépôt exact"
            width="100%"
            height="192"
            loading="lazy"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=16&output=embed`}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleCopy}
          leftIcon={copied
            ? <CheckCircle className="w-4 h-4 text-emerald-500" />
            : <Copy className="w-4 h-4" />}
        >
          {copied ? 'Copié !' : 'Copier l\'adresse'}
        </Button>
        {location.latitude && location.longitude && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleMaps}
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Ouvrir dans Maps
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Traveler form — définir le point de dépôt ─────────────────────────────

function TravelerPickupForm({
  bookingId,
  existing,
}: {
  bookingId: number
  existing:  PickupLocation | null
}) {
  const queryClient = useQueryClient()

  const [address,    setAddress]    = useState(existing?.address    ?? '')
  const [city,       setCity]       = useState(existing?.city       ?? '')
  const [lat,        setLat]        = useState(String(existing?.latitude              ?? ''))
  const [lng,        setLng]        = useState(String(existing?.longitude             ?? ''))
  const [approxLat,  setApproxLat]  = useState(String(existing?.approximate_latitude  ?? ''))
  const [approxLng,  setApproxLng]  = useState(String(existing?.approximate_longitude ?? ''))
  const [instructions, setInstructions] = useState(existing?.instructions ?? '')

  const mutation = useMutation({
    mutationFn: () => savePickupLocation(bookingId, {
      address,
      city,
      latitude:              Number(lat),
      longitude:             Number(lng),
      approximate_latitude:  Number(approxLat),
      approximate_longitude: Number(approxLng),
      instructions:          instructions || undefined,
    }),
    onSuccess: () => {
      toast.success('Point de dépôt enregistré.')
      queryClient.invalidateQueries({ queryKey: ['pickup-location', bookingId] })
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Une erreur est survenue.')
    },
  })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
      className="flex flex-col gap-4"
    >
      <p className="text-xs text-gray-500">
        Définissez le point de dépôt pour cette réservation. L'adresse exacte sera révélée à l'expéditeur après confirmation du paiement.
      </p>

      <Input
        label="Adresse"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="123 rue de la Paix"
        required
      />

      <Input
        label="Ville"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Dakar"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude exacte"
          type="number"
          step="any"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="14.6937"
          helper="Ex: 14.6937"
          required
        />
        <Input
          label="Longitude exacte"
          type="number"
          step="any"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="-17.4441"
          helper="Ex: -17.4441"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude approx."
          type="number"
          step="any"
          value={approxLat}
          onChange={(e) => setApproxLat(e.target.value)}
          placeholder="14.69"
          helper="Zone ~500m"
          required
        />
        <Input
          label="Longitude approx."
          type="number"
          step="any"
          value={approxLng}
          onChange={(e) => setApproxLng(e.target.value)}
          placeholder="-17.44"
          helper="Zone ~500m"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Instructions <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          placeholder="Ex : Sonner à l'interphone, bâtiment B…"
          className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]"
        />
      </div>

      <Button type="submit" variant="primary" loading={mutation.isPending}>
        {existing ? 'Mettre à jour' : 'Enregistrer le point de dépôt'}
      </Button>
    </form>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────

interface PickupLocationCardProps {
  bookingId:    number
  isTraveler:   boolean   // true = voyageur (peut éditer), false = expéditeur (lecture)
  bookingStatus: string
}

export function PickupLocationCard({
  bookingId,
  isTraveler,
  bookingStatus,
}: PickupLocationCardProps) {
  const { data: location, isLoading, isError } = useQuery({
    queryKey: ['pickup-location', bookingId],
    queryFn:  () => getPickupLocation(bookingId),
    staleTime: 30_000,
  })

  const canEdit = isTraveler && bookingStatus === 'confirmee'

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Point de dépôt
        </h2>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">Impossible de charger le point de dépôt.</p>
      )}

      {!isLoading && !isError && (
        <>
          {/* Expéditeur */}
          {!isTraveler && (
            !location ? (
              <p className="text-sm text-gray-500 italic">
                Le voyageur n'a pas encore défini de point de dépôt.
              </p>
            ) : (
              <SenderPickupView location={location} />
            )
          )}

          {/* Voyageur */}
          {isTraveler && canEdit && (
            <TravelerPickupForm bookingId={bookingId} existing={location ?? null} />
          )}

          {/* Voyageur — statut != confirmee, lecture seule */}
          {isTraveler && !canEdit && (
            !location ? (
              <p className="text-sm text-gray-500 italic">
                Vous pourrez définir le point de dépôt une fois la réservation confirmée.
              </p>
            ) : (
              <SenderPickupView location={location} />
            )
          )}
        </>
      )}
    </Card>
  )
}