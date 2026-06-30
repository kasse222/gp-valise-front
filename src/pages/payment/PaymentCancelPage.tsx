import { useSearchParams, useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

import { Button } from '@/components/ui'
import { useAuthStore, isSender } from '@/store/authStore'

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const navigate  = useNavigate()
  const user      = useAuthStore((s) => s.user)

  const basePath = user && !isSender(user.role) ? '/traveler' : '/sender'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[24px] p-8 text-center border border-slate-100"
        style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>

        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-orange-500" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Paiement annulé</h1>
        <p className="text-slate-500 mb-8">Votre paiement n'a pas été complété.</p>

        <div className="flex flex-col gap-3">
          {bookingId && (
            <Button variant="primary" onClick={() => navigate(`${basePath}/bookings/${bookingId}`)}>
              Réessayer
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(`${basePath}/bookings`)}>
            Mes réservations
          </Button>
        </div>
      </div>
    </div>
  )
}