import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Package,
  Plane,
  Shield,
  CheckCircle,
  DollarSign,
  MapPin,
  Calendar,
  Menu,
  X,
} from "lucide-react";

// ─── Local sub-components ────────────────────────────────────────────────────

interface StepProps {
  number: number;
  text: string;
}

function Step({ number, text }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center" style={{ backgroundColor: '#EBF4FF', color: '#1B3A6B' }}>
        {number}
      </span>
      <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{text}</p>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface SearchFieldProps {
  icon: React.ReactNode;
  placeholder: string;
}

function SearchField({ icon, placeholder }: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-sm text-gray-400 truncate">{placeholder}</span>
    </div>
  );
}

interface TripCardProps {
  from: string;
  to: string;
  date: string;
  pricePerKg: string;
  available: string;
}

function TripCard({ from, to, date, pricePerKg, available }: TripCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2 font-semibold text-gray-900">
        <span>{from}</span>
        <Plane className="w-3 h-3 text-gray-400 shrink-0" />
        <span>{to}</span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {date}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-bold" style={{ color: '#1B3A6B' }}>{pricePerKg}</span>
          <span className="text-gray-300">·</span>
          <span>{available}</span>
        </div>
      </div>
      <Link
        to="/trips"
        className="w-full mt-3 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200 text-center"
      >
        Réserver
      </Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Nos services", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src="/logo-nav-hori.png" alt="GP-Valise" style={{ height: '52px' }} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm transition-colors duration-200 ${link.href === "/" ? "font-medium" : "text-gray-600 hover:text-[#1B3A6B]"}`}
                style={link.href === "/" ? { color: '#1B3A6B' } : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + burger */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-200"
            >
              <User className="h-4 w-4" />
              Se connecter
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-600"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-[#1B3A6B] transition-colors duration-200 py-1"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-20 min-h-[75vh] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F2544 0%, #1B3A6B 50%, #2B6CB0 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col items-center text-center gap-8">
          <div className="flex flex-col gap-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Transportez vos bagages en toute confiance
            </h1>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              Connectez-vous avec des voyageurs de confiance pour envoyer vos
              colis partout dans le monde
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/trips"
              className="bg-white hover:bg-[#EBF4FF] font-semibold px-8 py-3 rounded-full transition-colors duration-200 text-sm" style={{ color: '#1B3A6B' }}
            >
              Rechercher un trajet
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors duration-200 text-sm"
            >
              Devenir transporteur
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ───────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

            {/* Expéditeurs */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
                  <Package className="h-5 w-5" style={{ color: '#1B3A6B' }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Pour les expéditeurs
                </h3>
              </div>
              <div className="flex flex-col gap-4 pl-2">
                <Step number={1} text="Créez votre bagage avec ses dimensions et poids" />
                <Step number={2} text="Trouvez un trajet qui correspond à votre destination" />
                <Step number={3} text="Réservez et payez en toute sécurité (escrow)" />
                <Step number={4} text="Suivez votre colis jusqu'à la livraison" />
              </div>
            </div>

            {/* Voyageurs */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
                  <Plane className="h-5 w-5" style={{ color: '#1B3A6B' }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Pour les voyageurs
                </h3>
              </div>
              <div className="flex flex-col gap-4 pl-2">
                <Step number={1} text="Publiez votre trajet avec la capacité disponible" />
                <Step number={2} text="Acceptez les réservations qui vous conviennent" />
                <Step number={3} text="Transportez les bagages en toute sécurité" />
                <Step number={4} text="Recevez votre paiement après confirmation de livraison" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi GP-Valise ──────────────────────────────────────────── */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">
            Pourquoi GP-Valise ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="h-6 w-6" style={{ color: '#1B3A6B' }} />}
              title="Sécurisé"
              description="KYC, paiement sécurisé avec système escrow 48h, et suivi complet de chaque transaction"
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6" style={{ color: '#1B3A6B' }} />}
              title="Fiable"
              description="Système de notation, gestion des litiges, et support client disponible"
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6" style={{ color: '#1B3A6B' }} />}
              title="Économique"
              description="Tarifs compétitifs, paiement uniquement après livraison confirmée pour les voyageurs"
            />
          </div>
        </div>
      </section>

      {/* ── Recherche preview ───────────────────────────────────────────── */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Rechercher un trajet disponible
            </h2>
            <p className="text-gray-500 mb-10">
              Trouvez des voyageurs partant vers votre destination
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <SearchField
                  icon={<MapPin className="h-4 w-4" />}
                  placeholder="Ville de départ"
                />
                <SearchField
                  icon={<MapPin className="h-4 w-4" />}
                  placeholder="Destination"
                />
                <SearchField
                  icon={<Calendar className="h-4 w-4" />}
                  placeholder="Date de départ"
                />
              </div>
              <Link
                to="/trips"
                className="w-full sm:w-auto self-center bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-10 py-3 rounded-full text-center text-sm transition-colors duration-200"
              >
                Rechercher
              </Link>
            </div>
            <div className="border-t border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TripCard
                from="Paris"
                to="Casablanca"
                date="15 juin 2026"
                pricePerKg="8€/kg"
                available="15 kg dispo"
              />
              <TripCard
                from="Dakar"
                to="Paris"
                date="20 juin 2026"
                pricePerKg="6€/kg"
                available="22 kg dispo"
              />
              <TripCard
                from="Lyon"
                to="Tokyo"
                date="25 juin 2026"
                pricePerKg="12€/kg"
                available="8 kg dispo"
              />
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            Inscrivez-vous pour voir tous les trajets disponibles
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0F2544 0%, #1B3A6B 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-white">
            Prêt à commencer ?
          </h2>
          <p className="text-blue-100 text-lg max-w-xl">
            Rejoignez des milliers d'utilisateurs qui font confiance à GP-Valise
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/register"
              className="bg-white hover:bg-[#EBF4FF] font-semibold px-8 py-3 rounded-full transition-colors duration-200 text-sm" style={{ color: '#1B3A6B' }}
            >
              Envoyer un colis
            </Link>
            <Link
              to="/register"
              className="border border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors duration-200 text-sm"
            >
              Proposer un trajet
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-white" style={{ backgroundColor: '#0F2544' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo-blanc.png" alt="GP-Valise" className="h-8" />
          <p className="text-sm text-white/70">© 2026 GP-Valise. Tous droits réservés.</p>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Link to="/login" className="hover:text-white transition-colors duration-200">
              Conditions
            </Link>
            <span className="text-white/30">·</span>
            <Link to="/login" className="hover:text-white transition-colors duration-200">
              Confidentialité
            </Link>
            <span className="text-white/30">·</span>
            <Link to="/login" className="hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
