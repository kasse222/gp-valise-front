import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";

import { Button, Card, Spinner, BookingStatusBadge } from "@/components/ui";
import { useTrip } from "@/hooks/useTrips";
import { useBookings } from "@/hooks/useBookings";
import {
  cn,
  formatAmount,
  formatDate,
  tripStatusColor,
} from "@/lib/utils";

interface CapacityBarProps {
  capacity: number;
  gramsDisponible: number;
}

function CapacityBar({ capacity, gramsDisponible }: CapacityBarProps) {
  const used = capacity - gramsDisponible;
  const pct = capacity > 0 ? Math.min((used / capacity) * 100, 100) : 0;

  const usedKg = (used / 1000).toFixed(1);
  const totalKg = (capacity / 1000).toFixed(1);
  const disponibleKg = (gramsDisponible / 1000).toFixed(1);

  const barColor =
    pct < 50 ? "bg-green-500" : pct <= 80 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="col-span-2">
      <div className="flex items-baseline justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-900">
          {usedKg} kg utilisés / {totalKg} kg total
        </span>
        <span className="text-xs text-gray-500">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct.toFixed(1)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5">{disponibleKg} kg disponibles</p>
    </div>
  );
}

function TripStatusBadge({ code, label }: { code: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        tripStatusColor[code] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {label}
    </span>
  );
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);

  const { data: trip, isLoading, isError, refetch } = useTrip(tripId);
  const { data: allBookings } = useBookings();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement du trajet.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const bookings = (allBookings ?? []).filter((b) => b.trip_id === tripId);
  const tripDate = trip.date
    ? trip.date.split("-").reverse().join("/")
    : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        to="/traveler/trips"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Mes trajets
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-1 flex-wrap">
            <span>{trip.departure}</span>
            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>{trip.destination}</span>
          </div>
          {tripDate && (
            <p className="text-sm text-gray-500">{tripDate}</p>
          )}
        </div>
        <TripStatusBadge code={trip.status.code} label={trip.status.label} />
      </div>

      {/* Informations */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Informations
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <CapacityBar
            capacity={trip.capacity}
            gramsDisponible={trip.grams_disponible}
          />
          <div>
            <dt className="text-gray-500">Prix au kg</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              {formatAmount(trip.price_per_kg, "EUR")}
            </dd>
          </div>
          {trip.flight_number && (
            <div>
              <dt className="text-gray-500">Numéro de vol</dt>
              <dd className="font-medium text-gray-900 mt-0.5">
                {trip.flight_number}
              </dd>
            </div>
          )}
          {trip.type_badge && (
            <div>
              <dt className="text-gray-500">Type de trajet</dt>
              <dd className="font-medium text-gray-900 mt-0.5">
                {trip.type_badge.label}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Réservations reçues */}
      <Card>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Réservations reçues
          {bookings.length > 0 && (
            <span className="ml-2 text-indigo-600 normal-case">
              {bookings.length}
            </span>
          )}
        </h2>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">
              Aucune réservation pour ce trajet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const kgDisplay =
                (booking.kg_reserved / 1000).toFixed(1) + " kg";
              const senderEmail = booking.user?.email ?? "—";
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {senderEmail}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {kgDisplay} · {formatDate(booking.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
