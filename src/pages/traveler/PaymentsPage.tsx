import { AlertCircle, Wallet } from 'lucide-react'
import type { AxiosError } from 'axios'

import { Card, Spinner, Button } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { cn, formatAmount, formatDate, transactionTypeLabel, transactionTypeColor, transactionStatusColor } from '@/lib/utils'
import { PageHero } from '@/components/ui/PageHero'

const SHOWN_TYPES = new Set(['payout', 'fee'])

export default function PaymentsPage() {
  const { data, isLoading, isError, error, refetch } = useTransactions()

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>

  const is403 = isError && (error as AxiosError)?.response?.status === 403

  if (is403) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <PageHero title="Mes paiements" />
        <Card>
          <div className="flex items-center gap-3 text-amber-600 py-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Vérification email ou KYC requis pour accéder à vos paiements.</p>
          </div>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement des paiements.</p>
        <Button variant="secondary" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  const transactions     = (data ?? []).filter((tx) => SHOWN_TYPES.has(tx.type.code))
  const completedPayouts = transactions.filter((tx) => tx.type.code === 'payout' && tx.status.is_success)
  const totalCents       = completedPayouts.reduce((sum, tx) => sum + tx.amount, 0)
  const totalCurrency    = completedPayouts[0]?.currency.code ?? 'EUR'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHero
        title="Mes paiements"
        subtitle="Versements et commissions liés à vos trajets"
        right={
          <div className="text-right">
            <p className="text-white/70 text-xs">Total versé</p>
            <p className="text-white font-bold text-lg font-mono">{formatAmount(totalCents, totalCurrency)}</p>
          </div>
        }
      />

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wallet className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun paiement pour le moment</p>
          <p className="text-sm text-gray-400 mt-1">Vos versements apparaîtront ici une fois vos trajets terminés.</p>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>Date</span><span>Type</span><span>Statut</span><span className="text-right w-24">Montant</span>
          </div>
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 text-sm">
                <span className="text-gray-500 text-xs">{formatDate(tx.processed_at ?? tx.created_at)}</span>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', transactionTypeColor[tx.type.code] ?? 'bg-gray-100 text-gray-700')}>
                  {transactionTypeLabel[tx.type.code] ?? tx.type.label}
                </span>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', transactionStatusColor[tx.status.code] ?? 'bg-gray-100 text-gray-700')}>
                  {tx.status.label}
                </span>
                <span className="font-medium text-gray-900 w-24 text-right">{formatAmount(tx.amount, tx.currency.code)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}