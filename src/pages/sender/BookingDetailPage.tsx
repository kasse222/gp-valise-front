import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, AlertCircle, ShieldCheck, ShieldAlert,
  ExternalLink, X, MapPin, Home, MessageSquare, Upload, Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button, Card, Spinner, StatusBadge, CountdownTimer, ConfirmModal } from '@/components/ui'
import type { BookingStatusCode } from '@/components/ui/Badge'
import { useBooking } from '@/hooks/useBooking'
import { useTransactions } from '@/hooks/useTransactions'
import { payBooking } from '@/api/bookings'
import { formatAmount, formatDate } from '@/lib/utils'
import { useAuthStore, isTraveler } from '@/store/authStore'
import { PickupLocationCard } from '@/components/ui/PickupLocationCard'
import client from '@/api/client'
import type { PickupLocation } from '@/types'
import { uploadFile } from '@/api/kyc'

// ─── LuggagePhotoUpload ────────────────────────────────────────────────────

function LuggagePhotoUpload({
  luggageId, trackingId, existingPhotoPath,
}: {
  luggageId: number; trackingId: string | null; existingPhotoPath: string | null
}) {
  const inputRef                  = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded,  setUploaded]  = useState(!!existingPhotoPath)
  const [fileName,  setFileName]  = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = await uploadFile(file, 'luggage')
      await client.put(`/luggages/${luggageId}`, { photo_path: path })
      setUploaded(true)
      setFileName(file.name)
      toast.success('Photo ajoutée.')
    } catch {
      toast.error("Erreur lors de l'upload.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-gray-600 truncate">
        Colis : <span className="font-mono text-gray-500">{trackingId ?? `#${luggageId}`}</span>
      </p>
      <div
        className={`relative flex items-center justify-center gap-2 min-h-[72px] rounded-[10px] border-2 border-dashed transition-colors cursor-pointer
          ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:border-[#1B3A6B] hover:bg-[#EBF4FF]'}`}
        onClick={() => inputRef.current?.click()}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden"
          onChange={handleChange} disabled={uploading} />
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
            Upload…
          </div>
        ) : uploaded ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <span>✅</span>
            <span className="font-medium truncate max-w-[200px]">{fileName ?? 'Photo ajoutée'}</span>
            <span className="text-xs text-emerald-500 cursor-pointer hover:underline"
              onClick={(e) => { e.stopPropagation(); setUploaded(false) }}>Modifier</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Upload className="w-4 h-4 text-gray-400" aria-hidden />
            <span>Ajouter une photo JPG/PNG</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ApproxMap ─────────────────────────────────────────────────────────────

function ApproxMap({ lat, lng }: { lat: number; lng: number }) {
  const mapRef  = useRef<HTMLDivElement>(null)
  const mapInst = useRef<unknown>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) { setReady(true); return }
    const link  = document.createElement('link')
    link.rel    = 'stylesheet'
    link.href   = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)
    const script  = document.createElement('script')
    script.src    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current || mapInst.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L   = (window as any).L
    const map = L.map(mapRef.current, { zoomControl: true, dragging: true, scrollWheelZoom: false })
      .setView([lat, lng], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map)
    L.circle([lat, lng], {
      radius: 500, color: '#1B3A6B', fillColor: '#EBF4FF',
      fillOpacity: 0.4, weight: 2, dashArray: '6 4',
    }).addTo(map)
    mapInst.current = map
    setTimeout(() => map.invalidateSize(), 100)
    return () => { map.remove(); mapInst.current = null }
  }, [ready, lat, lng])

  return (
    <div className="relative rounded-[10px] overflow-hidden border border-gray-200 mt-2">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <p className="text-xs text-gray-500">Chargement de la carte…</p>
        </div>
      )}
      <div ref={mapRef} style={{ height: '200px', width: '100%' }} />
    </div>
  )
}

// ─── LocationRevealCard ────────────────────────────────────────────────────

