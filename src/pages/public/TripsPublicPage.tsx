import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Plane, ArrowLeft, X, Calendar, MapPin } from 'lucide-react'
import { CityInputInline } from '@/components/ui/CitySelect'
import toast from 'react-hot-toast'

import { getTrips } from '@/api/trips'
import { createBooking } from '@/api/bookings'
import { createLuggage } from '@/api/luggages'
import type { Trip } from '@/types'
import { useAuthStore, isSender, isTraveler } from '@/store/authStore'
import { formatDate, formatAmount } from '@/lib/utils'
import { Button, Card, EmptyState, SkeletonList } from '@/components/ui'

// ─── Booking Modal ─────────────────────────────────────────────────────────

interface BookingModalProps {
  trip:    Trip
  onClose: () => void
}

interface ContentItem {
  category:    string
  description: string
  photo_path:  string | null
}

const LUGGAGE_CATEGORIES = [
  { value: 'document',   label: '📄 Document' },
  { value: 'phone',      label: '📱 Téléphone' },
  { value: 'computer',   label: '💻 Ordinateur' },
  { value: 'clothes',    label: '👕 Vêtements' },
  { value: 'cosmetics',  label: '💄 Cosmétiques' },
  { value: 'medicine',   label: '💊 Médicaments' },
  { value: 'other',      label: '📦 Autre' },
] as const

const DEFAULT_ITEM: ContentItem = { category: 'other', description: '', photo_path: null }

