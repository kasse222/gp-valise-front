import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, AlertCircle, ShieldCheck,
  ExternalLink, Clock, Search, X,
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

// ─── Banner component ──────────────────────────────────────────────────────

function InfoBanner({
  color,
  icon: Icon,
  children,
}: {
  color:    'amber' | 'blue' | 'red' | 'green'
  icon:     React.ComponentType<{ className?: string }>
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

// ─── Dispute Modal ─────────────────────────────────────────────────────────

function DisputeModal({
  bookingId,
  onClose,
}: {
  bookingId: number
  onClose:   () => void
}) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const hasEnough = reason.trim().length >= 10

  const mutation = useMutation({
    mutationFn: () =>
      client.post(`/bookings/${bookingId}/dispute`, { reason: reason.trim() }),
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
    <div
      role="dialog"
      aria-modal
      aria-labelledby="dispute-title"
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4"
    >
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
          <textarea
            id="dispute-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Décrivez le problème rencontré (minimum 10 caractères)…"
            className="w-full rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]"
          />
          <p className="text-xs text-gray-400">{reason.trim().length} / 10 caractères minimum</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!hasEnough}
          >
            Ouvrir le litige
          </Button>
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
  const userRole      = useAuthStore((s) => s.user?.role)
  const isTravelerUser = userRole !== undefined && isTraveler(userRole)
  const userCountry   = useAuthStore((s) => s.user?.country) ?? 'SN'
  const paymentSectionRef = useRef<HTMLDivElement>(null)

  const [phone,         setPhone]         = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money')
  const [showCancel,    setShowCancel]    = useState(false)
  const [showDispute,   setShowDispute]   = useState(false)

  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)
  const { data: allTransactions, isError: isTxError, error: txError } = useTransactions()

  // Pay
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
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Une erreur est survenue')
    },
  })

  // Cancel
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
      toast.error(err.response?.data?.message ?? 'Impossible d\'annuler.')
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

  const status            = booking.status as BookingStatusCode
  const transactions      = (allTransactions ?? []).filter((tx) => tx.booking_id === bookingId)
  const is403             = isTxError && (txError as AxiosError)?.response?.status === 403
  const kgDisplay         = (booking.kg_reserved / 1000).toFixed(1) + ' kg'
  const tripDate          = booking.trip?.date ? booking.trip.date.split('-').reverse().join('/') : null
  const totalAmount       = booking.items.reduce((sum, item) => sum + item.price, 0)
  const chargeCompleted   = transactions.find((tx) => tx.type?.code === 'CHARGE' && tx.status?.code === 'COMPLETED')
  const refundCompleted   = transactions.find((tx) => tx.type?.code === 'REFUND'  && tx.status?.code === 'COMPLETED')
  const amountPaid        = chargeCompleted?.amount ?? 0
  const amountRefunded    = refundCompleted?.amount  ?? 0

  const isPendingApproval = status === 'pending_approval'
  const isPendingPayment  = status === 'en_paiement'
  const isConfirmed       = ['confirmee', 'livree', 'termine'].includes(status)
  const isExpired         = status === 'expiree'
  const isDeclined        = status === 'declined_by_traveler'
  const isCancellable     = isPendingApproval || isPendingPayment
  const canOpenDispute    = status === 'confirmee' || status === 'livree'
  const isPhoneRequired   = paymentMethod === 'mobile_money'
  const isPayDisabled     = payMutation.isPending || (isPhoneRequired && !phone.trim())

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Back */}
      <Link
        to="/sender/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Mes réservations
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réservation #{booking.id}</h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(booking.created_at)}</p>
        </div>
        <StatusBadge code={status} />
      </div>

      {/* ── Banners ────────────────────────────────────────────────────── */}

      {isPendingApproval && (
        <InfoBanner color="amber" icon={Clock}>
          <p className="font-semibold">En attente d'approbation du voyageur</p>
          <p className="mt-0.5 text-xs opacity-80">
            Vous recevrez une notification par email dès que le voyageur aura répondu.
            Le bouton de paiement sera disponible après approbation.
          </p>
        </InfoBanner>
      )}

      {isExpired && (
        <InfoBanner color="amber" icon={AlertCircle}>
          Le délai de paiement a expiré. Vous pouvez créer une nouvelle réservation.
        </InfoBanner>
      )}

      {isDeclined && (
        <InfoBanner color="red" icon={AlertCircle}>
          <p className="font-semibold">Réservation refusée par le voyageur</p>
          <button
            onClick={() => navigate('/trips')}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            <Search className="w-3 h-3" aria-hidden />
            Rechercher un autre trajet
          </button>
        </InfoBanner>
      )}

      {/* ── Trajet ─────────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trajet</h2>
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <span>{booking.trip?.departure ?? '—'}</span>
          <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden />
          <span>{booking.trip?.destination ?? '—'}</span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {tripDate && (
            <div>
              <dt className="text-gray-500">Date du trajet</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{tripDate}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Poids réservé</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{kgDisplay}</dd>
          </div>
          {booking.user && (
            <div>
              <dt className="text-gray-500">Voyageur</dt>
              <dd className="font-medium text-gray-900 mt-0.5 truncate">{booking.user.email}</dd>
            </div>
          )}
          {booking.comment && (
            <div className="col-span-2">
              <dt className="text-gray-500">Commentaire</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{booking.comment}</dd>
            </div>
          )}
        </dl>
        <div className="mt-4">
          <Link
            to={`/trips/${booking.trip_id}`}
            className="inline-flex items-center gap-1 text-xs text-[#1B3A6B] hover:underline"
          >
            Voir le détail du trajet <ExternalLink className="w-3 h-3" aria-hidden />
          </Link>
        </div>
      </Card>

      {/* ── Items ──────────────────────────────────────────────────────── */}
      {booking.items.length > 0 && (
        <Card className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items réservés</h2>
          <div className="divide-y divide-gray-100">
            {booking.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="text-gray-700">
                  <span className="font-medium">{item.luggage?.tracking_id ?? `Item #${item.id}`}</span>
                  <span className="text-gray-400 ml-2">· {(item.kg_reserved / 1000).toFixed(1)} kg</span>
                </div>
                <span className="font-medium text-gray-900 font-mono">{formatAmount(item.price, 'EUR')}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Pickup Location ────────────────────────────────────────────── */}
      {(isConfirmed || isTravelerUser) && (
        <PickupLocationCard
          bookingId={bookingId}
          isTraveler={isTravelerUser}
          bookingStatus={status}
        />
      )}

      {/* ── Récap financier ────────────────────────────────────────────── */}
      {isConfirmed && amountPaid > 0 && (
        <Card className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Récapitulatif financier</h2>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-600">Montant payé</span>
            <span className="font-medium text-gray-900 font-mono">{formatAmount(amountPaid, 'EUR')}</span>
          </div>
          {amountRefunded > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-600">Remboursé</span>
              <span className="font-medium text-red-600 font-mono">-{formatAmount(amountRefunded, 'EUR')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm py-2 border-t border-gray-100 mt-2">
            <span className="font-semibold text-gray-900">Total net</span>
            <span className="font-bold text-gray-900 font-mono">
              {formatAmount(amountPaid - amountRefunded, 'EUR')}
            </span>
          </div>
        </Card>
      )}

      {/* ── Paiement (EN_PAIEMENT uniquement) ─────────────────────────── */}
      {isPendingPayment && (
        <div ref={paymentSectionRef}>
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Paiement</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">Montant total</span>
              <span className="text-lg font-bold text-gray-900 font-mono">{formatAmount(totalAmount, 'EUR')}</span>
            </div>

            {/* Countdown */}
            {booking.payment_expires_at && (
              <div className="mb-4">
                <CountdownTimer
                  expiresAt={booking.payment_expires_at}
                  onExpired={() => {
                    queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
                  }}
                />
              </div>
            )}

            {/* Méthode de paiement */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['mobile_money', 'card'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  aria-pressed={paymentMethod === method}
                  className={`py-2.5 px-3 rounded-[10px] border text-sm font-medium transition-all min-h-[48px] ${
                    paymentMethod === method
                      ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
                      : 'border-gray-300 text-gray-700 hover:border-[#1B3A6B]'
                  }`}
                >
                  {method === 'mobile_money' ? '📱 Mobile Money' : '💳 Carte bancaire'}
                </button>
              ))}
            </div>

            {paymentMethod === 'mobile_money' && (
              <input
                type="tel"
                placeholder="+221 77 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Numéro de téléphone Mobile Money"
                className="w-full border border-gray-300 rounded-[10px] px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] min-h-[48px]"
              />
            )}

            <Button
              variant="primary"
              className="w-full"
              loading={payMutation.isPending}
              disabled={isPayDisabled}
              onClick={() => payMutation.mutate()}
            >
              Payer maintenant
            </Button>

            <div className="mt-3 text-center">
              <img
                src="/paydunya-badge.png"
                alt="Moyens de paiement acceptés"
                className="mx-auto max-w-full h-10 object-contain opacity-80"
                loading="lazy"
              />
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-2">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                Paiement sécurisé via Safe Move
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ── PENDING_APPROVAL — bouton payer désactivé visible ─────────── */}
      {isPendingApproval && (
        <Card className="mb-4 border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Montant estimé</span>
            <span className="font-bold text-gray-400 font-mono">{formatAmount(totalAmount, 'EUR')}</span>
          </div>
          <Button variant="primary" className="w-full" disabled>
            Payer maintenant (disponible après approbation)
          </Button>
        </Card>
      )}

      {/* ── Transactions ───────────────────────────────────────────────── */}
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
                <span className="font-medium text-gray-900 font-mono">
                  {formatAmount(tx.amount, tx.currency.code)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Historique statuts ─────────────────────────────────────────── */}
      {booking.status_history.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historique</h2>
          <ol className="space-y-3">
            {booking.status_history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#1B3A6B] flex-shrink-0" aria-hidden />
                <div>
                  <p className="text-gray-900">
                    {entry.old_label && (
                      <span className="text-gray-500">{entry.old_label} → </span>
                    )}
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

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        {isCancellable && (
          <Button variant="secondary" onClick={() => setShowCancel(true)}>
            Annuler la réservation
          </Button>
        )}
        {canOpenDispute && (
          <Button variant="danger" onClick={() => setShowDispute(true)}>
            Ouvrir un litige
          </Button>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={showCancel}
        title="Annuler la réservation ?"
        description="Cette action est irréversible. La réservation sera annulée et vous devrez en créer une nouvelle."
        confirmLabel="Oui, annuler"
        cancelLabel="Garder"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setShowCancel(false)}
      />

      {showDispute && (
        <DisputeModal bookingId={bookingId} onClose={() => setShowDispute(false)} />
      )}
    </div>
  )
}