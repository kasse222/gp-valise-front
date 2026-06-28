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
  MapPin, Star, Lock, TrendingUp, ChevronDown, User,
} from 'lucide-react'

// ── Scroll reveal hook ───────────────────────────────────────────────────────

function useReveal(threshold = 0.12) {
  const ref     = useRef<HTMLDivElement>(null)
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

// ── Live counter widget ───────────────────────────────────────────────────────

function LiveCounter() {
  const [count, setCount] = useState(2847)
  useEffect(() => {
    const id = setInterval(() => {
      setCount((n) => n + Math.floor(Math.random() * 3))
    }, 3000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="text-white/90 text-sm font-medium">
        <span className="font-bold text-white">{count.toLocaleString('fr-FR')}</span> colis livrés cette semaine
      </span>
    </div>
  )
}

// ── Floating hero mockup ─────────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto" style={{ animation: 'sm-float 4s ease-in-out infinite' }}>
      {/* Main card */}
      <div
        className="bg-white rounded-[24px] p-5 relative overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)' }}
      >
        {/* Subtle top gradient */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[24px]"
          style={{ background: 'linear-gradient(90deg, #1B3A6B, #3b82f6, #60a5fa)' }} aria-hidden />

        <div className="flex items-center justify-between mb-4 pt-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trajet disponible</span>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            Actif
          </span>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#1B3A6B] shadow-sm" />
            <div className="w-px h-10 bg-gradient-to-b from-[#1B3A6B]/40 to-[#3b82f6]/40" />
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-sm" />
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Départ</p>
              <p className="font-bold text-slate-900 text-sm">Casablanca 🇲🇦</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Arrivée</p>
              <p className="font-bold text-slate-900 text-sm">Paris 🇫🇷</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Prix</p>
            <p className="font-black text-[#1B3A6B] text-2xl leading-none">8€</p>
            <p className="text-xs text-slate-400 font-medium">/kg</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 rounded-[14px] p-3 border border-slate-100">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}>Y</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Youssef T.</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs text-slate-400 ml-1 font-medium">4.9</span>
            </div>
          </div>
          <button className="bg-[#1B3A6B] text-white text-xs font-bold px-3 py-2 rounded-full shadow-sm">
            Réserver
          </button>
        </div>
      </div>

      {/* Floating badge top-right */}
      <div
        className="absolute -top-3 -right-3 bg-white rounded-[14px] px-3 py-2 flex items-center gap-2 border border-slate-100"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', animation: 'sm-float 4s ease-in-out infinite 0.5s' }}
      >
        <Lock className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-bold text-slate-700">Paiement sécurisé</span>
      </div>

      {/* Floating badge bottom-left */}
      <div
        className="absolute -bottom-3 -left-3 bg-white rounded-[14px] px-3 py-2 flex items-center gap-2 border border-slate-100"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', animation: 'sm-float 4s ease-in-out infinite 1s' }}
      >
        <CheckCircle className="w-4 h-4 text-[#1B3A6B]" />
        <span className="text-xs font-bold text-slate-700">Livraison confirmée</span>
      </div>
    </div>
  )
}

// ── Trip card preview ─────────────────────────────────────────────────────────

function TripCardPreview({ trip }: { trip: Trip }) {
  const navigate   = useNavigate()
  const currency   = (trip as any).currency ?? 'XOF'
  const kgDispo    = (trip.grams_disponible / 1000).toFixed(1)

  return (
    <div
      className="bg-white border border-slate-100 rounded-[18px] p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <span>{trip.departure}</span>
          <Plane className="w-3 h-3 text-slate-400 shrink-0" aria-hidden />
          <span>{trip.destination}</span>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Actif
        </span>
      </div>

      {trip.date && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          {formatDate(trip.date)}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-black text-[#1B3A6B] text-lg">
          {formatAmount(trip.price_per_kg, currency)}<span className="text-sm font-semibold text-slate-400">/kg</span>
        </span>
        <span className="text-xs text-slate-500">{kgDispo} kg dispo</span>
      </div>

      {trip.user && (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}>
            {trip.user.first_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-xs text-slate-600 font-medium">{trip.user.first_name} {trip.user.last_name?.[0]}.</span>
          {trip.user.kyc_verified && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold ml-auto">
              ✓ KYC
            </span>
          )}
        </div>
      )}

      <button
        className="w-full bg-[#1B3A6B] text-white text-sm font-bold py-3 rounded-full transition-all duration-200 hover:bg-[#2351a0] group-hover:shadow-md"
        onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`) }}
      >
        Voir ce trajet
      </button>
    </div>
  )
}

// ── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description, delay = 0 }: {
  icon: React.ReactNode; title: string; description: string; delay?: number
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className="group bg-white border border-slate-100 rounded-[20px] p-7 flex flex-col gap-5 transition-all duration-300"
      style={{
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.2s ease`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(27,58,107,0.14)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(15,23,42,0.06)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#EBF4FF] border border-[#1B3A6B]/10 transition-all duration-300 group-hover:bg-[#1B3A6B] group-hover:scale-110">
        <div className="text-[#1B3A6B] group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Step ─────────────────────────────────────────────────────────────────────

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex-shrink-0 w-8 h-8 rounded-full text-sm font-black flex items-center justify-center bg-[#1B3A6B] text-white shadow-sm">
        {number}
      </span>
      <p className="text-slate-600 text-sm leading-relaxed pt-1">{text}</p>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className="text-center mb-14 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <span className="inline-block bg-[#EBF4FF] text-[#1B3A6B] text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest border border-[#1B3A6B]/15">
        {eyebrow}
      </span>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h2>
      {sub && <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">{sub}</p>}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [date,      setDate]      = useState('')
  const navigate    = useNavigate()
  const user        = useAuthStore((s) => s.user)
  const dashPath    = user ? (isSender(user.role) ? '/sender' : '/traveler') : null

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

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100"
        style={{ boxShadow: '0 1px 0 0 rgba(226,232,240,0.8)' }}
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-8">
          <Link to="/" className="shrink-0 flex items-center gap-2 group" aria-label="Accueil Safe Move">
            <img src="/logo-icon.png" alt="" className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105" aria-hidden />
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-8 object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                className="text-sm text-slate-600 hover:text-[#1B3A6B] transition-colors font-semibold tracking-tight">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {dashPath ? (
              <Link to={dashPath}
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 min-h-[44px] shadow-sm hover:shadow-md">
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
                  className="flex items-center gap-1.5 bg-[#1B3A6B] hover:bg-[#2351a0] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 min-h-[44px] shadow-sm hover:shadow-md">
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

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-1"
            style={{ animation: 'sm-fade-up 0.2s ease both' }}
          >
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-slate-700 hover:text-[#1B3A6B] py-3 min-h-[44px] flex items-center font-semibold border-b border-slate-50 last:border-0">
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link to="/login" className="flex-1 text-center py-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full">
                Connexion
              </Link>
              <Link to="/register" className="flex-1 text-center py-3 text-sm font-bold text-white bg-[#1B3A6B] rounded-full">
                S'inscrire
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative pt-[70px] min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #050d1a 0%, #0a1628 30%, #0f2544 65%, #1B3A6B 100%)' }}
        aria-label="Bannière principale"
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} aria-hidden />

        {/* Blue glow orbs */}
        <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(60px)' }} aria-hidden />
        <div className="absolute bottom-1/4 left-[5%] w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', filter: 'blur(40px)' }} aria-hidden />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div
              className="flex flex-col gap-7"
              style={{
                opacity:   mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              {/* Live counter */}
              <div style={{ animationDelay: '100ms' }}>
                <LiveCounter />
              </div>

              {/* Badge */}
              <div className="self-start flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.05s both' : 'none' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                <span className="text-white/90 text-sm font-semibold">Plateforme active · Sénégal · Maroc · France</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black text-white leading-[1.08] tracking-tight"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.1s both' : 'none' }}>
                Envoyez vos colis via{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  des voyageurs
                </span>{' '}
                de confiance
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-blue-100/75 leading-relaxed max-w-lg"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.18s both' : 'none' }}>
                Connectez expéditeurs et voyageurs africains. Paiement escrow garanti, identités vérifiées, suivi en temps réel.
              </p>

              {/* Country pills */}
              <div className="flex flex-wrap gap-2"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.26s both' : 'none' }}>
                {['🇸🇳 Sénégal', '🇲🇦 Maroc', '🇫🇷 France', "🇨🇮 Côte d'Ivoire", '🇧🇯 Bénin'].map(p => (
                  <span key={p} className="bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {p}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-3"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.34s both' : 'none' }}>
                <Link to="/trips"
                  className="group relative flex items-center gap-2 bg-white hover:bg-blue-50 text-[#1B3A6B] font-black px-8 py-4 rounded-full transition-all duration-200 text-sm overflow-hidden"
                  style={{ boxShadow: '0 4px 24px rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.2)' }}>
                  Rechercher un trajet
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link to="/register?role=traveler"
                  className="flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm backdrop-blur-sm">
                  💰 Gagner sur mes trajets
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-5 pt-1"
                style={{ animation: mounted ? 'sm-fade-up 0.6s ease 0.42s both' : 'none' }}>
                {[
                  { icon: Shield, label: 'KYC vérifié', color: 'text-emerald-400' },
                  { icon: Lock,   label: 'Escrow 48h',  color: 'text-blue-400' },
                  { icon: TrendingUp, label: 'Gains garantis', color: 'text-amber-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-white/60 text-sm">
                    <Icon className={`w-4 h-4 ${color}`} aria-hidden />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mockup */}
            <div className="hidden lg:flex items-center justify-center pr-4"
              style={{
                opacity:   mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
              }}>
              <HeroMockup />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
            style={{ animation: 'sm-float 3s ease-in-out infinite' }}>
            <span className="text-xs font-medium">Découvrir</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(90deg, #0a1628 0%, #1B3A6B 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: 50,    suffix: '+', label: 'Pays desservis' },
              { value: 1200,  suffix: '+', label: 'Voyageurs actifs' },
              { value: 98,    suffix: '%', label: 'Satisfaction client' },
              { value: 48,    suffix: 'h', label: 'Délai escrow max' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  <AnimCount to={value} suffix={suffix} />
                </span>
                <span className="text-blue-200/70 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="how" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Simple & rapide" title="Comment ça marche ?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {[
              {
                icon: <Package className="h-5 w-5 text-white" />,
                title: 'Pour les expéditeurs',
                steps: [
                  'Créez votre bagage avec ses dimensions et poids',
                  'Trouvez un trajet qui correspond à votre destination',
                  'Réservez et payez en toute sécurité (escrow)',
                  "Suivez votre colis jusqu'à la livraison",
                ],
                cta: { label: 'Rechercher un trajet', to: '/trips' },
              },
              {
                icon: <Plane className="h-5 w-5 text-white" />,
                title: 'Pour les voyageurs (GP)',
                highlight: {
                  title: '💰 Gains réels — exemple',
                  items: [
                    { val: '47 250', sub: 'F CFA / colis' },
                    { val: '194 €',  sub: 'en escrow' },
                    { val: '10 kg',  sub: 'à 4 500 F/kg' },
                  ],
                },
                steps: [
                  'Publiez votre trajet et fixez votre prix — vous gardez vos clients',
                  'Acceptez les réservations qui vous conviennent',
                  'Transportez les colis — paiement déjà sécurisé en escrow',
                  'Recevez votre paiement garanti après livraison confirmée',
                ],
                cta: { label: 'Créer mon profil GP', to: '/register?role=traveler' },
              },
            ].map((col, colIdx) => {
              const { ref, visible } = useReveal()
              return (
                <div
                  key={colIdx}
                  ref={ref}
                  className="flex flex-col gap-6 bg-slate-50 rounded-[24px] p-8 border border-slate-100"
                  style={{
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(32px)',
                    transition: `opacity 0.5s ease ${colIdx * 120}ms, transform 0.5s ease ${colIdx * 120}ms`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1B3A6B] shadow-sm">
                      {col.icon}
                    </div>
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
                    {col.steps.map((step, i) => (
                      <Step key={i} number={i + 1} text={step} />
                    ))}
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

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Nos avantages"
            title="Pourquoi choisir Safe Move ?"
            sub="La plateforme de confiance pour vos envois Africa ↔ Europe"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard delay={0}
              icon={<Shield className="h-6 w-6" />}
              title="Sécurisé"
              description="KYC obligatoire, paiement escrow 48h, suivi complet et protection contre les fraudes." />
            <FeatureCard delay={80}
              icon={<CheckCircle className="h-6 w-6" />}
              title="Fiable"
              description="Notation des voyageurs, gestion des litiges dédiée, et support client réactif." />
            <FeatureCard delay={160}
              icon={<DollarSign className="h-6 w-6" />}
              title="Économique"
              description="Tarifs compétitifs, paiement uniquement après livraison confirmée pour les voyageurs." />
          </div>
        </div>
      </section>

      {/* ── Trips preview ─────────────────────────────────────────── */}
      <section id="trips" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Trajets disponibles"
            title="Trouvez votre trajet"
            sub="Des voyageurs partent chaque jour vers votre destination"
          />

          {/* Search bar */}
          <div className="max-w-3xl mx-auto mb-10">
            <div
              className="bg-white border border-slate-200 rounded-[20px] p-4 flex flex-col sm:flex-row gap-3"
              style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}
            >
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
                  if (date)        p.set('date',        date)
                  navigate(`/trips?${p.toString()}`)
                }}
                className="sm:w-auto bg-[#1B3A6B] hover:bg-[#2351a0] text-white font-bold px-8 py-3 rounded-full text-sm transition-all duration-200 flex items-center gap-2 justify-center shadow-sm hover:shadow-md min-h-[48px]"
              >
                <ArrowRight className="w-4 h-4" />
                Rechercher
              </button>
            </div>
          </div>

          {/* Trip cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 sm-stagger">
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

      {/* ── Waitlist ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Soyez parmi les premiers informés</h2>
            <p className="text-slate-500 text-sm">Laissez votre email — on vous contacte au lancement.</p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ── CTA finale ───────────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #050d1a 0%, #0f2544 50%, #1B3A6B 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-7">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white max-w-2xl leading-tight">
            Prêt à commencer ?
          </h2>
          <p className="text-blue-100/70 text-base sm:text-lg max-w-lg">
            Rejoignez des milliers d'utilisateurs qui font confiance à Safe Move pour leurs envois internationaux.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register"
              className="group flex items-center gap-2 bg-white hover:bg-blue-50 text-[#1B3A6B] font-black px-8 py-4 rounded-full transition-all duration-200 text-sm min-h-[52px]"
              style={{ boxShadow: '0 4px 24px rgba(255,255,255,0.2)' }}>
              <Package className="w-4 h-4" />
              Envoyer un colis
            </Link>
            <Link to="/register?role=traveler"
              className="flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm min-h-[52px] backdrop-blur-sm">
              <Plane className="w-4 h-4" />
              Proposer un trajet
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#050d1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.07]">
          <Link to="/" aria-label="Accueil Safe Move">
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-8 opacity-60 hover:opacity-90 transition-opacity" />
          </Link>
          <p className="text-sm text-white/30 font-medium">© 2026 GP-Valise / Safe Move</p>
          <div className="flex items-center gap-5 text-sm text-white/30">
            {[
              { label: 'Conditions', href: '#' },
              { label: 'Confidentialité', href: '#' },
              { label: 'WhatsApp', href: 'https://wa.me/212600000000' },
              { label: 'Contact', href: 'mailto:contact@safemove.tech' },
            ].map(link => (
              <a key={link.label} href={link.href}
                className="hover:text-white transition-colors"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}