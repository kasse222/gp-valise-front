import { useState, useEffect, useRef, useCallback } from 'react'
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

// ── Hero Premium — toutes les couches ───────────────────────────────────────
// Couches : grille tech → glow radial → anneaux SVG → particules → cube logo
// + parallaxe souris + flottement

function LogoCube3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cubeRef      = useRef<HTMLDivElement>(null)

  // Parallaxe souris — inclinaison légère du cube
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cubeRef.current) return
    const rect    = containerRef.current.getBoundingClientRect()
    const cx      = rect.left + rect.width  / 2
    const cy      = rect.top  + rect.height / 2
    const dx      = (e.clientX - cx) / (rect.width  / 2)
    const dy      = (e.clientY - cy) / (rect.height / 2)
    const rotX    = -dy * 10
    const rotY    =  dx * 10
    cubeRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!cubeRef.current) return
    cubeRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }, [])

  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative hidden lg:flex items-center justify-center"
      style={{
        width: 480, height: 480,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}
      role="img"
      aria-label="Logo SafeMove animé"
    >
      {/* ── Couche 1 : Carte du monde SVG très discrète ── */}
      <svg
        viewBox="0 0 480 480"
        width="480" height="480"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.07 }}
      >
        {/* Grille tech */}
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(96,165,250,1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="480" height="480" fill="url(#grid)" />
        {/* Points de nœuds tech */}
        {[
          [80,80],[160,60],[240,90],[320,70],[400,100],
          [60,180],[140,160],[220,200],[300,170],[420,190],
          [90,280],[170,260],[250,290],[350,265],[440,280],
          [70,380],[150,360],[240,380],[330,370],[410,360],
        ].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#60a5fa" opacity="0.8"/>
        ))}
        {/* Lignes de connexion */}
        {[
          '80,80 160,60', '160,60 240,90', '240,90 320,70', '320,70 400,100',
          '60,180 140,160', '140,160 220,200', '220,200 300,170',
          '80,80 60,180', '160,60 140,160', '240,90 220,200', '320,70 300,170',
          '90,280 170,260', '170,260 250,290', '250,290 350,265',
          '60,180 90,280', '140,160 170,260', '220,200 250,290',
          '70,380 150,360', '150,360 240,380', '240,380 330,370',
          '90,280 70,380', '170,260 150,360', '250,290 240,380',
        ].map((pts, i) => (
          <line key={i}
            x1={pts.split(' ')[0].split(',')[0]} y1={pts.split(' ')[0].split(',')[1]}
            x2={pts.split(' ')[1].split(',')[0]} y2={pts.split(' ')[1].split(',')[1]}
            stroke="#3b82f6" strokeWidth="0.4" opacity="0.6"
          />
        ))}
      </svg>

      {/* ── Couche 2 : Halo radial derrière le cube ── */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          inset: 0,
          background: [
            'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(59,130,246,0.22) 0%, transparent 70%)',
          ].join(','),
        }}
      />

      {/* ── Couche 3 : Anneaux SVG lumineux ── */}
      <svg
        viewBox="0 0 480 480"
        width="480" height="480"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ring-glow-lg">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Anneau externe — tourne lentement */}
        <g style={{ transformOrigin: '240px 240px', animation: 'sm-spin-slow 25s linear infinite' }}>
          <ellipse cx="240" cy="240" rx="210" ry="70"
            fill="none" stroke="#3b82f6" strokeWidth="1"
            opacity="0.3" filter="url(#ring-glow)"
            transform="rotate(-20, 240, 240)"
          />
        </g>

        {/* Anneau moyen — sens inverse */}
        <g style={{ transformOrigin: '240px 240px', animation: 'sm-spin-slow 18s linear infinite reverse' }}>
          <ellipse cx="240" cy="240" rx="175" ry="55"
            fill="none" stroke="#60a5fa" strokeWidth="1.5"
            opacity="0.4" filter="url(#ring-glow)"
            transform="rotate(15, 240, 240)"
          />
          {/* Point lumineux sur l'anneau moyen */}
          <circle cx="415" cy="240" r="4" fill="#60a5fa" opacity="0.9" filter="url(#ring-glow)"/>
        </g>

        {/* Anneau intérieur — luisant */}
        <g style={{ transformOrigin: '240px 240px', animation: 'sm-spin-slow 12s linear infinite' }}>
          <ellipse cx="240" cy="240" rx="140" ry="44"
            fill="none" stroke="#93c5fd" strokeWidth="2"
            opacity="0.5" filter="url(#ring-glow-lg)"
            transform="rotate(-30, 240, 240)"
          />
          <circle cx="100" cy="240" r="5" fill="#93c5fd" opacity="0.95" filter="url(#ring-glow-lg)"/>
        </g>

        {/* Anneau bas — plasma néon */}
        <g style={{ transformOrigin: '240px 280px' }}>
          <ellipse cx="240" cy="370" rx="120" ry="22"
            fill="none" stroke="#3b82f6" strokeWidth="2"
            opacity="0.5" filter="url(#ring-glow-lg)"
            style={{ animation: 'sm-pulse-glow 2.5s ease-in-out infinite' }}
          />
        </g>
      </svg>

      {/* ── Couche 4 : Particules orbitales animées ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[
          { top: '8%',  left: '48%', size: 4,   delay: '0s',    dur: '3s',   color: '#60a5fa' },
          { top: '20%', left: '88%', size: 3,   delay: '0.5s',  dur: '2.5s', color: '#93c5fd' },
          { top: '75%', left: '90%', size: 3.5, delay: '1s',    dur: '4s',   color: '#3b82f6' },
          { top: '88%', left: '48%', size: 4,   delay: '1.5s',  dur: '3.5s', color: '#60a5fa' },
          { top: '75%', left: '8%',  size: 3,   delay: '0.8s',  dur: '2.8s', color: '#93c5fd' },
          { top: '20%', left: '10%', size: 3.5, delay: '0.3s',  dur: '3.2s', color: '#3b82f6' },
          { top: '50%', left: '92%', size: 2.5, delay: '1.2s',  dur: '2.2s', color: '#bfdbfe' },
          { top: '42%', left: '5%',  size: 2.5, delay: '0.6s',  dur: '3.8s', color: '#bfdbfe' },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: p.top, left: p.left,
              width:  p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}80`,
              animation: `sm-float ${p.dur} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Couche 5 : Le cube logo avec perspective 3D ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          perspective: '800px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          ref={cubeRef}
          style={{
            transition: 'transform 0.3s ease',
            animation: 'sm-float 4s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}
        >
          <img
            src="/logo-icon.png"
            alt="SafeMove"
            style={{
              width: 240,
              height: 240,
              objectFit: 'contain',
              display: 'block',
              filter: [
                'drop-shadow(0 0 20px rgba(59,130,246,0.7))',
                'drop-shadow(0 0 40px rgba(59,130,246,0.4))',
                'drop-shadow(0 0 60px rgba(59,130,246,0.2))',
                'drop-shadow(0 20px 30px rgba(0,0,0,0.6))',
              ].join(' '),
            }}
          />
        </div>
      </div>

      {/* ── Ombre douce sous le cube ── */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 180,
          height: 24,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.18)',
          filter: 'blur(14px)',
          animation: 'sm-float 4s ease-in-out infinite',
        }}
      />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

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

            {/* Right — logo premium */}
            <LogoCube3D />
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