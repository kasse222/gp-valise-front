import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTrips } from '@/api/trips'
import { useAuthStore, isSender } from '@/store/authStore'
import { formatDate, formatAmount } from '@/lib/utils'
import type { Trip } from '@/types'
import { WaitlistForm, SkeletonCard } from '@/components/ui'
import { CityInputInline } from '@/components/ui/CitySelect'
import {
  Package, Plane, Shield, CheckCircle,
  DollarSign, Calendar, Menu, X, ArrowRight,
  MapPin, Lock, TrendingUp, ChevronDown,
  User, Clock, HeadphonesIcon,
} from 'lucide-react'

// ── Scroll reveal ────────────────────────────────────────────────────────────

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible: vis }
}

// ── Live counter ─────────────────────────────────────────────────────────────

function LiveCounter() {
  const [count, setCount] = useState(3228)
  useEffect(() => {
    const id = setInterval(() => setCount(n => n + Math.floor(Math.random() * 3)), 3500)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/90">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="font-bold text-white">{count.toLocaleString('fr-FR')}</span> colis livrés cette semaine
    </div>
  )
}

// ── Hero Premium World Map ────────────────────────────────────────────────────
// Couches : carte monde PNG → routes courbées SVG → hubs lumineux →
//           particules animateMotion → anneaux orbitaux → logo GP → ombre

// Coordonnées décalées à droite (zone 500-900 sur 960px) pour éviter le texte
const HUBS = [
  // Afrique
  { id: 'casablanca', label: 'Casablanca', x: 560, y: 270 },
  { id: 'dakar',      label: 'Dakar',      x: 490, y: 340 },
  { id: 'abidjan',    label: 'Abidjan',    x: 540, y: 375 },
  { id: 'bamako',     label: 'Bamako',     x: 510, y: 355 },
  { id: 'cotonou',    label: 'Cotonou',    x: 580, y: 378 },
  { id: 'tunis',      label: 'Tunis',      x: 620, y: 240 },
  // Europe
  { id: 'paris',      label: 'Paris',      x: 620, y: 168 },
  { id: 'marseille',  label: 'Marseille',  x: 638, y: 192 },
  { id: 'bruxelles',  label: 'Bruxelles',  x: 635, y: 152 },
  { id: 'madrid',     label: 'Madrid',     x: 590, y: 205 },
  { id: 'milan',      label: 'Milan',      x: 655, y: 180 },
  // Moyen-Orient
  { id: 'dubai',      label: 'Dubaï',      x: 760, y: 275 },
]

// Routes : source → destination, courbe de contrôle Bézier
const ROUTES = [
  { from: 'casablanca', to: 'paris',     cx: 590, cy: 140, dur: '5s',  delay: '0s'   },
  { from: 'casablanca', to: 'madrid',    cx: 572, cy: 165, dur: '4s',  delay: '1s'   },
  { from: 'dakar',      to: 'paris',     cx: 548, cy: 130, dur: '7s',  delay: '0.5s' },
  { from: 'dakar',      to: 'marseille', cx: 560, cy: 155, dur: '6s',  delay: '2s'   },
  { from: 'abidjan',    to: 'paris',     cx: 558, cy: 120, dur: '8s',  delay: '1.5s' },
  { from: 'abidjan',    to: 'bruxelles', cx: 565, cy: 115, dur: '9s',  delay: '3s'   },
  { from: 'bamako',     to: 'madrid',    cx: 545, cy: 162, dur: '6.5s',delay: '2.5s' },
  { from: 'cotonou',    to: 'milan',     cx: 605, cy: 145, dur: '7.5s',delay: '0.8s' },
  { from: 'tunis',      to: 'marseille', cx: 632, cy: 210, dur: '4.5s',delay: '1.2s' },
  { from: 'casablanca', to: 'dubai',     cx: 680, cy: 245, dur: '10s', delay: '4s'   },
  { from: 'dakar',      to: 'bruxelles', cx: 552, cy: 108, dur: '9s',  delay: '0s'   },
]

function getHub(id: string) {
  return HUBS.find(h => h.id === id)!
}

function routePath(r: typeof ROUTES[0]) {
  const f = getHub(r.from)
  const t = getHub(r.to)
  return `M${f.x},${f.y} Q${r.cx},${r.cy} ${t.x},${t.y}`
}

function LogoCube3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none lg:pointer-events-auto"
      style={{ opacity: show ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}
      role="img"
      aria-label="SafeMove — réseau logistique Afrique-Europe"
    >
      {/* ═══ SVG pleine section hero ═══ */}
      <svg
        viewBox="0 0 960 540"
        width="100%"
        height="100%"
        className="absolute inset-0"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Glow filters */}
          <filter id="hub-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hub-glow-lg" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="20" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Gradient pour les routes */}
          <linearGradient id="route-grad-1" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0"/>
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* ── Couche 1 : Carte monde PNG ── */}
        <image
          href="/carte_monde.png"
          x="0" y="0"
          width="960" height="540"
          preserveAspectRatio="xMidYMid slice"
          opacity="0.18"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* ── Couche 2 : Routes courbées ── */}
        {ROUTES.map((r, i) => {
          const d = routePath(r)
          return (
            <g key={i}>
              {/* Ligne de route — très discrète */}
              <path
                d={d}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                strokeDasharray="4 6"
                opacity="0.25"
              />
              {/* Ligne lumineuse par dessus */}
              <path
                d={d}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1"
                opacity="0.15"
                filter="url(#route-glow)"
              />
              {/* Particule animée sur la route */}
              <circle r="2.5" fill="#ffffff" opacity="0.9" filter="url(#hub-glow)">
                <animateMotion
                  dur={r.dur}
                  begin={r.delay}
                  repeatCount="indefinite"
                  path={d}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  keyTimes="0;0.1;0.9;1"
                  dur={r.dur}
                  begin={r.delay}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Traînée lumineuse */}
              <circle r="1.5" fill="#60a5fa" opacity="0.6" filter="url(#hub-glow)">
                <animateMotion
                  dur={r.dur}
                  begin={r.delay === '0s' ? '0.3s' : r.delay}
                  repeatCount="indefinite"
                  path={d}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.6;0.6;0"
                  keyTimes="0;0.1;0.9;1"
                  dur={r.dur}
                  begin={r.delay === '0s' ? '0.3s' : r.delay}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )
        })}

        {/* ── Couche 3 : Hubs lumineux ── */}
        {HUBS.map(hub => {
          const isEurope = ['paris','marseille','bruxelles','madrid','milan'].includes(hub.id)
          const isDubai  = hub.id === 'dubai'
          return (
            <g key={hub.id}>
              {/* Halo externe pulsant */}
              <circle cx={hub.x} cy={hub.y} r="8" fill="#3b82f6" opacity="0.08" filter="url(#hub-glow)">
                <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.08;0.15;0.08" dur="3s" repeatCount="indefinite"/>
              </circle>
              {/* Cercle externe */}
              <circle
                cx={hub.x} cy={hub.y} r="4"
                fill="none"
                stroke={isEurope ? '#93c5fd' : isDubai ? '#fbbf24' : '#60a5fa'}
                strokeWidth="0.8"
                opacity="0.5"
              />
              {/* Point central */}
              <circle
                cx={hub.x} cy={hub.y} r="2.5"
                fill={isEurope ? '#93c5fd' : isDubai ? '#fbbf24' : '#60a5fa'}
                opacity="0.9"
                filter="url(#hub-glow)"
              />
              {/* Label ville */}
              <text
                x={hub.x + (hub.id === 'casablanca' || hub.id === 'dakar' ? -8 : 8)}
                y={hub.y - 6}
                textAnchor={hub.id === 'casablanca' || hub.id === 'dakar' ? 'end' : 'start'}
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                fill="#93c5fd"
                opacity="0.55"
                letterSpacing="0.05em"
              >
                {hub.label.toUpperCase()}
              </text>
            </g>
          )
        })}

      </svg>
    </div>
  )
}

