import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Plane, ArrowLeft, X, Calendar, MapPin, RotateCcw, Search, Shield } from 'lucide-react'
import { CityInputInline } from '@/components/ui/CitySelect'
import toast from 'react-hot-toast'

import { getTrips } from '@/api/trips'
import { createBooking } from '@/api/bookings'
import { createLuggage } from '@/api/luggages'
import type { Trip } from '@/types'
import { useAuthStore, isSender, isTraveler } from '@/store/authStore'
import { formatDate, formatAmount } from '@/lib/utils'
import { Button, EmptyState, SkeletonList } from '@/components/ui'

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0]

// ── Booking Modal ─────────────────────────────────────────────────────────────

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
  { value: 'document',  label: '📄 Document' },
  { value: 'phone',     label: '📱 Téléphone' },
  { value: 'computer',  label: '💻 Ordinateur' },
  { value: 'clothes',   label: '👕 Vêtements' },
  { value: 'cosmetics', label: '💄 Cosmétiques' },
  { value: 'medicine',  label: '💊 Médicaments' },
  { value: 'other',     label: '📦 Autre' },
] as const

const DEFAULT_ITEM: ContentItem = { category: 'other', description: '', photo_path: null }

function BookingModal({ trip, onClose }: BookingModalProps) {
  const navigate     = useNavigate()
  const [kgReserved, setKgReserved] = useState(1)
  const [kgInput,    setKgInput]    = useState('1')
  const [comment,    setComment]    = useState('')
  const [items,      setItems]      = useState<ContentItem[]>([{ ...DEFAULT_ITEM }])

  const [recipientName,  setRecipientName]  = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')

  const maxKg         = trip.grams_disponible / 1000
  const tripCurrency  = trip.currency ?? 'XOF'
  const categoryFees  = trip.category_fees ?? []

  const feesTotal = items.reduce((sum, item) => {
    const fee = categoryFees.find((f) => f.category === item.category)
    return sum + (fee ? fee.fee : 0)
  }, 0)
  const totalCents = Math.round(kgReserved * trip.price_per_kg) + feesTotal

  const handleSliderChange = (val: number) => {
    setKgReserved(val)
    setKgInput(String(val))
  }
  const handleKgInputChange = (raw: string) => {
    setKgInput(raw)
    const num = parseFloat(raw)
    if (!isNaN(num) && num >= 0.5 && num <= maxKg) {
      setKgReserved(Math.round(num * 2) / 2)
    }
  }

  const updateItem = (index: number, field: keyof ContentItem, value: string | null) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }
  const addItem    = () => setItems(prev => [...prev, { ...DEFAULT_ITEM }])
  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const syntheticDescription = items.map(i => i.description).filter(Boolean).join(', ')
  const mainCategory         = items[0]?.category ?? 'other'

  const canSubmit = items.every(i => i.description.trim().length > 0)
    && recipientName.trim().length > 0
    && recipientPhone.trim().length > 0
    && recipientEmail.includes('@')

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
        trip_id:         trip.id,
        items:           [{ luggage_id: luggage.id, kg_reserved: Math.round(kgReserved * 1000) }],
        comment:         comment || undefined,
        recipient_name:  recipientName,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
      })
    },
    onSuccess: (booking) => {
      toast.success('Réservation créée ! Procédez au paiement.')
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative w-full max-w-lg bg-white rounded-[22px] overflow-hidden max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(15,23,42,0.25)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="booking-modal-title" className="text-base font-black text-slate-900">Réserver ce trajet</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Trip summary */}
        <div
          className="px-6 py-4 shrink-0 text-white"
          style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1B3A6B 100%)' }}
        >
          <div className="flex items-center gap-2 font-black mb-1.5">
            <span>{trip.departure}</span>
            <Plane className="h-3.5 w-3.5 text-white/50" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
            {trip.date && <span>{formatDate(trip.date)}</span>}
            <span aria-hidden>·</span>
            <span className="font-bold text-white">{formatAmount(trip.price_per_kg, tripCurrency)}/kg</span>
            <span aria-hidden>·</span>
            <span>{maxKg.toFixed(1)} kg dispo</span>
          </div>
          {trip.pickup_location && (
            <div className="mt-3 flex items-center gap-1.5 text-xs bg-white/10 border border-white/15 rounded-[10px] px-3 py-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Dépôt à <strong>{trip.pickup_location.city}</strong>{trip.pickup_location.revealed && trip.pickup_location.address ? ` — ${trip.pickup_location.address}` : ' (adresse exacte après paiement)'}</span>
            </div>
          )}
          {trip.delivery_location && (
            <div className="mt-2 flex items-center gap-1.5 text-xs bg-white/10 border border-white/15 rounded-[10px] px-3 py-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Remise à <strong>{trip.delivery_location.city}</strong>{trip.delivery_location.revealed && trip.delivery_location.address ? ` — ${trip.delivery_location.address}` : ' (adresse exacte après paiement)'}</span>
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="px-6 py-5 flex flex-col gap-5">

            {/* Poids */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 select-none">Poids total de l'envoi (kg)</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0.5} max={maxKg} step={0.5} value={kgReserved}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  aria-label="Poids réservé en kg"
                  className="flex-1 h-2 rounded-full accent-[#1B3A6B] cursor-pointer" />
                <input
                  type="number" min={0.5} max={maxKg} step={0.5}
                  value={kgInput}
                  onChange={(e) => handleKgInputChange(e.target.value)}
                  aria-label="Saisir le poids en kg"
                  className="w-20 text-center bg-[#EBF4FF] text-[#1B3A6B] font-black text-sm px-2 py-1.5 rounded-[10px] font-mono border border-[#1B3A6B]/20 focus:outline-none focus:border-[#1B3A6B]"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400"><span>0.5 kg</span><span>{maxKg.toFixed(1)} kg</span></div>
            </div>

            {/* Contenu du colis */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">
                  Contenu du colis <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-medium">{items.length} article{items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <div key={index} className="relative flex flex-col gap-2 p-3 bg-slate-50 rounded-[14px] border border-slate-100">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Supprimer cet article">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex gap-2 items-center">
                      <select value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="shrink-0 min-h-[40px] px-3 py-2 rounded-[10px] border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#1B3A6B] transition-all">
                        {LUGGAGE_CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <input type="text" value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Ex : iPhone 13, vêtements d'hiver…"
                        required
                        className="flex-1 min-h-[40px] px-3 py-2 rounded-[10px] border border-slate-200 text-sm focus:outline-none focus:border-[#1B3A6B] transition-all text-slate-900 placeholder-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1.5 self-start text-sm text-[#1B3A6B] font-bold hover:underline">
                <span className="text-lg leading-none">+</span>
                Ajouter un article
              </button>
            </div>

            {/* Destinataire */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Destinataire <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  La personne qui récupère le colis à destination recevra un QR code et un code secret.
                </p>
              </div>
              <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nom complet du destinataire" required
                className="w-full min-h-[40px] px-3 py-2 rounded-[10px] border border-slate-200 text-sm focus:outline-none focus:border-[#1B3A6B] text-slate-900 placeholder-slate-400" />
              <input type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Téléphone du destinataire (ex: +221771234567)" required
                className="w-full min-h-[40px] px-3 py-2 rounded-[10px] border border-slate-200 text-sm focus:outline-none focus:border-[#1B3A6B] text-slate-900 placeholder-slate-400" />
              <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Email du destinataire" required
                className="w-full min-h-[40px] px-3 py-2 rounded-[10px] border border-slate-200 text-sm focus:outline-none focus:border-[#1B3A6B] text-slate-900 placeholder-slate-400" />
            </div>

            {/* Commentaire */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="comment" className="text-sm font-bold text-slate-700">
                Commentaire <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
                rows={2} placeholder="Instructions particulières…"
                className="w-full px-4 py-3 rounded-[12px] border border-slate-200 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/15 text-slate-900 placeholder-slate-400" />
            </div>

            {/* Devis détaillé */}
            <div className="bg-[#EBF4FF] rounded-[14px] px-4 py-4 flex flex-col gap-2 border border-[#1B3A6B]/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1B3A6B]/80 font-medium">
                  {kgReserved} kg × {formatAmount(trip.price_per_kg, tripCurrency)}
                </span>
                <span className="font-mono font-bold text-[#1B3A6B]">
                  {formatAmount(Math.round(kgReserved * trip.price_per_kg), tripCurrency)}
                </span>
              </div>

              {feesTotal > 0 && (() => {
                const feeLines: Array<{ icon: string; label: string; count: number; fee: number }> = []
                items.forEach((item) => {
                  const feeDef = categoryFees.find((f) => f.category === item.category)
                  if (!feeDef) return
                  const existing = feeLines.find((l) => l.label === (feeDef as any).category_label)
                  if (existing) { existing.count++; existing.fee += feeDef.fee }
                  else feeLines.push({
                    icon:  (feeDef as any).category_icon ?? '📦',
                    label: (feeDef as any).category_label ?? feeDef.category,
                    count: 1,
                    fee:   feeDef.fee,
                  })
                })
                return (
                  <>
                    <p className="text-xs font-bold text-[#1B3A6B]/60 mt-1 uppercase tracking-widest">
                      Articles spéciaux
                    </p>
                    {feeLines.map(line => (
                      <div key={line.label} className="flex items-center justify-between text-sm">
                        <span className="text-[#1B3A6B]/80 font-medium">
                          {line.icon} {line.label}{line.count > 1 ? ` ×${line.count}` : ''}
                        </span>
                        <span className="font-mono font-bold text-[#1B3A6B]">
                          +{formatAmount(line.fee, tripCurrency)}
                        </span>
                      </div>
                    ))}
                  </>
                )
              })()}

              <div className="border-t border-[#1B3A6B]/15 mt-1 pt-2.5 flex items-center justify-between">
                <span className="text-sm font-black text-[#1B3A6B]">TOTAL</span>
                <span className="text-lg font-black text-[#1B3A6B] font-mono">
                  {formatAmount(totalCents, tripCurrency)}
                </span>
              </div>
            </div>

            {/* Garanties */}
            <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3.5">
              <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Inclus avec SafeMove
              </p>
              <ul className="flex flex-col gap-1.5">
                {[
                  "Paiement bloqué jusqu'à la livraison confirmée",
                  'Voyageur vérifié (KYC)',
                  'Code secret + QR de remise',
                  'Assistance en cas de litige',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-emerald-800">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" className="flex-1" loading={mutation.isPending} disabled={!canSubmit}>
                Réserver et payer en sécurité 🔒
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Trip Card ─────────────────────────────────────────────────────────────────

interface TripCardProps {
  trip:           Trip
  onBook:         (trip: Trip) => void
  canBook:        boolean
  isLoggedIn:     boolean
  isTravelerUser: boolean
}

function TripCard({ trip, onBook, canBook, isLoggedIn, isTravelerUser }: TripCardProps) {
  const navigate      = useNavigate()
  const kgDispo        = (trip.grams_disponible / 1000).toFixed(1)
  const tripCurrency   = (trip as any).currency ?? 'XOF'
  const hasPickup      = !!trip.pickup_location
  const hasDelivery    = !!trip.delivery_location
  const traveler       = trip.user

  return (
    <div
      className="bg-white border border-slate-100 rounded-[18px] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-2"
        style={{ background: 'linear-gradient(135deg, #0f2544 0%, #1B3A6B 100%)' }}
      >
        <div className="flex items-center gap-2 font-bold text-white text-sm min-w-0">
          <span className="truncate">{trip.departure}</span>
          <Plane className="h-3.5 w-3.5 text-white/50 shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </div>
        {trip.status?.label && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 shrink-0">
            {trip.status.label}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1 text-sm text-slate-500">
          {trip.date && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(trip.date)}
            </span>
          )}
          <div className="flex items-end justify-between mt-1">
            <div>
              <span className="text-xl font-black text-[#1B3A6B]">
                {formatAmount(trip.price_per_kg, tripCurrency)}
              </span>
              <span className="text-sm text-slate-400 font-semibold ml-1">/kg</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{kgDispo} kg dispo</span>
          </div>
        </div>

        {traveler && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[12px] border border-slate-100">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}
            >
              {traveler.first_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {traveler.first_name} {traveler.last_name?.[0]}.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {traveler.kyc_verified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    🛡️ KYC
                  </span>
                )}
                {traveler.trips_count > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
                    📦 {traveler.trips_count}
                  </span>
                )}
                {traveler.member_since && (
                  <span className="text-[10px] text-slate-400">Membre {traveler.member_since}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {(hasPickup || hasDelivery) && (
          <div className="flex flex-col gap-1.5">
            {hasPickup && (
              <div className="flex items-center gap-1.5 text-xs text-[#1B3A6B] bg-[#EBF4FF] rounded-[10px] px-2.5 py-1.5 border border-[#1B3A6B]/8">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>📦 Dépôt à <strong>{trip.pickup_location!.city ?? trip.departure}</strong></span>
              </div>
            )}
            {hasDelivery && (
              <div className="flex items-center gap-1.5 text-xs text-[#1B3A6B] bg-[#EBF4FF] rounded-[10px] px-2.5 py-1.5 border border-[#1B3A6B]/8">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>🎯 Remise à <strong>{trip.delivery_location!.city ?? trip.destination}</strong></span>
              </div>
            )}
          </div>
        )}

        {canBook && (
          <button
            onClick={() => onBook(trip)}
            className="w-full bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold py-3 rounded-full transition-all duration-200 mt-auto min-h-[48px]"
          >
            Réserver
          </button>
        )}

        {!isLoggedIn && (
          <div className="flex flex-col gap-2 mt-auto">
            <button onClick={() => navigate(`/trips/${trip.id}`)}
              className="w-full text-center text-[#1B3A6B] text-sm font-bold hover:underline">
              Voir ce trajet
            </button>
            <Link to="/login"
              className="w-full inline-flex items-center justify-center bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold px-4 py-3 rounded-full transition-all duration-200 min-h-[48px]">
              Se connecter pour réserver
            </Link>
          </div>
        )}

        {isLoggedIn && isTravelerUser && (
          <button onClick={() => navigate(`/trips/${trip.id}`)}
            className="w-full text-center text-[#1B3A6B] text-sm font-bold hover:underline mt-auto">
            Voir ce trajet
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

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

  const hasFilters = !!(searchDeparture || searchDestination || searchDate)

  const resetFilters = () => {
    setSearchDeparture('')
    setSearchDestination('')
    setSearchDate('')
    navigate('/trips')
  }

  const { data: trips, isLoading, isError } = useQuery<Trip[]>({
    queryKey:  ['trips-public', searchDeparture, searchDestination, searchDate],
    queryFn:   () => getTrips({
      departure:   searchDeparture   || undefined,
      destination: searchDestination || undefined,
      date:        searchDate        || undefined,
    }),
    staleTime: 30_000,
  })

  const displayTrips = trips ?? []

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchDeparture)   params.set('departure',   searchDeparture)
    if (searchDestination) params.set('destination', searchDestination)
    if (searchDate)        params.set('date',        searchDate)
    navigate(`/trips?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#1B3A6B] transition-colors min-h-[44px] font-medium"
          aria-label="Retour à l'accueil">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <Link to="/" aria-label="Accueil Safe Move">
          <img src="/logo-nav-hori.png" alt="Safe Move" className="h-10" />
        </Link>
        {!isLoggedIn ? (
          <Link to="/login" className="text-sm font-bold text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Se connecter
          </Link>
        ) : (
          <Link to={isSender(user!.role) ? '/sender' : '/traveler'}
            className="text-sm font-bold text-[#1B3A6B] hover:underline min-h-[44px] flex items-center">
            Mon espace
          </Link>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Hero search */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Trajets disponibles</h1>
          <p className="text-slate-500 mt-2 text-sm">Trouvez un voyageur partant vers votre destination</p>

          <div className="mt-6 bg-white border border-slate-200 rounded-[20px] p-4 flex flex-col sm:flex-row gap-3"
            style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
            <div className="flex items-center flex-1 border border-slate-200 rounded-[12px] px-4 bg-slate-50 min-h-[48px]">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <CityInputInline value={searchDeparture} onChange={setSearchDeparture} placeholder="Ville de départ" />
            </div>
            <div className="flex items-center flex-1 border border-slate-200 rounded-[12px] px-4 bg-slate-50 min-h-[48px]">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <CityInputInline value={searchDestination} onChange={setSearchDestination} placeholder="Destination" />
            </div>
            <div className="flex items-center gap-2 flex-1 border border-slate-200 rounded-[12px] px-4 py-3 bg-slate-50 min-h-[48px]">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)}
                min={today}
                aria-label="Date de départ" className="bg-transparent text-sm text-slate-700 outline-none w-full" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#1B3A6B] hover:bg-[#2351a0] text-white font-bold px-7 py-3 rounded-full text-sm transition-all duration-200 flex items-center gap-2 justify-center shadow-sm hover:shadow-md min-h-[48px] shrink-0"
            >
              <Search className="w-4 h-4" /> Rechercher
            </button>
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#2351a0] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {isLoading && <SkeletonList count={6} />}

        {isError && (
          <div className="text-center py-16">
            <p className="text-red-500 font-bold">Impossible de charger les trajets.</p>
            <p className="text-slate-400 text-sm mt-1">Vérifiez votre connexion et réessayez.</p>
          </div>
        )}

        {!isLoading && !isError && displayTrips.length === 0 && (
          <EmptyState icon={Plane} title="Aucun trajet trouvé"
            description="Aucun trajet ne correspond à votre recherche. Essayez d'autres critères."
            action={<Button variant="secondary" size="sm" onClick={resetFilters}>Voir tous les trajets</Button>} />
        )}

        {!isLoading && !isError && displayTrips.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-4 font-medium">
              {displayTrips.length} trajet{displayTrips.length > 1 ? 's' : ''} disponible{displayTrips.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayTrips.map(trip => (
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