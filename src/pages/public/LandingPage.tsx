import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTrips } from '@/api/trips'
import { useAuthStore, isSender } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import type { Trip } from '@/types'
import { WaitlistForm, SkeletonCard } from '@/components/ui'
import { CityInputInline } from '@/components/ui/CitySelect'
import {
  User, Package, Plane, Shield, CheckCircle,
  DollarSign, Calendar, Menu, X, ArrowRight,
  MapPin, Star, TrendingUp, Lock,
} from 'lucide-react'

// ─── Animations CSS injectées ────────────────────────────────────────────
const ANIM_STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideRight {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
.anim-fade-up   { animation: fadeUp 0.7s ease both; }
.anim-fade-in   { animation: fadeIn 0.5s ease both; }
.anim-slide-r   { animation: slideRight 0.6s ease both; }
.anim-float     { animation: float 4s ease-in-out infinite; }
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }
`

// ─── Step ──────────────────────────────────────────────────────────────────
function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center bg-[#EBF4FF] text-[#1B3A6B]">
        {number}
      </span>
      <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{text}</p>
    </div>
  )
}

// ─── Feature Card ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group bg-white border border-gray-100 rounded-[20px] shadow-sm p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EBF4FF] group-hover:bg-[#1B3A6B] transition-colors duration-300">
        <div className="text-[#1B3A6B] group-hover:text-white transition-colors duration-300">{icon}</div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── Trip Card Preview ─────────────────────────────────────────────────────
function TripCardPreview({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white border border-gray-200 rounded-[14px] p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
        <span>{trip.departure}</span>
        <Plane className="w-3 h-3 text-gray-400 shrink-0" aria-hidden />
        <span>{trip.destination}</span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        {trip.date && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden />
            {formatDate(trip.date)}
          </span>
        )}
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1B3A6B]">{(trip.price_per_kg / 100).toFixed(2)} €/kg</span>
          <span className="text-gray-300" aria-hidden>·</span>
          <span>{(trip.grams_disponible / 1000).toFixed(1)} kg dispo</span>
        </div>
        {trip.user?.full_name && <span className="text-gray-400 text-xs">Par {trip.user.full_name}</span>}
      </div>
      <button
        onClick={() => navigate(`/trips/${trip.id}`)}
        className="w-full mt-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-semibold px-4 py-3 rounded-full transition-colors duration-200 min-h-[48px]"
      >
        Voir ce trajet
      </button>
    </div>
  )
}

// ─── Mockup UI flottant ───────────────────────────────────────────────────
function HeroMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto anim-float">
      {/* Card principale */}
      <div className="bg-white rounded-[24px] shadow-2xl p-5 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trajet disponible</span>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">Actif</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-[#1B3A6B]" />
            <div className="w-0.5 h-8 bg-gray-200 my-1" />
            <div className="w-3 h-3 rounded-full bg-[#2B6CB0]" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <p className="text-xs text-gray-400">Départ</p>
              <p className="font-semibold text-gray-900 text-sm">Casablanca 🇲🇦</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Arrivée</p>
              <p className="font-semibold text-gray-900 text-sm">Paris 🇫🇷</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Prix</p>
            <p className="font-bold text-[#1B3A6B] text-lg">8€/kg</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-[10px] p-3">
          <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold">Y</div>
          <div>
            <p className="text-xs font-semibold text-gray-900">Youssef T.</p>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
              <span className="text-xs text-gray-400 ml-1">4.9</span>
            </div>
          </div>
          <button className="ml-auto bg-[#1B3A6B] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            Réserver
          </button>
        </div>
      </div>

      {/* Badge flottant — escrow */}
      <div className="absolute -top-4 -right-4 bg-white rounded-[12px] shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
        <Lock className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-semibold text-gray-700">Paiement sécurisé</span>
      </div>

      {/* Badge flottant — livraison */}
      <div className="absolute -bottom-4 -left-4 bg-white rounded-[12px] shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
        <CheckCircle className="w-4 h-4 text-[#1B3A6B]" />
        <span className="text-xs font-semibold text-gray-700">Livraison confirmée</span>
      </div>
    </div>
  )
}

// ─── Stat ─────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl sm:text-4xl font-bold text-white">{value}</span>
      <span className="text-blue-200 text-sm">{label}</span>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const navigate = useNavigate()

  const [departure,   setDeparture]   = useState('')
  const [destination, setDestination] = useState('')
  const [date,        setDate]        = useState('')

  useEffect(() => { setMounted(true) }, [])

  const user          = useAuthStore((s) => s.user)
  const dashboardPath = user ? isSender(user.role) ? '/sender' : '/traveler' : null

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips-public'],
    queryFn: () => getTrips(),
    staleTime: 60_000,
  })
  const previewTrips = trips?.slice(0, 3) ?? []

  const navLinks = [
    { label: 'Accueil',           href: '/' },
    { label: 'Comment ça marche', href: '#how-it-works' },
    { label: 'Nos services',      href: '#features' },
    { label: 'Tarifs',            href: '#pricing' },
  ]

  return (
    <div className="min-h-screen font-sans">
      <style>{ANIM_STYLES}</style>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="shrink-0" aria-label="Accueil Safe Move">
            <img src="/logo-icon.png" alt="" className="w-9 h-9 object-contain" aria-hidden /><img src="/logo-nav-hori.png" alt="Safe Move" className="h-10 object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                className="text-sm text-gray-600 hover:text-[#1B3A6B] transition-colors font-medium">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {dashboardPath ? (
              <Link to={dashboardPath}
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors min-h-[48px]">
                <User className="h-4 w-4" aria-hidden />
                Mon espace
              </Link>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors min-h-[48px]">
                <User className="h-4 w-4" aria-hidden />
                Se connecter
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-[#1B3A6B] py-2.5 min-h-[44px] flex items-center font-medium">
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero — split layout ────────────────────────────────────── */}
      <section
        className="relative pt-20 min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2544 40%, #1b3a6b 80%, #1e4a8a 100%)' }}
        aria-label="Bannière principale"
      >
        {/* Fond particules / grille */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} aria-hidden />
        {/* Lueur bleue */}
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}
          aria-hidden />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Colonne gauche — texte ──────────────────────────── */}
            <div className={`flex flex-col gap-6 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}>

              {/* Badge */}
              <div className="anim-fade-in delay-100 self-start flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-sm font-medium">Plateforme active · Sénégal · Maroc · France</span>
              </div>

              {/* Titre */}
              <h1 className="anim-fade-up delay-200 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Envoyez vos colis via{' '}
                <span style={{ background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  des voyageurs
                </span>{' '}
                de confiance
              </h1>

              {/* Sous-titre */}
              <p className="anim-fade-up delay-300 text-lg text-blue-100/80 leading-relaxed max-w-lg">
                Vous voyagez entre Dakar, Casablanca, Paris ou Abidjan ? Transportez des colis en toute sécurité et gagnez de l'argent sur chaque trajet. Paiement garanti après livraison.
              </p>

              {/* Badges pays */}
              <div className="anim-fade-up delay-400 flex flex-wrap gap-2">
                {['🇸🇳 Sénégal', '🇲🇦 Maroc', '🇫🇷 France', '🇨🇮 Côte d\'Ivoire', '🇧🇯 Bénin'].map((pays) => (
                  <span key={pays} className="bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
                    {pays}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="anim-fade-up delay-500 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link to="/trips"
                  className="group flex items-center gap-2 bg-white hover:bg-[#EBF4FF] text-[#1B3A6B] font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm shadow-lg hover:shadow-xl min-h-[52px]">
                  Rechercher un trajet
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/register?role=traveler"
                  className="flex items-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-semibold px-8 py-4 rounded-full transition-all duration-200 text-sm min-h-[52px]">
                  💰 Gagner sur mes trajets
                </Link>
              </div>

              {/* Stats */}
              <div className="anim-fade-up delay-600 flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>KYC vérifié</span>
                </div>
                <span className="text-white/20">·</span>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Escrow 48h</span>
                </div>
                <span className="text-white/20">·</span>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Gains garantis</span>
                </div>
              </div>
            </div>

            {/* ── Colonne droite — mockup ─────────────────────────── */}
            <div className={`hidden lg:flex items-center justify-center ${mounted ? 'anim-fade-in delay-300' : 'opacity-0'}`}>
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(90deg, #0f2544 0%, #1b3a6b 100%)' }}
        className="border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <Stat value="50+"     label="Pays desservis" />
            <Stat value="Gratuit" label="Inscription" />
            <Stat value="Escrow"  label="Paiement sécurisé" />
            <Stat value="KYC"     label="Identités vérifiées" />
          </div>
        </div>
      </section>

      {/* ── Waitlist ────────────────────────────────────────────────── */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Soyez parmi les premiers informés</h2>
            <p className="text-gray-500 text-sm">Laissez votre email — on vous contacte au lancement.</p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ── Comment ça marche ──────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#EBF4FF] text-[#1B3A6B] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Simple & rapide</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Comment ça marche ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div className="flex flex-col gap-6 bg-gray-50 rounded-[20px] p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1B3A6B]">
                  <Package className="h-5 w-5 text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pour les expéditeurs</h3>
              </div>
              <div className="flex flex-col gap-4 pl-2">
                <Step number={1} text="Créez votre bagage avec ses dimensions et poids" />
                <Step number={2} text="Trouvez un trajet qui correspond à votre destination" />
                <Step number={3} text="Réservez et payez en toute sécurité (escrow)" />
                <Step number={4} text="Suivez votre colis jusqu'à la livraison" />
              </div>
              <Link to="/trips" className="self-start flex items-center gap-1.5 text-sm font-semibold text-[#1B3A6B] hover:underline">
                Rechercher un trajet <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-6 bg-gray-50 rounded-[20px] p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1B3A6B]">
                  <Plane className="h-5 w-5 text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pour les voyageurs (GP)</h3>
              </div>

              {/* Earnings highlight */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-[14px] p-4">
                <p className="text-sm font-bold text-emerald-800 mb-1">💰 Exemple de gains réels</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-emerald-700">47 250</p>
                    <p className="text-xs text-emerald-600">F CFA / colis</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-700">194 €</p>
                    <p className="text-xs text-emerald-600">en escrow</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-700">10 kg</p>
                    <p className="text-xs text-emerald-600">à 4 500 F/kg</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pl-2">
                <Step number={1} text="Publiez votre trajet et fixez votre prix au kilo — vous gardez vos clients" />
                <Step number={2} text="Acceptez les réservations qui vous conviennent" />
                <Step number={3} text="Transportez les colis — le paiement est déjà sécurisé en escrow" />
                <Step number={4} text="Recevez votre paiement garanti après confirmation de livraison" />
              </div>
              <Link to="/register?role=traveler" className="self-start flex items-center gap-1.5 text-sm font-semibold text-[#1B3A6B] hover:underline">
                Créer mon profil GP <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#EBF4FF] text-[#1B3A6B] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Nos avantages</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Pourquoi choisir Safe Move ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={<Shield className="h-6 w-6" />} title="Sécurisé" description="KYC, paiement sécurisé avec système escrow 48h, et suivi complet de chaque transaction" />
            <FeatureCard icon={<CheckCircle className="h-6 w-6" />} title="Fiable" description="Système de notation, gestion des litiges, et support client disponible" />
            <FeatureCard icon={<DollarSign className="h-6 w-6" />} title="Économique" description="Tarifs compétitifs, paiement uniquement après livraison confirmée pour les voyageurs" />
          </div>
        </div>
      </section>

      {/* ── Recherche preview ───────────────────────────────────────── */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="inline-block bg-[#EBF4FF] text-[#1B3A6B] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Trajets disponibles</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Trouvez votre trajet</h2>
            <p className="text-gray-500 text-sm">Des voyageurs partent chaque jour vers votre destination</p>
          </div>

          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-md">
            <div className="p-5 flex flex-col gap-4 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center flex-1 border border-gray-200 rounded-[10px] px-4 bg-white min-h-[48px]">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <CityInputInline value={departure} onChange={setDeparture} placeholder="Ville de départ" />
                </div>
                <div className="flex items-center flex-1 border border-gray-200 rounded-[10px] px-4 bg-white min-h-[48px]">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <CityInputInline value={destination} onChange={setDestination} placeholder="Destination" />
                </div>
                <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-[10px] px-4 bg-white min-h-[48px]">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    aria-label="Date de départ" className="bg-transparent text-sm text-gray-700 outline-none w-full" />
                </div>
              </div>
              <button
                onClick={() => {
                  const params = new URLSearchParams()
                  if (departure)   params.set('departure',   departure)
                  if (destination) params.set('destination', destination)
                  if (date)        params.set('date',        date)
                  navigate(`/trips?${params.toString()}`)
                }}
                className="w-full sm:w-auto self-center bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-10 py-3 rounded-full text-sm transition-colors min-h-[48px] flex items-center gap-2 justify-center"
              >
                <ArrowRight className="w-4 h-4" />
                Rechercher
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isLoading ? (
                <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
              ) : previewTrips.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500 text-sm">Aucun trajet disponible pour le moment.</div>
              ) : (
                previewTrips.map((trip) => <TripCardPreview key={trip.id} trip={trip} />)
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <button onClick={() => navigate('/trips')}
              className="px-6 py-3 rounded-full border-2 border-[#1B3A6B] text-[#1B3A6B] font-semibold hover:bg-[#1B3A6B] hover:text-white transition-colors text-sm min-h-[48px]">
              Voir tous les trajets →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F2544 0%, #1B3A6B 100%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
          aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Prêt à commencer ?</h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-xl">Rejoignez des milliers d'utilisateurs qui font confiance à Safe Move pour leurs envois internationaux.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register"
              className="bg-white hover:bg-[#EBF4FF] font-semibold px-8 py-4 rounded-full transition-colors text-sm text-[#1B3A6B] min-h-[52px] flex items-center gap-2 shadow-lg">
              <Package className="w-4 h-4" />
              Envoyer un colis
            </Link>
            <Link to="/register?role=traveler"
              className="border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-semibold px-8 py-4 rounded-full transition-colors text-sm min-h-[52px] flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Proposer un trajet
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="text-white" style={{ backgroundColor: '#0F2544' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <Link to="/" aria-label="Accueil Safe Move">
            <img src="/logo-blanc.png" alt="Safe Move" className="h-8" />
          </Link>
          <p className="text-sm text-white/50">© 2026 GP-Valise / Safe Move. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <span className="text-white/20">·</span>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <span className="text-white/20">·</span>
            <a href="https://wa.me/212600000000" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <span className="text-white/20">·</span>
            <a href="mailto:contact@safemove.tech" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}