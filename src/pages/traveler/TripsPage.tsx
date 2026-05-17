import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, ChevronRight, Filter } from "lucide-react";

import { Card, Spinner, Button, EmptyState } from "@/components/ui";
import { useTrips } from "@/hooks/useTrips";
import {
  cn,
  formatAmount,
  formatDate,
  tripStatusLabel,
  tripStatusColor,
} from "@/lib/utils";
import type { Trip } from "@/types";

const STATUS_FILTERS = ["pending", "active", "completed", "cancelled"] as const;
type TripStatus = (typeof STATUS_FILTERS)[number];

function TripStatusBadge({ code }: { code: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        tripStatusColor[code] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {tripStatusLabel[code] ?? code}
    </span>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const disponibleKg = (trip.grams_disponible / 1000).toFixed(1) + " kg";

  return (
    <Link
      to={`/traveler/trips/${trip.id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Plane className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {trip.departure} → {trip.destination}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {trip.date ? `${formatDate(trip.date)} · ` : ""}
            {disponibleKg} dispo · {formatAmount(trip.price_per_kg, "EUR")}/kg
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <TripStatusBadge code={trip.status.code} />
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );
}

export default function TripsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useTrips();
  const [activeStatus, setActiveStatus] = useState<TripStatus | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement des trajets.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const trips = data ?? [];
  const filtered = activeStatus
    ? trips.filter((t) => t.status.code === activeStatus)
    : trips;

  const usedStatuses = [
    ...new Set(trips.map((t) => t.status.code)),
  ].filter((s): s is TripStatus =>
    STATUS_FILTERS.includes(s as TripStatus)
  );

  if (trips.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes trajets</h1>
          <Button variant="primary" size="sm" onClick={() => navigate("/traveler/trips/new")}>
            Proposer un trajet
          </Button>
        </div>
        <EmptyState
          icon={Plane}
          title="Aucun trajet créé"
          description="Crée ton premier trajet et commence à transporter des bagages."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes trajets</h1>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => navigate("/traveler/trips/new")}>
            Proposer un trajet
          </Button>
          <span className="text-sm text-gray-500">{trips.length} au total</span>
        </div>
      </div>

      {usedStatuses.length > 1 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setActiveStatus(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeStatus === null
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tous
          </button>
          {usedStatuses.map((status) => (
            <button
              key={status}
              onClick={() =>
                setActiveStatus(status === activeStatus ? null : status)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeStatus === status
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tripStatusLabel[status] ?? status}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          Aucun trajet pour ce statut.
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {filtered.map((trip) => (
            <TripRow key={trip.id} trip={trip} />
          ))}
        </Card>
      )}
    </div>
  );
}
