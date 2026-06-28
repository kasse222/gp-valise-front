/**
 * SafeMove — Extended UI Components v2.0
 * Spinner · Skeleton · Avatar · CountdownTimer · EmptyState · ConfirmModal
 * Animations premium, finitions soignées
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ══════════════════════════════════════════════════════
   SPINNER
   ══════════════════════════════════════════════════════ */

type SpinnerSize = 'sm' | 'md' | 'lg'

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function Spinner({
  size = 'md',
  label = 'Chargement…',
  className,
}: {
  size?:      SpinnerSize
  label?:     string
  className?: string
}) {
  return (
    <Loader2
      className={cn('animate-spin text-[#1B3A6B]', spinnerSizes[size], className)}
      aria-label={label}
      role="status"
    />
  )
}

/* ══════════════════════════════════════════════════════
   SKELETON — shimmer animé
   ══════════════════════════════════════════════════════ */

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-lg overflow-hidden relative', className)}
      aria-hidden
      style={{
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e8edf2 40%, #f1f5f9 80%)',
        backgroundSize: '200% 100%',
        animation: 'sm-shimmer 1.6s ease-in-out infinite',
      }}
    />
  )
}

export function SkeletonText({ className }: { className?: string }) {
  return <SkeletonBase className={cn('h-4 w-full', className)} />
}

export function SkeletonCard({
  className,
  style,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm flex flex-col gap-4',
        className,
      )}
      style={style}
      aria-hidden
    >
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-5 w-36" />
        <SkeletonBase className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <SkeletonBase className="h-4 w-28" />
        <SkeletonBase className="h-4 w-20" />
      </div>
      <SkeletonBase className="h-10 w-full rounded-full" />
    </div>
  )
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)} role="status" aria-label="Chargement…">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
            key={i}
            className="opacity-100"
            style={{ opacity: 1 - i * 0.15 }}
          />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   AVATAR — avec fallback initiales animées
   ══════════════════════════════════════════════════════ */

const avatarSizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({
  name,
  src,
  size = 'md',
  className,
  ring = false,
}: {
  name:       string
  src?:       string
  size?:      keyof typeof avatarSizes
  className?: string
  ring?:      boolean
}) {
  const [imgError, setImgError] = useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setImgError(true)}
        className={cn(
          'rounded-full object-cover shrink-0 transition-opacity duration-300',
          ring && 'ring-2 ring-white shadow-sm',
          avatarSizes[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-semibold text-white',
        ring && 'ring-2 ring-white shadow-sm',
        avatarSizes[size],
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, #1B3A6B 0%, #3b82f6 100%)',
      }}
      aria-label={name}
      role="img"
    >
      {getInitials(name)}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   COUNTDOWN TIMER
   ══════════════════════════════════════════════════════ */

function getRemaining(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CountdownTimer({
  expiresAt,
  onExpired,
  className,
}: {
  expiresAt:  string
  onExpired?: () => void
  className?: string
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt))

  useEffect(() => {
    if (remaining === 0) { onExpired?.(); return }
    const id = setInterval(() => {
      const next = getRemaining(expiresAt)
      setRemaining(next)
      if (next === 0) { clearInterval(id); onExpired?.() }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpired, remaining])

  const isUrgent  = remaining < 600
  const isWarning = remaining < 3600

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono font-semibold relative overflow-hidden',
        isUrgent              ? 'bg-red-100 text-red-700 border border-red-200'
          : isWarning         ? 'bg-amber-100 text-amber-700 border border-amber-200'
          : 'bg-blue-100 text-blue-700 border border-blue-200',
        isUrgent && 'animate-[sm-pulse-glow_1.5s_ease-in-out_infinite]',
        className,
      )}
      role="timer"
      aria-live="polite"
      aria-label={`Temps restant : ${formatCountdown(remaining)}`}
    >
      <span aria-hidden>⏱</span>
      {remaining === 0 ? 'Expiré' : formatCountdown(remaining)}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   EMPTY STATE — with scale-in animation
   ══════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon?:        LucideIcon
  title:        string
  description?: string
  action?:      React.ReactNode
  className?:   string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 gap-4',
        'animate-[sm-scale-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]',
        className,
      )}
      role="status"
    >
      {Icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #EBF4FF 0%, #dbeafe 100%)',
            boxShadow: '0 4px 16px rgba(27,58,107,0.10)',
          }}
        >
          <Icon className="h-8 w-8 text-[#1B3A6B] opacity-70" />
        </div>
      )}
      <div className="flex flex-col gap-2 max-w-xs">
        <p className="font-semibold text-slate-800 text-base">{title}</p>
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   CONFIRM MODAL — slide-up + backdrop blur
   ══════════════════════════════════════════════════════ */

interface ConfirmModalProps {
  open:          boolean
  title:         string
  description:   string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:      'danger' | 'primary'
  loading?:      boolean
  onConfirm:     () => void
  onCancel:      () => void
}

export function ConfirmModal({
  open, title, description,
  confirmLabel = 'Confirmer',
  cancelLabel  = 'Annuler',
  variant      = 'danger',
  loading      = false,
  onConfirm, onCancel,
}: ConfirmModalProps) {
  // Trap focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4"
      style={{ animation: 'sm-fade-in 0.15s ease both' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm bg-white rounded-[24px] p-6 flex flex-col gap-5"
        style={{
          boxShadow: '0 24px 64px rgba(15,23,42,0.20)',
          animation: 'sm-scale-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto',
            variant === 'danger' ? 'bg-red-100' : 'bg-blue-100',
          )}
        >
          <span className="text-2xl" aria-hidden>
            {variant === 'danger' ? '⚠️' : '❓'}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-center">
          <h2 id="confirm-title" className="text-base font-bold text-slate-900">
            {title}
          </h2>
          <p id="confirm-desc" className="text-sm text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}