function BookingModal({ trip, onClose }: BookingModalProps) {
  const navigate       = useNavigate()
  const [kgReserved,   setKgReserved]  = useState(1)
  const [comment,      setComment]     = useState('')
  const [items,        setItems]       = useState<ContentItem[]>([{ ...DEFAULT_ITEM }])

  const maxKg      = trip.grams_disponible / 1000
  const pricePerKg = trip.price_per_kg / 100
  const totalCents = Math.round(kgReserved * trip.price_per_kg)

  const updateItem = (index: number, field: keyof ContentItem, value: string | null) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const addItem = () => setItems((prev) => [...prev, { ...DEFAULT_ITEM }])

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Description synthétique = liste des descriptions
  const syntheticDescription = items.map((i) => i.description).filter(Boolean).join(', ')
  // Catégorie principale = catégorie du premier article
  const mainCategory = items[0]?.category ?? 'other'

  const canSubmit = items.every((i) => i.description.trim().length > 0)

  const mutation = useMutation({
    mutationFn: async () => {
      const tripDate     = (trip.date ?? new Date().toISOString()).split('T')[0]
      const deliveryDate = new Date(tripDate)
      deliveryDate.setDate(deliveryDate.getDate() + 1)

      const luggage = await createLuggage({
        trip_id:             trip.id,
        description:         syntheticDescription || 'Colis',
        category:            mainCategory,
        content_items:       items,
        weight_kg:           Math.round(kgReserved * 10),
        length_cm:           40,
        width_cm:            30,
        height_cm:           20,
        pickup_city:         trip.departure,
        delivery_city:       trip.destination,
        pickup_date:         tripDate,
        delivery_date:       deliveryDate.toISOString().split('T')[0],
        is_fragile:          false,
        insurance_requested: false,
      })

      return createBooking({
        trip_id: trip.id,
        items:   [{ luggage_id: luggage.id, kg_reserved: Math.round(kgReserved * 1000) }],
        comment: comment || undefined,
      })
    },
    onSuccess: (booking) => {
      toast.success('Réservation créée avec succès !')
      navigate(`/sender/bookings/${booking.id}`)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Une erreur est survenue'
      toast.error(msg)
    },
  })

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Escape') onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onKeyDown={handleKey} role="dialog" aria-modal aria-labelledby="booking-modal-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg bg-white rounded-[20px] shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 id="booking-modal-title" className="text-base font-semibold text-gray-900">Réserver ce trajet</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
            <span>{trip.departure}</span>
            <Plane className="h-3.5 w-3.5 text-gray-400" aria-hidden />
            <span>{trip.destination}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {trip.date && <span>{formatDate(trip.date)}</span>}
            <span className="text-gray-300" aria-hidden>·</span>
            <span className="font-medium text-gray-700">{pricePerKg.toFixed(2)} €/kg</span>
            <span className="text-gray-300" aria-hidden>·</span>
            <span>{maxKg.toFixed(1)} kg dispo</span>
          </div>
          {trip.pickup_location && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#1B3A6B] bg-[#EBF4FF] rounded-[8px] px-3 py-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>Point de dépôt disponible à <strong>{trip.pickup_location.city}</strong>{trip.pickup_location.revealed && trip.pickup_location.address ? ` — ${trip.pickup_location.address}` : ' (adresse exacte après paiement)'}</span>
            </div>
          )}
          {trip.delivery_location && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#1B3A6B] bg-[#EBF4FF] rounded-[8px] px-3 py-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>Point de remise disponible à <strong>{trip.delivery_location.city}</strong>{trip.delivery_location.revealed && trip.delivery_location.address ? ` — ${trip.delivery_location.address}` : ' (adresse exacte après paiement)'}</span>
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="px-6 py-5 flex flex-col gap-5">

            {/* Poids total */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 select-none">Poids total de l'envoi (kg)</label>
              <div className="flex items-center gap-4">
                <input type="range" min={0.5} max={maxKg} step={0.5} value={kgReserved}
                  onChange={(e) => setKgReserved(Number(e.target.value))}
                  aria-label="Poids réservé en kg"
                  className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                <span className="min-w-[4.5rem] text-center bg-[#EBF4FF] text-[#1B3A6B] font-bold text-sm px-3 py-1.5 rounded-[10px] font-mono">
                  {kgReserved} kg
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400"><span>0.5 kg</span><span>{maxKg.toFixed(1)} kg</span></div>
            </div>

            {/* Contenu du colis */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Contenu du colis <span className="text-red-500" aria-hidden>*</span>
                </label>
                <span className="text-xs text-gray-400">{items.length} article{items.length > 1 ? 's' : ''}</span>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <div key={index} className="relative flex flex-col gap-2 p-3 bg-gray-50 rounded-[12px] border border-gray-200">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Supprimer cet article">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex gap-2 items-center">
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="flex-shrink-0 min-h-[40px] px-3 py-2 rounded-[8px] border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#1B3A6B] transition-all"
                      >
                        {LUGGAGE_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Ex : iPhone 13, vêtements d'hiver…"
                        required
                        className="flex-1 min-h-[40px] px-3 py-2 rounded-[8px] border border-gray-300 text-sm focus:outline-none focus:border-[#1B3A6B] transition-all text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addItem}
                className="flex items-center gap-1.5 self-start text-sm text-[#1B3A6B] font-medium hover:underline">
                <span className="text-lg leading-none">+</span>
                Ajouter un article
              </button>
            </div>

            {/* Commentaire */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="comment" className="text-sm font-medium text-gray-700">
                Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
                rows={2} placeholder="Instructions particulières…"
                className="w-full px-4 py-3 rounded-[10px] border border-gray-300 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] text-gray-900 placeholder-gray-400" />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-[#EBF4FF] rounded-[10px] px-4 py-3">
              <span className="text-sm text-[#1B3A6B] font-medium">Total estimé</span>
              <span className="text-lg font-bold text-[#1B3A6B] font-mono">{formatAmount(totalCents)}</span>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>Annuler</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={mutation.isPending} disabled={!canSubmit}>Confirmer la réservation</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Trip Card ─────────────────────────────────────────────────────────────
interface TripCardProps {
  trip:           Trip
  onBook:         (trip: Trip) => void
  canBook:        boolean
  isLoggedIn:     boolean
  isTravelerUser: boolean
}

function TripCard({ trip, onBook, canBook, isLoggedIn, isTravelerUser }: TripCardProps) {
  const navigate  = useNavigate()
  const kgDispo   = (trip.grams_disponible / 1000).toFixed(1)
  const prixParKg = (trip.price_per_kg / 100).toFixed(2)
  const hasPickup   = !!trip.pickup_location
  const hasDelivery = !!trip.delivery_location
  const traveler    = trip.user

  return (
    <Card as="article" className="flex flex-col gap-4">
      {/* Trajet */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          <span>{trip.departure}</span>
          <Plane className="h-3 w-3 text-gray-400 shrink-0" aria-hidden />
          <span>{trip.destination}</span>
        </div>
        {trip.status?.label && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EBF4FF] text-[#1B3A6B]">
            {trip.status.label}
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-1 text-sm text-gray-500">
        {trip.date && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden />
            {formatDate(trip.date)}
          </span>
        )}
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1B3A6B]">{prixParKg} €/kg</span>
          <span className="text-gray-300" aria-hidden>·</span>
          <span>{kgDispo} kg dispo</span>
        </div>
      </div>

      {/* Badge voyageur */}
      {traveler && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[12px] border border-gray-100">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {traveler.first_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {traveler.first_name} {traveler.last_name?.[0]}.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {traveler.kyc_verified && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200">
                  🛡️ KYC vérifié
                </span>
              )}
              {traveler.trips_count > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-200">
                  📦 {traveler.trips_count} trajet{traveler.trips_count > 1 ? 's' : ''}
                </span>
              )}
              {traveler.member_since && (
                <span className="text-[10px] text-gray-400">
                  Membre {traveler.member_since}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badges pickup/delivery */}
      {(hasPickup || hasDelivery) && (
        <div className="flex flex-col gap-1.5">
          {hasPickup && (
            <div className="flex items-center gap-1.5 text-xs text-[#1B3A6B] bg-[#EBF4FF] rounded-[8px] px-2.5 py-1.5">
              <MapPin className="w-3 h-3 shrink-0" aria-hidden />
              <span>📦 Dépôt à <strong>{trip.pickup_location!.city ?? trip.departure}</strong></span>
            </div>
          )}
          {hasDelivery && (
            <div className="flex items-center gap-1.5 text-xs text-[#1B3A6B] bg-[#EBF4FF] rounded-[8px] px-2.5 py-1.5">
              <MapPin className="w-3 h-3 shrink-0" aria-hidden />
              <span>🎯 Remise à <strong>{trip.delivery_location!.city ?? trip.destination}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {canBook && (
        <Button variant="primary" size="sm" onClick={() => onBook(trip)} className="w-full mt-auto">
          Réserver
        </Button>
      )}

      {!isLoggedIn && (
        <div className="flex flex-col gap-2 mt-auto">
          <button onClick={() => navigate(`/trips/${trip.id}`)}
            className="w-full text-center text-[#1B3A6B] text-sm font-medium hover:underline">
            Voir ce trajet
          </button>
          <Link to="/login"
            className="w-full inline-block text-center bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-medium px-4 py-3 rounded-full transition-colors min-h-[48px] flex items-center justify-center">
            Se connecter pour réserver
          </Link>
        </div>
      )}

      {isLoggedIn && isTravelerUser && (
        <button onClick={() => navigate(`/trips/${trip.id}`)}
          className="w-full text-center text-[#1B3A6B] text-sm font-medium hover:underline mt-auto">
          Voir ce trajet
        </button>
      )}
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TripsPublicPage() {
  const navigate       = useNavigate()
  const user           = useAuthStore((s) => s.user)
  const isLoggedIn     = user !== null
  const canBook        = isLoggedIn && isSender(user!.role)
  const isTravelerUser = isLoggedIn && isTraveler(user!.role)

  const [searchParams] = useSearchParams()
  const [searchDeparture,   setSearchDeparture]   = useState(searchParams.get('departure')   ?? '')
  const [searchDestination, setSearchDestination] = useState(searchParams.get('destination') ?? '')
  const [searchDate,        setSearchDate]        = useState(searchParams.get('date')        ?? '')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const { data: trips, isLoading, isError } = useQuery<Trip[]>({
    queryKey:  ['trips-public'],
    queryFn:   getTrips,
    staleTime: 30_000,
  })

  const filteredTrips = (trips ?? []).filter((trip) => {
    const dep  = searchDeparture.toLowerCase()
    const dest = searchDestination.toLowerCase()
    if (dep  && !trip.departure.toLowerCase().includes(dep))    return false
    if (dest && !trip.destination.toLowerCase().includes(dest)) return false
    if (searchDate && trip.date && !trip.date.startsWith(searchDate)) return false
    return true
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchDeparture)   params.set('departure',   searchDeparture)
    if (searchDestination) params.set('destination', searchDestination)
    if (searchDate)        params.set('date',        searchDate)
    navigate(`/trips?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors min-h-[44px]"
          aria-label="Retour à l'accueil">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour
        </button>
        <Link to="/" aria-label="Accueil Safe Move">
          <img src="/logo-nav-hori.png" alt="Safe Move" className="h-14" />
        </Link>
        {!isLoggedIn ? (
          <Link to="/login" className="text-sm font-medium text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Se connecter
          </Link>
        ) : (
          <Link to={isSender(user!.role) ? '/sender' : '/traveler'}
            className="text-sm font-medium text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Mon espace
          </Link>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trajets disponibles</h1>
          <p className="text-gray-500 mt-2 text-sm">Trouvez un voyageur partant vers votre destination</p>

          <div className="mt-6 bg-white border border-gray-200 rounded-[20px] p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center flex-1 border border-gray-200 rounded-[10px] px-4 bg-gray-50 min-h-[48px]">
              <CityInputInline value={searchDeparture} onChange={setSearchDeparture} placeholder="Ville de départ" />
            </div>
            <div className="flex items-center flex-1 border border-gray-200 rounded-[10px] px-4 bg-gray-50 min-h-[48px]">
              <CityInputInline value={searchDestination} onChange={setSearchDestination} placeholder="Destination" />
            </div>
            <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-[10px] px-4 py-3 bg-gray-50 min-h-[48px]">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
              <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)}
                aria-label="Date de départ" className="bg-transparent text-sm text-gray-700 outline-none w-full" />
            </div>
            <Button variant="primary" onClick={handleSearch} className="sm:self-stretch px-6 rounded-[10px]">
              Rechercher
            </Button>
          </div>

          {(searchDeparture || searchDestination || searchDate) && (
            <button onClick={() => { setSearchDeparture(''); setSearchDestination(''); setSearchDate(''); navigate('/trips') }}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <X className="h-3 w-3" aria-hidden />
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {isLoading && <SkeletonList count={6} />}
        {isError && (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">Impossible de charger les trajets.</p>
            <p className="text-gray-400 text-sm mt-1">Vérifiez votre connexion et réessayez.</p>
          </div>
        )}
        {!isLoading && !isError && filteredTrips.length === 0 && (
          <EmptyState icon={Plane} title="Aucun trajet trouvé"
            description="Aucun trajet ne correspond à votre recherche. Essayez d'autres critères."
            action={<Button variant="secondary" size="sm" onClick={() => { setSearchDeparture(''); setSearchDestination(''); setSearchDate('') }}>Voir tous les trajets</Button>} />
        )}
        {!isLoading && !isError && filteredTrips.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''} disponible{filteredTrips.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onBook={setSelectedTrip}
                  canBook={canBook} isLoggedIn={isLoggedIn} isTravelerUser={isTravelerUser} />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedTrip && <BookingModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
    </div>
  )
}