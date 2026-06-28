/**
 * EarningsBlock v2.0 — Gains par devise
 * Cards par devise · Amounts animés · Statut bien hiérarchisé
 */

import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Lock, Clock, CheckCircle} from 'lucide-react'
import { useEarnings } from '@/hooks/useEarnings'
import { formatAmount } from '@/lib/utils'
import type { EarningsBucket } from '@/types'

// ── Animated amount ──────────────────────────────────────────────────────────

function AnimatedAmount({ amount, currency, duration = 700 }: {
  amount:   number
  currency: string
  duration?: number
}) {
  const [display, setDisplay] = useState(0)
  const ref     = useRef<HTMLSpanElement>(null)
  const [seen,  setSeen]      = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!seen) return
    const start = Date.now()
    const step  = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(e * amount))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [seen, amount, duration])

  return (
    <span ref={ref}>
      {formatAmount(seen ? display : 0, currency)}
    </span>
  )
}

// ── Currency card ────────────────────────────────────────────────────────────

function CurrencyCard({ bucket, index }: { bucket: EarningsBucket; index: number }) {
  // Compute totals
  const total  = bucket.escrow + bucket.pending + bucket.paid
  const escrowPct = total > 0 ? (bucket.escrow / total) * 100 : 0
  const pendingPct = total > 0 ? (bucket.pending / total) * 100 : 0
  const paidPct   = total > 0 ? (bucket.paid   / total) * 100 : 0

  return (
    <div
      className="bg-white border border-slate-100 rounded-[16px] overflow-hidden shadow-sm
        transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header currency */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f0f7ff 100%)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Devise
          </p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {bucket.currency}
            <span className="ml-1.5 text-xs font-medium text-slate-400">
              {bucket.currency_label}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-0.5">Total en circulation</p>
          <p className="text-base font-bold text-[#1B3A6B] font-mono">
            <AnimatedAmount amount={total} currency={bucket.currency} />
          </p>
        </div>
      </div>

      {/* Progress bar total */}
      {total > 0 && (
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
          <div className="h-1.5 rounded-full overflow-hidden bg-slate-200 flex">
            <div
              className="h-full bg-amber-400 transition-all duration-700"
              style={{ width: `${escrowPct}%` }}
            />
            <div
              className="h-full bg-blue-400 transition-all duration-700"
              style={{ width: `${pendingPct}%` }}
            />
            <div
              className="h-full bg-emerald-400 transition-all duration-700"
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Escrow</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />À recevoir</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Versé</span>
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {/* Escrow */}
        <div className="flex items-center justify-between px-5 py-3.5 group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
              <Lock className="w-3.5 h-3.5 text-amber-500" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">En escrow</p>
              <p className="text-xs text-slate-400">Bloqué jusqu'à livraison</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 font-mono text-sm">
              <AnimatedAmount amount={bucket.escrow} currency={bucket.currency} />
            </p>
            {total > 0 && (
              <p className="text-xs text-slate-400">{escrowPct.toFixed(0)}%</p>
            )}
          </div>
        </div>

        {/* À recevoir */}
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              <Clock className="w-3.5 h-3.5 text-blue-500" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">À recevoir</p>
              <p className="text-xs text-slate-400">Versement en cours</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 font-mono text-sm">
              <AnimatedAmount amount={bucket.pending} currency={bucket.currency} />
            </p>
            {total > 0 && (
              <p className="text-xs text-slate-400">{pendingPct.toFixed(0)}%</p>
            )}
          </div>
        </div>

        {/* Versé */}
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Déjà versé</p>
              <p className="text-xs text-slate-400">Reçu sur votre compte</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-emerald-600 font-mono text-sm">
              <AnimatedAmount amount={bucket.paid} currency={bucket.currency} />
            </p>
            {total > 0 && (
              <p className="text-xs text-slate-400">{paidPct.toFixed(0)}%</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function EarningsSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="h-5 w-28 rounded-full bg-slate-100 animate-pulse" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
              <div className="h-2.5 w-28 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function EarningsBlock() {
  const { data: buckets, isLoading, isError } = useEarnings()

  if (isLoading) {
    return (
      <section aria-label="Mes gains">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Mes gains</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <EarningsSkeleton />
        </div>
      </section>
    )
  }

  if (isError || !buckets) return null

  // Total all-currency highlights
  const hasAnyEscrow = buckets.some((b) => b.escrow > 0)

  return (
    <section aria-label="Mes gains">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Mes gains</h3>

        {hasAnyEscrow && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            <Lock className="w-3 h-3" aria-hidden />
            Fonds en escrow
          </span>
        )}
      </div>

      {buckets.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[16px] p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-slate-400" aria-hidden />
          </div>
          <p className="text-sm font-medium text-slate-600">Aucun mouvement financier</p>
          <p className="text-xs text-slate-400 mt-1">Vos gains apparaîtront ici après vos premières livraisons.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {buckets.map((bucket, i) => (
            <CurrencyCard key={bucket.currency} bucket={bucket} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}