function LocationRevealCard({ label, icon: Icon, location, isConfirmed }: {
  label: string
  icon:  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  location:    PickupLocation | null | undefined
  isConfirmed: boolean
}) {
  if (!location) return null

  const mapsUrl = location.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address + ', ' + (location.city ?? ''))}`
    : location.approximate_latitude
      ? `https://www.google.com/maps?q=${location.approximate_latitude},${location.approximate_longitude}`
      : null

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</h2>
      </div>
      {isConfirmed && location.revealed ? (
        <div className="flex flex-col gap-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] p-3 text-sm">
            <p className="text-xs text-emerald-700 font-medium mb-1.5">✅ Adresse confirmée</p>
            {mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="font-medium text-[#1B3A6B] hover:underline flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {location.address ?? `${location.latitude}, ${location.longitude}`}
              </a>
            ) : (
              <p className="font-medium text-gray-900">{location.address}</p>
            )}
            {location.city && <p className="text-gray-500 text-xs mt-0.5 ml-5">{location.city}</p>}
            {location.instructions && <p className="text-xs text-gray-500 mt-1.5 ml-5">ℹ️ {location.instructions}</p>}
          </div>
          {location.latitude && location.longitude && (
            <ApproxMap lat={Number(location.latitude)} lng={Number(location.longitude)} />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {location.approximate_latitude ? (
            <>
              <div className="bg-[#EBF4FF] rounded-[10px] p-3 text-sm">
                <p className="text-xs text-[#1B3A6B] font-medium mb-1">📍 Zone approximative (~500m)</p>
                <p className="text-gray-600 text-xs">Ville : <span className="font-medium text-gray-900">{location.city}</span></p>
                <p className="text-xs text-gray-400 mt-1.5">L'adresse exacte sera révélée après confirmation du paiement.</p>
              </div>
              <ApproxMap lat={Number(location.approximate_latitude)} lng={Number(location.approximate_longitude)} />
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Point de dépôt non défini par le voyageur.</p>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── InfoBanner ────────────────────────────────────────────────────────────

function InfoBanner({ color, icon: Icon, children }: {
  color: 'amber' | 'blue' | 'red' | 'green'
  icon:  React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  const styles = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    blue:  'bg-blue-50 border-blue-200 text-blue-800',
    red:   'bg-red-50 border-red-200 text-red-800',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  }
  return (
    <div className={`p-4 rounded-[14px] border flex items-start gap-3 mb-4 ${styles[color]}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 text-sm">{children}</div>
    </div>
  )
}

// ─── KycRequiredDialog ─────────────────────────────────────────────────────

function KycRequiredDialog({ bookingId, onClose }: { bookingId: number; onClose: () => void }) {
  const navigate = useNavigate()
  const handleGoKyc = () => {
    sessionStorage.setItem('pendingPaymentBookingId', String(bookingId))
    navigate('/sender/profile', { state: { kycRequired: true } })
  }
  return (
    <div role="dialog" aria-modal aria-labelledby="kyc-dialog-title"
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" aria-hidden />
            </div>
            <h2 id="kyc-dialog-title" className="text-base font-semibold text-gray-900">
              Vérification d'identité requise
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <p>Pour effectuer un paiement sur Safe Move, votre identité doit être vérifiée (KYC).</p>
          <p>Cette étape est obligatoire pour garantir la sécurité des transactions.</p>
          <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-[10px] text-amber-800 text-xs">
            📋 Vous aurez besoin d'une pièce d'identité valide (CNI, passeport ou titre de séjour).
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Plus tard</Button>
          <Button variant="primary" className="flex-1" onClick={handleGoKyc}>Vérifier mon identité</Button>
        </div>
      </div>
    </div>
  )
}

// ─── DisputeModal ──────────────────────────────────────────────────────────

function DisputeModal({ bookingId, onClose }: { bookingId: number; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const hasEnough = reason.trim().length >= 10

  const mutation = useMutation({
    mutationFn: () => client.post(`/bookings/${bookingId}/dispute`, { reason: reason.trim() }),
    onSuccess: () => {
      toast.success('Litige ouvert.')
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      onClose()
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Une erreur est survenue.')
    },
  })

  return (
    <div role="dialog" aria-modal aria-labelledby="dispute-title"
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-lg p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 id="dispute-title" className="text-base font-semibold text-gray-900">Ouvrir un litige</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dispute-reason" className="text-sm font-medium text-gray-700">
            Motif du litige <span className="text-red-500" aria-hidden>*</span>
          </label>
          <textarea id="dispute-reason" value={reason} onChange={(e) => setReason(e.target.value)}
            rows={4} placeholder="Décrivez le problème rencontré (minimum 10 caractères)…"
            className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]" />
          <p className="text-xs text-gray-400">{reason.trim().length} / 10 caractères minimum</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>Annuler</Button>
          <Button variant="danger" className="flex-1" onClick={() => mutation.mutate()}
            loading={mutation.isPending} disabled={!hasEnough}>Ouvrir le litige</Button>
        </div>
      </div>
    </div>
  )
}

// ─── TravelerBadge ─────────────────────────────────────────────────────────

function TravelerBadge({ user }: {
  user: { first_name: string; last_name?: string | null; kyc_verified?: boolean; trips_count?: number; member_since?: string }
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[12px] border border-gray-100">
      <div className="w-9 h-9 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold shrink-0">
        {user.first_name?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {user.first_name} {user.last_name?.[0]}.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {user.kyc_verified && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200">
              🛡️ KYC vérifié
            </span>
          )}
          {(user.trips_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-200">
              📦 {user.trips_count} trajet{(user.trips_count ?? 0) > 1 ? 's' : ''}
            </span>
          )}
          {user.member_since && (
            <span className="text-[10px] text-gray-400">Membre {user.member_since}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const bookingId   = Number(id)
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const userRole       = useAuthStore((s) => s.user?.role)
  const isTravelerUser = userRole !== undefined && isTraveler(userRole)
  const userCountry    = useAuthStore((s) => s.user?.country) ?? 'SN'
  const paymentSectionRef = useRef<HTMLDivElement>(null)

  const [phone,         setPhone]         = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money')
  const [showCancel,    setShowCancel]    = useState(false)
  const [showDispute,   setShowDispute]   = useState(false)
  const [showKyc,       setShowKyc]       = useState(false)

  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)
  const { data: allTransactions, isError: isTxError, error: txError } = useTransactions()

  const payMutation = useMutation({
    mutationFn: async () => {
      const toastId = toast.loading('Préparation du paiement...')
      try {
        const result = await payBooking(bookingId, {
          method:  paymentMethod,
          phone:   paymentMethod === 'mobile_money' ? phone || undefined : undefined,
          country: userCountry,
        })
        toast.dismiss(toastId)
        return result
      } catch (err) {
        toast.dismiss(toastId)
        throw err
      }
    },
    onSuccess: (data) => {
      if (data.payment_url) { window.location.href = data.payment_url; return }
      toast.success('Paiement effectué !')
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
    },
    onError: (err: AxiosError<{ message?: string; kyc_required?: boolean }>) => {
      if (err.response?.data?.kyc_required) { setShowKyc(true); return }
      toast.error(err.response?.data?.message ?? 'Une erreur est survenue')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => client.post(`/bookings/${bookingId}/cancel`),
    onSuccess: () => {
      toast.success('Réservation annulée.')
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setShowCancel(false)
      navigate('/sender/bookings')
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? "Impossible d'annuler.")
      setShowCancel(false)
    },
  })

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (isError || !booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement de la réservation.</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const status          = booking.status as BookingStatusCode
  const transactions    = (allTransactions ?? []).filter((tx) => tx.booking_id === bookingId)
  const is403           = isTxError && (txError as AxiosError)?.response?.status === 403
  const kgDisplay       = (booking.kg_reserved / 1000).toFixed(1) + ' kg'
  const tripDate        = booking.trip?.date ? booking.trip.date.split('-').reverse().join('/') : null
  const totalAmount     = booking.items.reduce((sum, item) => sum + item.price, 0)
  const chargeCompleted = transactions.find((tx) => tx.type?.code === 'CHARGE' && tx.status?.code === 'COMPLETED')
  const refundCompleted = transactions.find((tx) => tx.type?.code === 'REFUND'  && tx.status?.code === 'COMPLETED')
  const amountPaid      = chargeCompleted?.amount ?? 0
  const amountRefunded  = refundCompleted?.amount  ?? 0

  // F-030 — devise depuis la transaction confirmée.
  // Priorité : charge.currency.code (réelle) → pays user → XOF (corridor Africa par défaut)
  const bookingCurrency: string =
    chargeCompleted?.currency?.code ??
    (userCountry === 'MA' ? 'MAD' : userCountry === 'FR' || userCountry === 'BE' ? 'EUR' : 'XOF')

  const isPendingPayment = status === 'en_paiement'
  const isConfirmed      = ['confirmee', 'livree', 'termine'].includes(status)
  const isExpired        = status === 'expiree'
  const isCancellable    = isPendingPayment
  const canOpenDispute   = status === 'confirmee' || status === 'livree'
  const isPhoneRequired  = paymentMethod === 'mobile_money'
  const isPayDisabled    = payMutation.isPending || (isPhoneRequired && !phone.trim())

  const traveler = booking.trip?.user

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      <Link to="/sender/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Mes réservations
      </Link>

      {/* Hero */}
      <div className="bg-[#1B3A6B] rounded-[20px] px-6 py-6 mb-6 text-white flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Réservation #{booking.id}</h1>
          <p className="text-white/70 text-sm mt-1">{formatDate(booking.created_at)}</p>
        </div>
        <StatusBadge code={status} />
      </div>

      {isExpired && (
        <InfoBanner color="amber" icon={AlertCircle}>
          Le délai de paiement a expiré. Vous pouvez créer une nouvelle réservation.
        </InfoBanner>
      )}

      {status === 'declined_by_traveler' && (
        <InfoBanner color="red" icon={AlertCircle}>
          <p className="font-semibold">Réservation refusée par le voyageur</p>
          <button onClick={() => navigate('/trips')}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline">
            <Search className="w-3 h-3" aria-hidden />
            Rechercher un autre trajet
          </button>
        </InfoBanner>
      )}

      {/* Trajet */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trajet</h2>
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <span>{booking.trip?.departure ?? '—'}</span>
          <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden />
          <span>{booking.trip?.destination ?? '—'}</span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {tripDate && (
            <div><dt className="text-gray-500">Date du trajet</dt><dd className="font-medium text-gray-900 mt-0.5">{tripDate}</dd></div>
          )}
          <div><dt className="text-gray-500">Poids réservé</dt><dd className="font-medium text-gray-900 mt-0.5">{kgDisplay}</dd></div>
          {booking.comment && (
            <div className="col-span-2"><dt className="text-gray-500">Commentaire</dt><dd className="font-medium text-gray-900 mt-0.5">{booking.comment}</dd></div>
          )}
        </dl>
        {traveler && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Voyageur</p>
            <TravelerBadge user={traveler} />
          </div>
        )}
        <div className="mt-4">
          <Link to={`/trips/${booking.trip_id}`}
            className="inline-flex items-center gap-1 text-xs text-[#1B3A6B] hover:underline">
            Voir le détail du trajet <ExternalLink className="w-3 h-3" aria-hidden />
          </Link>
        </div>
      </Card>

      {/* Items réservés */}
      {booking.items.length > 0 && (
        <Card className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items réservés</h2>
          <div className="divide-y divide-gray-100">
            {booking.items.map((item) => {
              const CATEGORY_EMOJI: Record<string, string> = {
                document: '📄', phone: '📱', computer: '💻',
                clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
              }
              return (
                <div key={item.id} className="flex flex-col py-2.5 gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.luggage?.description ?? `Colis #${item.id}`}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {item.luggage?.tracking_id?.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">⚖️ {(item.kg_reserved / 1000).toFixed(1)} kg</p>
                    </div>
                    {/* F-030 — devise réelle, pas EUR hardcodé */}
                    <span className="font-medium text-gray-900 font-mono shrink-0 ml-4">
                      {formatAmount(item.price, bookingCurrency)}
                    </span>
                  </div>
                  {item.luggage?.content_items && item.luggage.content_items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.luggage.content_items.map((ci, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#EBF4FF] text-[#1B3A6B] font-medium">
                          {CATEGORY_EMOJI[ci.category] ?? '📦'} {ci.description}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.luggage?.tracking_id && (
                    <Link to={`/track/${item.luggage.tracking_id}`}
                      className="inline-flex items-center gap-2 self-start px-3 py-1.5 bg-[#EBF4FF] hover:bg-[#1B3A6B] hover:text-white text-[#1B3A6B] text-xs font-semibold rounded-[8px] transition-colors">
                      <MapPin className="w-3.5 h-3.5" aria-hidden />
                      Suivre ce colis
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Photo colis */}
      {isPendingPayment && booking.items.some((item) => item.luggage) && (
        <Card className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📸 Photo du colis</h2>
          <p className="text-xs text-gray-400 mb-4">Ajoutez une photo avant le paiement.</p>
          <div className="flex flex-col gap-4">
            {booking.items.map((item) => item.luggage && (
              <LuggagePhotoUpload key={item.id} luggageId={item.luggage_id}
                trackingId={item.luggage.tracking_id} existingPhotoPath={item.luggage.photo_path} />
            ))}
          </div>
        </Card>
      )}

      {/* Locations */}
      <LocationRevealCard label="📦 Point de dépôt colis" icon={MapPin}
        location={booking.trip?.pickup_location} isConfirmed={isConfirmed} />
      <LocationRevealCard label="🎯 Point de remise colis" icon={Home}
        location={booking.trip?.delivery_location} isConfirmed={isConfirmed} />

      {isTravelerUser && (
        <PickupLocationCard bookingId={bookingId} isTraveler={isTravelerUser} bookingStatus={status} />
      )}

      {/* Récapitulatif financier */}
      {isConfirmed && amountPaid > 0 && (
        <Card className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Récapitulatif financier</h2>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-600">Montant payé</span>
            {/* F-030 — devise réelle */}
            <span className="font-medium text-gray-900 font-mono">{formatAmount(amountPaid, bookingCurrency)}</span>
          </div>
          {amountRefunded > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-600">Remboursé</span>
              <span className="font-medium text-red-600 font-mono">-{formatAmount(amountRefunded, bookingCurrency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm py-2 border-t border-gray-100 mt-2">
            <span className="font-semibold text-gray-900">Total net</span>
            <span className="font-bold text-gray-900 font-mono">
              {formatAmount(amountPaid - amountRefunded, bookingCurrency)}
            </span>
          </div>
        </Card>
      )}

      {/* Paiement */}
      {isPendingPayment && (
        <div ref={paymentSectionRef}>
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Paiement</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">Montant total</span>
              {/* F-030 — devise réelle (avant charge, on utilise le fallback pays) */}
              <span className="text-lg font-bold text-gray-900 font-mono">
                {formatAmount(totalAmount, bookingCurrency)}
              </span>
            </div>
            {booking.payment_expires_at && (
              <div className="mb-4">
                <CountdownTimer expiresAt={booking.payment_expires_at}
                  onExpired={() => queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['mobile_money', 'card'] as const).map((method) => (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  aria-pressed={paymentMethod === method}
                  className={`py-2.5 px-3 rounded-[10px] border text-sm font-medium transition-all min-h-[48px] ${
                    paymentMethod === method ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white' : 'border-gray-300 text-gray-700 hover:border-[#1B3A6B]'
                  }`}>
                  {method === 'mobile_money' ? '📱 Mobile Money' : '💳 Carte bancaire'}
                </button>
              ))}
            </div>
            {paymentMethod === 'mobile_money' && (
              <input type="tel" placeholder="+221 77 000 00 00" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-[10px] px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#1B3A6B] min-h-[48px]" />
            )}
            <Button variant="primary" className="w-full" loading={payMutation.isPending}
              disabled={isPayDisabled} onClick={() => payMutation.mutate()}>
              Payer maintenant
            </Button>
            <div className="mt-3 text-center">
              <img src="/paydunya-badge.png" alt="Moyens de paiement acceptés"
                className="mx-auto max-w-full h-10 object-contain opacity-80" loading="lazy" />
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-2">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                Paiement sécurisé via Safe Move
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Transactions */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Transactions</h2>
        {is403 ? (
          <div className="flex items-center gap-2 text-sm text-amber-600 py-1">
            <AlertCircle className="w-4 h-4" aria-hidden />
            Vérification email requise pour accéder aux transactions.
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">
            {isPendingPayment ? 'Aucun paiement initié pour le moment.' : 'Aucune transaction.'}
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{tx.type.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.status.label}</p>
                </div>
                {/* Déjà correct — utilise tx.currency.code */}
                <span className="font-medium text-gray-900 font-mono">{formatAmount(tx.amount, tx.currency.code)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Historique */}
      {booking.status_history.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historique</h2>
          <ol className="space-y-3">
            {booking.status_history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#1B3A6B] flex-shrink-0" aria-hidden />
                <div>
                  <p className="text-gray-900">
                    {entry.old_label && <span className="text-gray-500">{entry.old_label} → </span>}
                    <span className="font-medium">{entry.new_label}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.changed_at)}</p>
                  {entry.reason && <p className="text-xs text-gray-500 mt-0.5">{entry.reason}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        {isCancellable && (
          <Button variant="secondary" onClick={() => setShowCancel(true)}>Annuler la réservation</Button>
        )}
        {canOpenDispute && (
          <Button variant="danger" onClick={() => setShowDispute(true)}>Ouvrir un litige</Button>
        )}
      </div>

      {status === 'en_litige' && !isTravelerUser && booking.dispute_id && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-amber-600 shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-amber-800">Litige en cours</p>
              <p className="text-xs text-amber-700 mt-0.5">Communiquez avec le voyageur et l'équipe Safe Move.</p>
            </div>
          </div>
          <Link to={`/sender/disputes/${booking.dispute_id}`}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:underline">
            Voir le fil de discussion →
          </Link>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={showCancel}
        title="Annuler la réservation ?"
        description="Cette action est irréversible."
        confirmLabel="Oui, annuler" cancelLabel="Garder" variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setShowCancel(false)}
      />
      {showDispute && <DisputeModal bookingId={bookingId} onClose={() => setShowDispute(false)} />}
      {showKyc && <KycRequiredDialog bookingId={bookingId} onClose={() => setShowKyc(false)} />}
    </div>
  )
}