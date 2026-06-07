import { useState } from 'react'
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
  DollarSign, Calendar, Menu, X,
} from 'lucide-react'

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

function FeatureCard({
  icon, title, description,
}: {
  icon:        React.ReactNode
  title:       string
  description: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-[14px] shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EBF4FF]">
        {icon}
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
    <div className="bg-white border border-gray-200 rounded-[14px] p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
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
          <span className="font-bold text-[#1B3A6B]">
            {(trip.price_per_kg / 100).toFixed(2)} €/kg
          </span>
          <span className="text-gray-300" aria-hidden>·</span>
          <span>{(trip.grams_disponible / 1000).toFixed(1)} kg dispo</span>
        </div>
        {trip.user?.full_name && (
          <span className="text-gray-400 text-xs">Par {trip.user.full_name}</span>
        )}
      </div>

      {/* FIX : navigate vers le bon trip, pas vers /trips */}
      <button
        onClick={() => navigate(`/trips/${trip.id}`)}
        className="w-full mt-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-semibold px-4 py-3 rounded-full transition-colors duration-200 min-h-[48px]"
      >
        Voir ce trajet
      </button>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const [departure,   setDeparture]   = useState('')
  const [destination, setDestination] = useState('')
  const [date,        setDate]        = useState('')

  const user          = useAuthStore((s) => s.user)
  const dashboardPath = user
    ? isSender(user.role) ? '/sender' : '/traveler'
    : null

  const { data: trips, isLoading } = useQuery({
    queryKey:  ['trips-public'],
    queryFn:   getTrips,
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

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

          {/* FIX : logo dans un Link */}
          <Link to="/" className="shrink-0" aria-label="Accueil Safe Move">
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-16" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-600 hover:text-[#1B3A6B] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {dashboardPath ? (
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 min-h-[48px]"
              >
                <User className="h-4 w-4" aria-hidden />
                Mon espace
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 min-h-[48px]"
              >
                <User className="h-4 w-4" aria-hidden />
                Se connecter
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-[#1B3A6B] transition-colors py-2.5 min-h-[44px] flex items-center"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="relative pt-20 min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=75&fm=webp')",
        }}
        aria-label="Bannière principale"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(15,37,68,0.96) 0%, rgba(27,58,107,0.92) 50%, rgba(43,108,176,0.88) 100%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-8">
          <div className="flex flex-col gap-4 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Transportez vos bagages en toute confiance
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed">
              Connectez-vous avec des voyageurs de confiance pour envoyer vos colis partout dans le monde
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/trips"
              className="bg-white hover:bg-[#EBF4FF] font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm text-[#1B3A6B] min-h-[48px] flex items-center"
            >
              Rechercher un trajet
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm min-h-[48px] flex items-center"
            >
              Devenir transporteur
            </Link>
          </div>
        </div>
      </section>

      {/* ── Waitlist — juste après le hero ────────────────────────────── */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Soyez parmi les premiers informés
            </h2>
            <p className="text-gray-500 text-sm">
              Laissez votre email — on vous contacte au lancement.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-14">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            {/* Expéditeur */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EBF4FF]">
                  <Package className="h-5 w-5 text-[#1B3A6B]" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pour les expéditeurs</h3>
              </div>
              <div className="flex flex-col gap-4 pl-2">
                <Step number={1} text="Créez votre bagage avec ses dimensions et poids" />
                <Step number={2} text="Trouvez un trajet qui correspond à votre destination" />
                <Step number={3} text="Réservez et payez en toute sécurité (escrow)" />
                <Step number={4} text="Suivez votre colis jusqu'à la livraison" />
              </div>
              <Link
                to="/trips"
                className="self-start text-sm font-semibold text-[#1B3A6B] hover:underline"
              >
                Rechercher un trajet →
              </Link>
            </div>

            {/* Voyageur */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EBF4FF]">
                  <Plane className="h-5 w-5 text-[#1B3A6B]" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pour les voyageurs</h3>
              </div>
              <div className="flex flex-col gap-4 pl-2">
                <Step number={1} text="Publiez votre trajet avec la capacité disponible" />
                <Step number={2} text="Acceptez les réservations qui vous conviennent" />
                <Step number={3} text="Transportez les bagages en toute sécurité" />
                <Step number={4} text="Recevez votre paiement après confirmation de livraison" />
              </div>
              <Link
                to="/register?role=traveler"
                className="self-start text-sm font-semibold text-[#1B3A6B] hover:underline"
              >
                Devenir transporteur →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi GP-Valise ────────────────────────────────────────── */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-14">
            Pourquoi GP-Valise ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-[#1B3A6B]" aria-hidden />}
              title="Sécurisé"
              description="KYC, paiement sécurisé avec système escrow 48h, et suivi complet de chaque transaction"
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-[#1B3A6B]" aria-hidden />}
              title="Fiable"
              description="Système de notation, gestion des litiges, et support client disponible"
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-[#1B3A6B]" aria-hidden />}
              title="Économique"
              description="Tarifs compétitifs, paiement uniquement après livraison confirmée pour les voyageurs"
            />
          </div>
        </div>
      </section>

      {/* ── Recherche preview ─────────────────────────────────────────── */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Rechercher un trajet disponible
            </h2>
            <p className="text-gray-500 mb-10 text-sm">
              Trouvez des voyageurs partant vers votre destination
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center flex-1 border border-gray-200 rounded-[10px] px-4 bg-gray-50 min-h-[48px]">
                  <CityInputInline
                    value={departure}
                    onChange={setDeparture}
                    placeholder="Ville de départ"
                  />
                </div>
                <div className="flex items-center flex-1 border border-gray-200 rounded-[10px] px-4 bg-gray-50 min-h-[48px]">
                  <CityInputInline
                    value={destination}
                    onChange={setDestination}
                    placeholder="Destination"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-[10px] px-4 bg-gray-50 min-h-[48px]">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Date de départ"
                    className="bg-transparent text-sm text-gray-700 outline-none w-full"
                  />
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
                className="w-full sm:w-auto self-center bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-10 py-3 rounded-full text-sm transition-colors duration-200 min-h-[48px]"
              >
                Rechercher
              </button>
            </div>

            <div className="border-t border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : previewTrips.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500 text-sm">
                  Aucun trajet disponible pour le moment.
                </div>
              ) : (
                previewTrips.map((trip) => (
                  <TripCardPreview key={trip.id} trip={trip} />
                ))
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/trips')}
              className="px-6 py-3 rounded-full border-2 border-[#1B3A6B] text-[#1B3A6B] font-semibold hover:bg-[#1B3A6B] hover:text-white transition-colors text-sm min-h-[48px]"
            >
              Voir tous les trajets disponibles →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #0F2544 0%, #1B3A6B 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Prêt à commencer ?</h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-xl">
            Rejoignez des milliers d'utilisateurs qui font confiance à GP-Valise
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/register"
              className="bg-white hover:bg-[#EBF4FF] font-semibold px-8 py-3.5 rounded-full transition-colors text-sm text-[#1B3A6B] min-h-[48px] flex items-center"
            >
              Envoyer un colis
            </Link>
            <Link
              to="/register?role=traveler"
              className="border border-white text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-full transition-colors text-sm min-h-[48px] flex items-center"
            >
              Proposer un trajet
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="text-white" style={{ backgroundColor: '#0F2544' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" aria-label="Accueil Safe Move">
            <img src="/logo-blanc.png" alt="Safe Move" className="h-8" />
          </Link>
          <p className="text-sm text-white/60">© 2026 GP-Valise. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <span className="text-white/20" aria-hidden>·</span>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <span className="text-white/20" aria-hidden>·</span>
            <a
              href="https://wa.me/212600000000"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contacter sur WhatsApp"
            >
              WhatsApp
            </a>
            <span className="text-white/20" aria-hidden>·</span>
            <a href="mailto:contact@safemove.tech" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}