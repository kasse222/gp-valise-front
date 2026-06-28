import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Package, Plane, ChevronDown, TrendingUp, Users, BarChart3 } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { Card, Button, SkeletonList, StatusBadge, PageHero } from '@/components/ui'
import { useTrips } from '@/hooks/useTrips'
import { useBookings } from '@/hooks/useBookings'
import { cn, tripStatusColor, formatDate, formatAmount } from '@/lib/utils'
import { EarningsBlock } from '@/components/traveler/EarningsBlock'
import { ShareProfileBlock } from '@/components/traveler/ShareProfileBlock'
import type { BookingStatusCode } from '@/components/ui/Badge'
import type { Booking } from '@/types'

// ── Hook: IntersectionObserver pour reveal animations ───────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

// ── Animated counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const { ref, visible } = useReveal()

  useEffect(() => {
    if (!visible) return
    const start = Date.now()
    const step  = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, value, duration])

  return <span ref={ref}>{display}</span>
}

// ── Transit Booking Card — redesign Booking.com style ────────────────────────

function TransitBookingCard({ booking, index }: { booking: Booking; index: number }) {
  const departure   = booking.trip?.departure   ?? '—'
  const destination = booking.trip?.destination ?? '—'
  const kg          = booking.kg_reserved ? (booking.kg_reserved / 1000).toFixed(1) : null
  const tripDate    = booking.trip?.date ? formatDate(booking.trip.date) : null
  const sender      = booking.user?.first_name
    ? `${booking.user.first_name} ${booking.user.last_name?.[0] ?? ''}.`
    : booking.user?.email?.split('@')[0] ?? 'Expéditeur'

  const senderInitial = sender[0]?.toUpperCase() ?? '?'

  const CATEGORY_EMOJI: Record<string, string> = {
    document: '📄', phone: '📱', computer: '💻',
    clothes: '👕', cosmetics: '💄', medicine: '💊', other: '📦',
  }
  const emojis = booking.items?.[0]?.luggage?.content_items
    ?.map((ci) => CATEGORY_EMOJI[ci.category] ?? '📦')
    .slice(0, 3) ?? []

  return (
    <Link
      to={`/traveler/bookings/${booking.id}`}
      className="block group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={cn(
          'rounded-[18px] overflow-hidden border border-slate-200',
          'transition-all duration-250 bg-white',
          'hover:shadow-[0_8px_32px_rgba(15,23,42,0.10)]',
          'hover:border-[#1B3A6B]/30',
          'hover:-translate-y-0.5',
          'active:translate-y-0',
        )}
      >
        {/* Header corridor */}
        <div
          className="relative px-4 py-3 flex items-center justify-between gap-3 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f2544 0%, #1B3A6B 60%, #2351a0 100%)',
          }}
        >
          {/* Animated route dots */}
          <div className="flex items-center gap-2 text-white font-semibold text-sm min-w-0 flex-1">
            <span className="truncate max-w-[100px]">{departure}</span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" aria-hidden />
              <Plane className="w-3.5 h-3.5 text-white/70 -rotate-0" aria-hidden />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" aria-hidden />
            </div>
            <span className="truncate max-w-[100px]">{destination}</span>
          </div>
          <StatusBadge code={booking.status as BookingStatusCode} />
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex flex-col gap-2.5">
          {/* Sender row */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}
            >
              {senderInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{sender}</p>
              {tripDate && (
                <p className="text-xs text-slate-400">{tripDate}</p>
              )}
            </div>
            {emojis.length > 0 && (
              <span className="ml-auto text-sm" title="Type de colis">{emojis.join(' ')}</span>
            )}
          </div>

          {/* Metrics row */}
          {kg && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 rounded-full px-2.5 py-1 border border-slate-100">
                <Package className="w-3 h-3" aria-hidden />
                {kg} kg
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" aria-hidden />
              Scanner à la livraison
            </span>
            <span className="text-xs text-[#1B3A6B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              Voir →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, variant, icon, suffix = '' }: {
  label:    string
  value:    number
  suffix?:  string
  variant:  'primary' | 'success' | 'info'
  icon:     React.ReactNode
}) {
  const colors = {
    primary: { text: 'text-[#1B3A6B]', bg: 'bg-[#EBF4FF]', icon: 'text-[#1B3A6B]' },
    success: { text: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    info:    { text: 'text-blue-600', bg: 'bg-blue-50', icon: 'text-blue-600' },
  }[variant]

  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className={cn(
        'bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
          <span className={cn('w-4 h-4', colors.icon)} aria-hidden>{icon}</span>
        </div>
      </div>
      <p className={cn('text-3xl font-bold', colors.text)}>
        {visible ? <AnimatedNumber value={value} /> : '0'}{suffix}
      </p>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 4

export default function TravelerOverviewPage() {
  const user          = useAuthStore((s) => s.user)
  const tripsQuery    = useTrips()
  const bookingsQuery = useBookings()
  const [showAll, setShowAll] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  if (tripsQuery.isLoading || bookingsQuery.isLoading) {
    return <div className="p-6"><SkeletonList count={3} /></div>
  }

  if (tripsQuery.isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => tripsQuery.refetch()}>Réessayer</Button>
      </div>
    )
  }

  const trips     = tripsQuery.data ?? []
  const bookings  = bookingsQuery.data ?? []
  const myTripIds = new Set(trips.map((t) => t.id))

  const inTransit = bookings.filter((b) => b.status === 'en_transit' && myTripIds.has(b.trip_id))
  const displayed = showAll ? inTransit : inTransit.slice(0, PREVIEW_COUNT)
  const remaining = inTransit.length - PREVIEW_COUNT

  const actifs          = trips.filter((t) => t.status.code === 'active').length
  const totalBookings   = bookings.filter((b) => myTripIds.has(b.trip_id)).length
  const capaciteMoyenne = trips.length > 0
    ? Math.round(
        trips.reduce((sum, t) => sum + (t.capacity > 0 ? (t.grams_disponible / t.capacity) * 100 : 0), 0)
        / trips.length
      )
    : 0

  const recent = [...trips]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'transition-all duration-500',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        <PageHero
          title={`Bonjour, ${user?.first_name} 👋`}
          subtitle="Voici un aperçu de vos trajets."
          right={
            <Link
              to="/traveler/trips/new"
              className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition-all duration-200 min-h-[40px]"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <Plus size={15} aria-hidden />
              Publier un trajet
            </Link>
          }
        />
      </div>

      {/* ── Stats grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Trajets actifs"
          value={actifs}
          variant="primary"
          icon={<Plane className="w-4 h-4" />}
        />
        <StatCard
          label="Réservations reçues"
          value={totalBookings}
          variant="success"
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Capacité disponible"
          value={capaciteMoyenne}
          suffix=" %"
          variant="info"
          icon={<BarChart3 className="w-4 h-4" />}
        />
      </div>

      {/* ── Colis en transit ──────────────────────────────────── */}
      {inTransit.length > 0 && (
        <section aria-label="Colis en transit">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-indigo-600" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Colis en transit</h3>
            <span className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {inTransit.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayed.map((booking, i) => (
              <TransitBookingCard key={booking.id} booking={booking} index={i} />
            ))}
          </div>

          {inTransit.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className={cn(
                'mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium',
                'rounded-[12px] transition-all duration-200',
                'text-[#1B3A6B] bg-[#EBF4FF] hover:bg-[#1B3A6B] hover:text-white',
                'border border-[#1B3A6B]/10',
              )}
            >
              <ChevronDown
                className={cn('w-4 h-4 transition-transform duration-300', showAll && 'rotate-180')}
                aria-hidden
              />
              {showAll ? 'Voir moins' : `Voir les ${remaining} autres colis`}
            </button>
          )}
        </section>
      )}

      {/* ── Earnings ─────────────────────────────────────────── */}
      <EarningsBlock />

      {/* ── Share profile ─────────────────────────────────────── */}
      <ShareProfileBlock />

      {/* ── Trajets récents ───────────────────────────────────── */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Trajets récents</h3>
            <Link
              to="/traveler/trips"
              className="text-xs text-[#1B3A6B] hover:underline font-medium flex items-center gap-0.5"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recent.map((trip, i) => (
              <Link key={trip.id} to={`/traveler/trips/${trip.id}`} className="block group">
                <div
                  className={cn(
                    'bg-white border border-slate-100 rounded-[14px] p-4 shadow-sm',
                    'transition-all duration-200',
                    'group-hover:shadow-md group-hover:border-slate-200 group-hover:-translate-y-0.5',
                    'animate-[sm-fade-up_0.4s_ease_both]',
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#EBF4FF] flex items-center justify-center shrink-0">
                        <Plane className="w-3.5 h-3.5 text-[#1B3A6B]" aria-hidden />
                      </div>
                      <span className="font-medium text-slate-900 text-sm truncate">{trip.departure}</span>
                      <ArrowRight size={12} className="shrink-0 text-slate-400" aria-hidden />
                      <span className="font-medium text-slate-900 text-sm truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                        tripStatusColor[trip.status.code] ?? 'bg-slate-50 text-slate-500 border-slate-200',
                      )}>
                        {trip.status.label}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {(trip.grams_disponible / 1000).toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}