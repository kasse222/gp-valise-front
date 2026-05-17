import { useState } from "react";

import { Link } from "react-router-dom";
import { Package, ChevronRight, Filter } from "lucide-react";

import { Button, Card, Spinner, EmptyState } from "@/components/ui";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { useBookings } from "@/hooks/useBookings";
import { formatDate } from "@/lib/utils";
import { bookingStatusLabel } from "@/lib/utils";

import type { Booking } from "@/types";

const ALL_STATUSES = Object.keys(bookingStatusLabel);

function BookingRow({ booking }: { booking: Booking }) {
  const kgDisplay = (booking.kg_reserved / 1000).toFixed(1) + " kg";
  const departure = booking.trip?.departure ?? "—";
  const destination = booking.trip?.destination ?? "—";

  return (
    <Link
      to={`/sender/bookings/${booking.id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Package className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {departure} → {destination}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {kgDisplay} · {formatDate(booking.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <BookingStatusBadge status={booking.status} />
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );
}

export default function BookingsPage() {
  const { data, isLoading, isError, refetch } = useBookings();
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

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
        <p className="text-red-500 mb-4">Erreur lors du chargement des réservations.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const bookings = data ?? [];
  const filtered = activeStatus
    ? bookings.filter((b) => b.status === activeStatus)
    : bookings;

  const usedStatuses = [...new Set(bookings.map((b) => b.status))].filter((s) =>
    ALL_STATUSES.includes(s)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
        <span className="text-sm text-gray-500">{bookings.length} au total</span>
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
              onClick={() => setActiveStatus(status === activeStatus ? null : status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeStatus === status
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {bookingStatusLabel[status] ?? status}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucune réservation"
          description="Tu n'as pas encore de réservation. Explore les trajets disponibles pour commencer."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          {filtered.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </Card>
      )}
    </div>
  );
}