// ── Feature mini card (dark bottom bar) ──────────────────────────────────────

function FeatureMini({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
        <span className="text-blue-300">{icon}</span>
      </div>
      <div>
        <p className="text-white font-bold text-sm">{title}</p>
        <p className="text-white/50 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className="text-center mb-14 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}>
      <span className="inline-block bg-[#EBF4FF] text-[#1B3A6B] text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest border border-[#1B3A6B]/15">
        {eyebrow}
      </span>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h2>
      {sub && <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">{sub}</p>}
    </div>
  )
}

// ── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description, delay = 0 }: {
  icon: React.ReactNode; title: string; description: string; delay?: number
}) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className="group bg-white border border-slate-100 rounded-[20px] p-7 flex flex-col gap-5 transition-all duration-300 cursor-default"
      style={{
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.2s ease`,
      }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#EBF4FF] border border-[#1B3A6B]/10 transition-all duration-300 group-hover:bg-[#1B3A6B] group-hover:scale-110">
        <div className="text-[#1B3A6B] group-hover:text-white transition-colors duration-300">{icon}</div>
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Trip card ─────────────────────────────────────────────────────────────────

function TripCardPreview({ trip }: { trip: Trip }) {
  const navigate  = useNavigate()
  const currency  = (trip as any).currency ?? 'XOF'
  const kgDispo   = (trip.grams_disponible / 1000).toFixed(1)

  return (
    <div
      className="bg-white border border-slate-100 rounded-[18px] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f2544] to-[#1B3A6B] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <span>{trip.departure}</span>
          <Plane className="w-3.5 h-3.5 text-white/60" aria-hidden />
          <span>{trip.destination}</span>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 rounded-full">
          Actif
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        {trip.date && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {formatDate(trip.date)}
          </div>
        )}
        <div className="flex items-end justify-between">
          <div>
            <span className="font-black text-[#1B3A6B] text-2xl leading-none">
              {formatAmount(trip.price_per_kg, currency)}
            </span>
            <span className="text-slate-400 text-sm font-semibold ml-1">/kg</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">{kgDispo} kg dispo</span>
        </div>

        {trip.user && (
          <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-[12px] border border-slate-100">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}>
              {trip.user.first_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {trip.user.first_name} {trip.user.last_name?.[0]}.
              </p>
              {trip.user.kyc_verified && (
                <p className="text-[10px] text-emerald-600 font-bold">✓ KYC vérifié</p>
              )}
            </div>
            {trip.user.trips_count > 0 && (
              <span className="text-xs text-slate-400 shrink-0">{trip.user.trips_count} trajets</span>
            )}
          </div>
        )}

        <button
          className="w-full bg-[#1B3A6B] text-white text-sm font-bold py-3 rounded-full transition-all duration-200 hover:bg-[#2351a0] group-hover:shadow-md mt-auto"
          onClick={e => { e.stopPropagation(); navigate(`/trips/${trip.id}`) }}
        >
          Voir ce trajet
        </button>
      </div>
    </div>
  )
}

// ── Step ─────────────────────────────────────────────────────────────────────

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex-shrink-0 w-8 h-8 rounded-full text-sm font-black flex items-center justify-center bg-[#1B3A6B] text-white shadow-sm">{number}</span>
      <p className="text-slate-600 text-sm leading-relaxed pt-1">{text}</p>
    </div>
  )
}

// ── Animated counter ─────────────────────────────────────────────────────────

function AnimCount({ to, suffix = '', duration = 1200 }: { to: number; suffix?: string; duration?: number }) {
  const { ref, visible } = useReveal(0.3)
  const [val, setVal]    = useState(0)
  useEffect(() => {
    if (!visible) return
    const start = Date.now()
    const step  = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, to, duration])
  return <span ref={ref}>{val.toLocaleString('fr-FR')}{suffix}</span>
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const [departure,   setDeparture]   = useState('')
  const [destination, setDestination] = useState('')
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const dashPath = user ? (isSender(user.role) ? '/sender' : '/traveler') : null

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips-landing'],
    queryFn:  () => getTrips(),
    staleTime: 60_000,
  })
  const preview = trips?.slice(0, 3) ?? []

  const navLinks = [
    { label: 'Comment ça marche', href: '#how' },
    { label: 'Nos services',      href: '#features' },
    { label: 'Trajets',           href: '#trips' },
  ]

  return (
    <div className="min-h-screen font-sans">

      {/* ── Navbar — blanc, propre ──────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100"
        style={{ boxShadow: '0 1px 0 0 rgba(226,232,240,0.8)' }}
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-8">
          <Link to="/" className="shrink-0 flex items-center gap-2 group" aria-label="Accueil Safe Move">
            <img src="/logo-icon.png" alt="" className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110" aria-hidden />
            <span className="font-black text-lg tracking-tight">
              <span className="text-[#1B3A6B]">SAFE</span>
              <span className="text-[#3b82f6]">MOVE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                className="text-sm text-slate-600 hover:text-[#1B3A6B] transition-colors font-semibold">
                {link.label}
              </a>
            ))}
            <a href="#" className="text-sm text-slate-600 hover:text-[#1B3A6B] transition-colors font-semibold flex items-center gap-1">
              Besoin d'aide ?
            </a>
          </div>

          <div className="flex items-center gap-3">
            {dashPath ? (
              <Link to={dashPath}
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 min-h-[44px] shadow-sm">
                <User className="h-4 w-4" aria-hidden />
                Mon espace
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="hidden sm:flex text-sm font-semibold text-slate-600 hover:text-[#1B3A6B] transition-colors min-h-[44px] items-center px-2">
                  Connexion
                </Link>
                <Link to="/register"
                  className="flex items-center gap-1.5 bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 min-h-[44px] shadow-sm">
                  Commencer <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label={menuOpen ? 'Fermer' : 'Menu'}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-1"
            style={{ animation: 'sm-fade-up 0.2s ease both' }}>
            {navLinks.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                className="text-sm text-slate-700 hover:text-[#1B3A6B] py-3 min-h-[44px] flex items-center font-semibold border-b border-slate-50 last:border-0">
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link to="/login" className="flex-1 text-center py-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full">Connexion</Link>
              <Link to="/register" className="flex-1 text-center py-3 text-sm font-bold text-white bg-[#1B3A6B] rounded-full">S'inscrire</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative pt-[68px] min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #030a18 0%, #080f22 25%, #0a1628 55%, #0f2544 100%)' }}
        aria-label="Bannière principale"
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} aria-hidden />

        {/* Large glow bottom-center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }} aria-hidden />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          {/* World map hero — pleine section, derrière le texte */}
          <LogoCube3D />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

            {/* Left */}
            <div className="flex flex-col gap-7"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>

              <div className="flex flex-col gap-3">
                <LiveCounter />
                <div className="inline-flex items-center gap-2 self-start bg-white/8 border border-white/15 rounded-full px-4 py-2"
                  style={{ animation: mounted ? 'sm-fade-up 0.5s ease 0.1s both' : 'none' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                  <span className="text-white/80 text-sm font-semibold">Plateforme active · Sénégal · Maroc · France</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.06] tracking-tight"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.15s both' : 'none' }}>
                Envoyez vos colis via{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  des voyageurs
                </span>{' '}
                de confiance
              </h1>

              <p className="text-lg text-blue-100/70 leading-relaxed max-w-lg"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.22s both' : 'none' }}>
                Connectez expéditeurs et voyageurs africains. Paiement escrow garanti, identités vérifiées, suivi en temps réel.
              </p>

              <div className="flex flex-wrap gap-2"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.28s both' : 'none' }}>
                {['🇸🇳 Sénégal', '🇲🇦 Maroc', '🇫🇷 France', "🇨🇮 Côte d'Ivoire", '🇧🇯 Bénin'].map(p => (
                  <span key={p} className="bg-white/8 border border-white/15 text-white/85 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-3"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.34s both' : 'none' }}>
                <Link to="/trips"
                  className="group flex items-center gap-2 bg-white hover:bg-slate-50 text-[#1B3A6B] font-black px-8 py-4 rounded-full transition-all duration-200 text-sm"
                  style={{ boxShadow: '0 4px 24px rgba(255,255,255,0.2)' }}>
                  Rechercher un trajet
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link to="/register?role=traveler"
                  className="flex items-center gap-2 border-2 border-white/25 text-white hover:bg-white/8 hover:border-white/40 font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm">
                  💰 Gagner sur mes trajets
                </Link>
              </div>

              <div className="flex items-center gap-6"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.4s both' : 'none' }}>
                {[
                  { icon: Shield, label: 'KYC vérifié', color: 'text-emerald-400' },
                  { icon: Lock,   label: 'Escrow 48h',  color: 'text-blue-400' },
                  { icon: TrendingUp, label: 'Gains garantis', color: 'text-amber-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-white/55 text-sm">
                    <Icon className={`w-4 h-4 ${color}`} aria-hidden />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — vide, le logo est positionné en absolute dans LogoCube3D */}
            <div className="hidden lg:block" aria-hidden="true" />
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/35"
            style={{ animation: 'sm-float 3s ease-in-out infinite' }}>
            <span className="text-xs font-medium">Découvrir</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── Feature bar dark ─────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(90deg, #0a1628 0%, #1B3A6B 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <FeatureMini icon={<Package className="w-5 h-5" />} title="Livraison sécurisée" sub="Paiement escrow jusqu'à confirmation" />
            <FeatureMini icon={<Shield className="w-5 h-5" />} title="Voyageurs vérifiés" sub="Identités contrôlées, avis fiables" />
            <FeatureMini icon={<Clock className="w-5 h-5" />} title="Suivi en temps réel" sub="À chaque étape du trajet" />
            <FeatureMini icon={<HeadphonesIcon className="w-5 h-5" />} title="Support réactif" sub="Notre équipe vous accompagne 7j/7" />
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: 50,   suffix: '+', label: 'Pays desservis' },
              { value: 1200, suffix: '+', label: 'Voyageurs actifs' },
              { value: 98,   suffix: '%', label: 'Satisfaction client' },
              { value: 48,   suffix: 'h', label: 'Délai escrow max' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-3xl sm:text-4xl font-black text-[#1B3A6B]">
                  <AnimCount to={value} suffix={suffix} />
                </span>
                <span className="text-slate-500 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section id="how" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Simple & rapide" title="Comment ça marche ?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Package className="h-5 w-5 text-white" />,
                title: 'Pour les expéditeurs',
                steps: [
                  'Créez votre bagage avec ses dimensions et poids',
                  'Trouvez un trajet vers votre destination',
                  'Réservez et payez en sécurité (escrow)',
                  "Suivez votre colis jusqu'à la livraison",
                ],
                cta: { label: 'Rechercher un trajet', to: '/trips' },
              },
              {
                icon: <Plane className="h-5 w-5 text-white" />,
                title: 'Pour les voyageurs (GP)',
                highlight: {
                  title: '💰 Exemple de gains',
                  items: [
                    { val: '47 250', sub: 'F CFA / colis' },
                    { val: '194 €',  sub: 'en escrow' },
                    { val: '10 kg',  sub: 'à 4 500 F/kg' },
                  ],
                },
                steps: [
                  'Publiez votre trajet et fixez votre prix',
                  'Acceptez les réservations qui vous conviennent',
                  'Transportez les colis — paiement déjà sécurisé',
                  'Recevez votre paiement garanti après livraison',
                ],
                cta: { label: 'Créer mon profil GP', to: '/register?role=traveler' },
              },
            ].map((col, colIdx) => {
              const { ref, visible } = useReveal()
              return (
                <div key={colIdx} ref={ref}
                  className="flex flex-col gap-6 bg-white rounded-[24px] p-8 border border-slate-100"
                  style={{
                    boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(32px)',
                    transition: `opacity 0.5s ease ${colIdx * 120}ms, transform 0.5s ease ${colIdx * 120}ms`,
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1B3A6B] shadow-sm">{col.icon}</div>
                    <h3 className="text-lg font-black text-slate-900">{col.title}</h3>
                  </div>
                  {col.highlight && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-[14px] p-4">
                      <p className="text-sm font-bold text-emerald-800 mb-3">{col.highlight.title}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {col.highlight.items.map(item => (
                          <div key={item.val}>
                            <p className="text-lg font-black text-emerald-700">{item.val}</p>
                            <p className="text-xs text-emerald-600 font-medium">{item.sub}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    {col.steps.map((step, i) => <Step key={i} number={i + 1} text={step} />)}
                  </div>
                  <Link to={col.cta.to}
                    className="self-start flex items-center gap-1.5 text-sm font-bold text-[#1B3A6B] hover:underline group">
                    {col.cta.label}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Nos avantages" title="Pourquoi choisir Safe Move ?"
            sub="La plateforme de confiance pour vos envois Africa ↔ Europe" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard delay={0}   icon={<Shield className="h-6 w-6" />}  title="Sécurisé"   description="KYC obligatoire, paiement escrow 48h, suivi complet et protection contre les fraudes." />
            <FeatureCard delay={80}  icon={<CheckCircle className="h-6 w-6" />} title="Fiable" description="Notation des voyageurs, gestion des litiges dédiée, et support client réactif." />
            <FeatureCard delay={160} icon={<DollarSign className="h-6 w-6" />} title="Économique" description="Tarifs compétitifs, paiement uniquement après livraison confirmée pour les voyageurs." />
          </div>
        </div>
      </section>

      {/* ── Trips ────────────────────────────────────────────── */}
      <section id="trips" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Trajets disponibles" title="Trouvez votre trajet"
            sub="Des voyageurs partent chaque jour vers votre destination" />

          {/* Search bar */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex flex-col sm:flex-row gap-3"
              style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
              <div className="flex items-center flex-1 border border-slate-200 rounded-[10px] px-4 bg-slate-50 min-h-[48px]">
                <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" aria-hidden />
                <CityInputInline value={departure} onChange={setDeparture} placeholder="Ville de départ" />
              </div>
              <div className="flex items-center flex-1 border border-slate-200 rounded-[10px] px-4 bg-slate-50 min-h-[48px]">
                <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" aria-hidden />
                <CityInputInline value={destination} onChange={setDestination} placeholder="Destination" />
              </div>
              <button
                onClick={() => {
                  const p = new URLSearchParams()
                  if (departure)   p.set('departure',   departure)
                  if (destination) p.set('destination', destination)
                  navigate(`/trips?${p.toString()}`)
                }}
                className="bg-[#1B3A6B] hover:bg-[#2351a0] text-white font-bold px-8 py-3 rounded-full text-sm transition-all duration-200 flex items-center gap-2 justify-center shadow-sm hover:shadow-md min-h-[48px]">
                <ArrowRight className="w-4 h-4" /> Rechercher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {isLoading
              ? [1,2,3].map(i => <SkeletonCard key={i} />)
              : preview.length === 0
                ? <div className="col-span-3 text-center py-12 text-slate-400 text-sm">Aucun trajet disponible pour le moment.</div>
                : preview.map(trip => <TripCardPreview key={trip.id} trip={trip} />)
            }
          </div>

          <div className="text-center">
            <button onClick={() => navigate('/trips')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-[#1B3A6B] text-[#1B3A6B] font-bold hover:bg-[#1B3A6B] hover:text-white transition-all duration-200 text-sm group">
              Voir tous les trajets
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Waitlist ──────────────────────────────────────────── */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Soyez parmi les premiers informés</h2>
            <p className="text-slate-500 text-sm">Laissez votre email — on vous contacte au lancement.</p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ── CTA finale dark ───────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #030a18 0%, #0f2544 50%, #1B3A6B 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-7">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white max-w-2xl leading-tight">Prêt à commencer ?</h2>
          <p className="text-blue-100/65 text-base sm:text-lg max-w-lg">
            Rejoignez des milliers d'utilisateurs qui font confiance à Safe Move.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register"
              className="group flex items-center gap-2 bg-white hover:bg-blue-50 text-[#1B3A6B] font-black px-8 py-4 rounded-full transition-all duration-200 text-sm min-h-[52px]"
              style={{ boxShadow: '0 4px 24px rgba(255,255,255,0.15)' }}>
              <Package className="w-4 h-4" /> Envoyer un colis
            </Link>
            <Link to="/register?role=traveler"
              className="flex items-center gap-2 border-2 border-white/25 text-white hover:bg-white/8 hover:border-white/40 font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm min-h-[52px]">
              <Plane className="w-4 h-4" /> Proposer un trajet
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#030a18' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="" className="w-7 h-7 object-contain opacity-50" aria-hidden />
            <span className="font-black text-sm opacity-50 text-white">SAFEMOVE</span>
          </div>
          <p className="text-sm text-white/25 font-medium">© 2026 GP-Valise / Safe Move</p>
          <div className="flex items-center gap-5 text-sm text-white/25">
            {['Conditions', 'Confidentialité', 'Contact'].map(label => (
              <a key={label} href="#" className="hover:text-white/60 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}