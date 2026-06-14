import { useSearchParams, useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

import { Button, Card } from '@/components/ui'
import { useAuthStore, isSender } from '@/store/authStore'

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const navigate  = useNavigate()
  const user      = useAuthStore((s) => s.user)

  const basePath = user && !isSender(user.role) ? '/traveler' : '/sender'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-16 h-16 text-orange-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h1>
        <p className="text-gray-500 mb-8">
          Votre paiement n'a pas été complété.
        </p>

        <div className="flex flex-col gap-3">
          {bookingId && (
            <Button
              variant="primary"
              onClick={() => navigate(`${basePath}/bookings/${bookingId}`)}
            >
              Réessayer
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