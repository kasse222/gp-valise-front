import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTrips } from "@/api/trips";
import { useAuthStore, isSender } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import type { Trip } from "@/types";
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

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  primary: "#1B3A6B",
  primaryHover: "#2B6CB0",
  primaryDark: "#0F2544",
  primaryLight: "#EBF4FF",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center"
        style={{ backgroundColor: BRAND.primaryLight, color: BRAND.primary }}
      >
        {number}
      </span>
      <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{text}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: BRAND.primaryLight }}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function SearchField({
  icon,
  placeholder,
}: {
  icon: React.ReactNode;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-sm text-gray-400 truncate">{placeholder}</span>
    </div>
  );
}

function TripCard({ trip, onSee }: { trip: Trip; onSee: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 font-semibold text-gray-900">
        <span>{trip.departure}</span>
        <Plane className="w-3 h-3 text-gray-400 shrink-0" />
        <span>{trip.destination}</span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {formatDate(trip.date ?? "")}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-bold" style={{ color: BRAND.primary }}>
            {(trip.price_per_kg / 100).toFixed(2)} €/kg
          </span>
          <span className="text-gray-300">·</span>
          <span>{(trip.grams_disponible / 1000).toFixed(1)} kg dispo</span>
        </div>
        {trip.user?.full_name && (
          <span className="text-gray-400">Par {trip.user.full_name}</span>
        )}
      </div>
      <button
        onClick={onSee}
        className="w-full mt-3 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200 text-center"
      >
        Voir ce trajet
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const dashboardPath = user
    ? isSender(user.role)
      ? "/sender"
      : "/traveler"
    : null;

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips-public"],
    queryFn: getTrips,
    staleTime: 60_000,
  });
  const previewTrips = trips?.slice(0, 3) ?? [];

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Nos services", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
  ];

  return (
    <div className="min-h-screen font-sans">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <img src="/logo-nav-hori.png" alt="Safe Move" style={{ height: "64px" }} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm transition-colors duration-200 ${
                  link.href === "/" ? "font-medium" : "text-gray-600 hover:text-[#1B3A6B]"
                }`}
                style={link.href === "/" ? { color: BRAND.primary } : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {dashboardPath ? (
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-200"
              >
                <User className="h-4 w-4" />
                Mon espace
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-200"
              >
                <User className="h-4 w-4" />
                Se connecter
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-600"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

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

      {/* ── Hero — image Unsplash libre + overlay brand ─────────────────── */}
      <section
        className="relative pt-24 min-h-[75vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
         <div
           className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,37,68,0.96) 0%, rgba(27,58,107,0.92) 50%, rgba(43,108,176,0.88) 100%)",
            }}
          />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col items-center text-center gap-8">
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
              className="bg-white hover:bg-[#EBF4FF] font-semibold px-8 py-3 rounded-full transition-colors duration-200 text-sm"
              style={{ color: BRAND.primary }}
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
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: BRAND.primaryLight }}
                >
                  <Package className="h-5 w-5" style={{ color: BRAND.primary }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pour les expéditeurs</h3>
              </div>
              <div className="flex flex-col gap-4 pl-2">
                <Step number={1} text="Créez votre bagage avec ses dimensions et poids" />
                <Step number={2} text="Trouvez un trajet qui correspond à votre destination" />
                <Step number={3} text="Réservez et payez en toute sécurité (escrow)" />
                <Step number={4} text="Suivez votre colis jusqu'à la livraison" />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: BRAND.primaryLight }}
                >
                  <Plane className="h-5 w-5" style={{ color: BRAND.primary }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pour les voyageurs</h3>
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
              icon={<Shield className="h-6 w-6" style={{ color: BRAND.primary }} />}
              title="Sécurisé"
              description="KYC, paiement sécurisé avec système escrow 48h, et suivi complet de chaque transaction"
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6" style={{ color: BRAND.primary }} />}
              title="Fiable"
              description="Système de notation, gestion des litiges, et support client disponible"
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6" style={{ color: BRAND.primary }} />}
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
                <SearchField icon={<MapPin className="h-4 w-4" />} placeholder="Ville de départ" />
                <SearchField icon={<MapPin className="h-4 w-4" />} placeholder="Destination" />
                <SearchField icon={<Calendar className="h-4 w-4" />} placeholder="Date de départ" />
              </div>
              <Link
                to="/trips"
                className="w-full sm:w-auto self-center bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-10 py-3 rounded-full text-center text-sm transition-colors duration-200"
              >
                Rechercher
              </Link>
            </div>
            <div className="border-t border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isLoading ? (
                <>
                  <div className="animate-pulse bg-gray-100 rounded-xl h-32" />
                  <div className="animate-pulse bg-gray-100 rounded-xl h-32" />
                  <div className="animate-pulse bg-gray-100 rounded-xl h-32" />
                </>
              ) : previewTrips.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <p>Aucun trajet disponible pour le moment.</p>
                  <p>Revenez bientôt !</p>
                </div>
              ) : (
                previewTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onSee={() => navigate("/trips")} />
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => navigate("/trips")}
            className="mt-6 mx-auto block px-6 py-3 rounded-full border-2 border-[#1B3A6B] text-[#1B3A6B] font-medium hover:bg-[#1B3A6B] hover:text-white transition-colors"
          >
            Voir tous les trajets disponibles →
          </button>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: "linear-gradient(135deg, #0F2544 0%, #1B3A6B 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-white">Prêt à commencer ?</h2>
          <p className="text-blue-100 text-lg max-w-xl">
            Rejoignez des milliers d'utilisateurs qui font confiance à GP-Valise
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/register"
              className="bg-white hover:bg-[#EBF4FF] font-semibold px-8 py-3 rounded-full transition-colors duration-200 text-sm"
              style={{ color: BRAND.primary }}
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
      <footer className="text-white" style={{ backgroundColor: BRAND.primaryDark }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo-blanc.png" alt="Safe Move" className="h-8" />
          <p className="text-sm text-white/70">© 2026 GP-Valise. Tous droits réservés.</p>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <a href="#" className="hover:text-white transition-colors duration-200">Conditions</a>
            <span className="text-white/30">·</span>
            <a href="#" className="hover:text-white transition-colors duration-200">Confidentialité</a>
            <span className="text-white/30">·</span>
            <a href="mailto:contact@safemove.io" className="hover:text-white transition-colors duration-200">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}