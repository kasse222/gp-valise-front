import { TrendingUp, Clock, CheckCircle, Lock } from 'lucide-react'
import { Card } from '@/components/ui'
import { useEarnings } from '@/hooks/useEarnings'
import { formatAmount } from '@/lib/utils'
import type { EarningsBucket } from '@/types'

function EarningsRow({
  icon, label, sublabel, amount, currency, color,
}: {
  icon: React.ReactNode; label: string; sublabel: string
  amount: number; currency: string; color: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{sublabel}</p>
        </div>
      </div>
      <p className="font-bold text-gray-900 font-mono shrink-0 text-sm">
        {formatAmount(amount, currency)}
      </p>
    </div>
  )
}

export function EarningsBlock() {
  const { data: buckets, isLoading, isError } = useEarnings()

  if (isLoading) {
    return (
      <Card className="mb-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 bg-gray-100 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (isError || !buckets) return null

  return (
    <section className="mb-8" aria-label="Mes gains">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Mes gains</h3>
      </div>

      <Card>
        {buckets.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Aucun mouvement financier pour le moment.
          </p>
        ) : (
          buckets.map((bucket: EarningsBucket) => (
            <div key={bucket.currency}>
              {buckets.length > 1 && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-2 first:mt-0">
                  {bucket.currency}
                </p>
              )}
              <EarningsRow
                icon={<Lock className="w-4 h-4 text-amber-600" aria-hidden />}
                label="En escrow"
                sublabel="Payé par le client, bloqué jusqu'à livraison"
                amount={bucket.escrow}
                currency={bucket.currency}
                color="bg-amber-50"
              />
              <EarningsRow
                icon={<Clock className="w-4 h-4 text-blue-600" aria-hidden />}
                label="À recevoir"
                sublabel="Livré — versement en cours"
                amount={bucket.pending}
                currency={bucket.currency}
                color="bg-blue-50"
              />
              <EarningsRow
                icon={<CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden />}
                label="Déjà versé"
                sublabel="Reçu sur votre compte"
                amount={bucket.paid}
                currency={bucket.currency}
                color="bg-emerald-50"
              />
            </div>
          ))
        )}
      </Card>
    </section>
  )
}