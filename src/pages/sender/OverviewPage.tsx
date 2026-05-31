import { Link } from "react-router-dom";
import { ArrowRight, Search, Home } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { Card, Spinner, BookingStatusBadge, Button } from "@/components/ui";
import { useBookings } from "@/hooks/useBookings";
import { formatDate } from "@/lib/utils";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "indigo" | "green" | "red";
}) {
  const colors = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <Card>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </Card>
  );
}

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useBookings();

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );

  const bookings = data ?? [];

  const actifs = bookings.filter(
    (b) => b.status === "confirmee" || b.status === "livree"
  ).length;

  const enLitige = bookings.filter((b) => b.status === "en_litige").length;

  const termines = bookings.filter(
    (b) => b.status === "termine" || b.status === "remboursee"
  ).length;

  const recent = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.first_name}
          </h2>
          <p className="text-gray-500 mt-1">Voici un aperçu de vos envois.</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0 mt-1"
        >
          <Home size={15} />
          <span className="hidden sm:inline">Accueil</span>
        </Link>
      </div>

      {/* CTA Rechercher */}
      <Link
        to="/trips"
        className="flex items-center justify-center gap-2 w-full mb-6 bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors duration-200"
      >
        <Search size={16} />
        Rechercher un trajet
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard label="Réservations actives" value={String(actifs)} color="indigo" />
        <StatCard label="En litige" value={String(enLitige)} color="red" />
        <StatCard label="Terminées" value={String(termines)} color="green" />
      </div>

      {/* Réservations récentes */}
      {recent.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Réservations récentes
          </h3>
          <div className="flex flex-col gap-3">
            {recent.map((booking) => (
              <Link
                key={booking.id}
                to={`/sender/bookings/${booking.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-gray-900 truncate">
                        {booking.trip?.departure ?? "—"}
                      </span>
                      <ArrowRight size={14} className="shrink-0 text-gray-400" />
                      <span className="font-medium text-gray-900 truncate">
                        {booking.trip?.destination ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {formatDate(booking.created_at)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}