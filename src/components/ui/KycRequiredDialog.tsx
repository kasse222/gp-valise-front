import { useNavigate } from 'react-router-dom'
import { ShieldAlert, X } from 'lucide-react'
import { Button } from '@/components/ui'

interface KycRequiredDialogProps {
  bookingId: number
  onClose:   () => void
}

/**
 * Dialog affiché quand le paiement échoue avec kyc_required: true
 * Sileye #6 — explication claire + bouton redirect KYC
 */
export function KycRequiredDialog({ bookingId, onClose }: KycRequiredDialogProps) {
  const navigate = useNavigate()

  const handleGoKyc = () => {
    sessionStorage.setItem('pendingPaymentBookingId', String(bookingId))
    navigate('/sender/profile', { state: { kycRequired: true } })
  }

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="kyc-dialog-title"
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4"
    >
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
          <p>
            Pour effectuer un paiement sur Safe Move, votre identité doit être vérifiée (KYC).
          </p>
          <p>
            Cette étape est obligatoire pour garantir la sécurité des transactions et protéger tous les utilisateurs.
          </p>
          <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-[10px] text-amber-800 text-xs">
            📋 Vous aurez besoin d'une pièce d'identité valide (CNI, passeport ou titre de séjour).
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Plus tard
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleGoKyc}>
            Vérifier mon identité
          </Button>
        </div>
      </div>
    </div>
  )
}