import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

import { Card } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export function ShareProfileBlock() {
  const user = useAuthStore((s) => s.user)
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const profileUrl = `https://safemove.tech/gp/${user.id}`

  const whatsappText = encodeURIComponent(
    `Salut 👋\n\nVoici mon profil vérifié SafeMove : ${profileUrl}\n\nTu peux réserver et payer en toute sécurité : ton paiement est bloqué et je ne le reçois qu'une fois ton colis remis. Plus de risque, preuve de livraison garantie. 📦✅`
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  return (
    <section className="mb-8" aria-label="Partager mon profil">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#EBF4FF] flex items-center justify-center">
          <Share2 className="w-4 h-4 text-[#1B3A6B]" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Partager mon profil</h3>
      </div>

      <Card>
        <p className="text-sm text-gray-500 mb-4">
          Envoie ton lien à tes clients. Ils réservent et paient en sécurité — tu gardes tes propres clients.
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-[10px] text-sm text-gray-600 font-mono truncate">
            {profileUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-[10px] transition-colors shrink-0 min-h-[44px]"
            aria-label="Copier le lien"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold rounded-[10px] transition-colors min-h-[48px]">
          <Share2 className="w-4 h-4" aria-hidden />
          Partager sur WhatsApp
        </a>
      </Card>
    </section>
  )
}
