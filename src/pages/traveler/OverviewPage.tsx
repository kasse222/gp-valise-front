import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { Card, Spinner, Button } from "@/components/ui";
import { useTrips } from "@/hooks/useTrips";
import { useBookings } from "@/hooks/useBookings";
import { cn, formatDate, tripStatusLabel, tripStatusColor } from "@/lib/utils";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "indigo" | "green" | "blue";
}) {
  const colors = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    blue: "text-blue-600",
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
  const tripsQuery = useTrips();
  const bookingsQuery = useBookings();

  if (tripsQuery.isLoading || bookingsQuery.isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );

  if (tripsQuery.isError)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => tripsQuery.refetch()}>
          Réessayer
        </Button>
      </div>
    );

  const trips = tripsQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];

  const actifs = trips.filter((t) => t.status.code === "active").length;

  const totalBookings = bookings.length;

  const capaciteMoyenne =
    trips.length > 0
      ? trips.reduce(
          (sum, t) =>
            sum +
            (t.capacity > 0 ? (t.grams_disponible / t.capacity) * 100 : 0),
          0
        ) / trips.length
      : 0;

  const recent = [...trips]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.first_name}
        </h2>
        <p className="text-gray-500 mt-1">Voici un aperçu de vos trajets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Trajets actifs"
          value={String(actifs)}
          color="indigo"
        />
        <StatCard
          label="Réservations reçues"
          value={String(totalBookings)}
          color="green"
        />
        <StatCard
          label="Capacité moy. disponible"
          value={`${capaciteMoyenne.toFixed(0)} %`}
          color="blue"
        />
      </div>

      {recent.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trajets récents
          </h3>
          <div className="flex flex-col gap-3">
            {recent.map((trip) => (
              <Link
                key={trip.id}
                to={`/traveler/trips/${trip.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-gray-900 truncate">
                        {trip.departure}
                      </span>
                      <ArrowRight size={14} className="shrink-0 text-gray-400" />
                      <span className="font-medium text-gray-900 truncate">
                        {trip.destination}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          tripStatusColor[trip.status.code] ??
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {tripStatusLabel[trip.status.code] ?? trip.status.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(trip.grams_disponible / 1000).toFixed(1)} kg dispo
                      </span>
                      {trip.date && (
                        <span className="text-xs text-gray-400">
                          {formatDate(trip.date)}
                        </span>
                      )}
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
