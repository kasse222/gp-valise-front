import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Clock } from 'lucide-react'

import { Button, Card, Spinner } from '@/components/ui'
import { useAuthStore, isSender } from '@/store/authStore'
import { useBooking } from '@/hooks/useBooking'

// F-026 — Polling webhook page succès
// PSP redirige ici après paiement mais le webhook arrive en asynchrone.
// On poll GET /bookings/{id} toutes les 3s pendant max 30s.
// Si confirmee → succès affiché. Si timeout → message d'attente sans alarmer.

type PollingState = 'polling' | 'confirmed' | 'timeout'

const POLL_INTERVAL_MS = 3_000
const POLL_MAX_MS      = 30_000

export default function PaymentSuccessPage() {
  const [searchParams]  = useSearchParams()
  const bookingId       = searchParams.get('booking_id')
  const navigate        = useNavigate()
  const user            = useAuthStore((s) => s.user)
  const basePath        = user && !isSender(user.role) ? '/traveler' : '/sender'

  const [pollingState, setPollingState] = useState<PollingState>(
    bookingId ? 'polling' : 'confirmed'
  )
  const [elapsed, setElapsed] = useState(0)

  const { refetch } = useBooking(
    bookingId ? Number(bookingId) : 0
  )

  useEffect(() => {
    if (!bookingId || pollingState !== 'polling') return

    const start    = Date.now()
    const interval = setInterval(async () => {
      const now = Date.now()
      setElapsed(now - start)

      if (now - start >= POLL_MAX_MS) {
        clearInterval(interval)
        setPollingState('timeout')
        return
      }

      const { data } = await refetch()
      const status   = data?.status as string | undefined

      // Statuts qui indiquent que le webhook a bien été traité
      if (['confirmee', 'en_transit', 'livree', 'termine'].includes(status ?? '')) {
        clearInterval(interval)
        setPollingState('confirmed')
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [bookingId, pollingState, refetch])

  // ─── Polling en cours ─────────────────────────────────────────────────────
  if (pollingState === 'polling') {
    const seconds = Math.min(Math.floor(elapsed / 1000), 30)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <Clock className="w-16 h-16 text-[#1B3A6B] animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Confirmation en cours…
          </h1>
          <p className="text-gray-500 mb-6">
            Nous attendons la confirmation de votre paiement.
          </p>
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-400">
            <Spinner />
            <span>Vérification… {seconds}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
            <div
              className="bg-[#1B3A6B] h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((elapsed / POLL_MAX_MS) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            Cette opération prend généralement moins de 10 secondes.
          </p>
        </Card>
      </div>
    )
  }

  // ─── Timeout — webhook pas encore reçu ───────────────────────────────────
  if (pollingState === 'timeout') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <Clock className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement reçu
          </h1>
          <p className="text-gray-500 mb-2">
            Votre paiement a bien été effectué.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            La confirmation peut prendre quelques minutes supplémentaires.
            Votre réservation sera mise à jour automatiquement.
          </p>
          <div className="flex flex-col gap-3">
            {bookingId && (
              <Button
                variant="primary"
                onClick={() => navigate(`${basePath}/bookings/${bookingId}`)}
              >
                Voir ma réservation
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => navigate(`${basePath}/bookings`)}
            >
              Mes réservations
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ─── Confirmé ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement confirmé !
        </h1>
        <p className="text-gray-500 mb-8">
          Votre réservation est confirmée. Le voyageur a été notifié.
        </p>
        <div className="flex flex-col gap-3">
          {bookingId && (
            <Button
              variant="primary"
              onClick={() => navigate(`${basePath}/bookings/${bookingId}`)}
            >
              Voir ma réservation
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate(`${basePath}/bookings`)}
          >
            Mes réservations
          </Button>
        </div>
      </Card>
    </div>
  )
}