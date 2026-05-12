import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, Scale } from "lucide-react";

import { Card, Spinner, Button, BookingStatusBadge } from "@/components/ui";
import { useBookings } from "@/hooks/useBookings";
import { formatDate } from "@/lib/utils";
import type { Booking } from "@/types";

function getDisputedAt(booking: Booking): string {
  const entry = booking.status_history.find(
    (h) => h.new_status === "en_litige"
  );
  return entry ? entry.changed_at : booking.created_at;
}

function DisputeRow({ booking }: { booking: Booking }) {
  const departure = booking.trip?.departure ?? "—";
  const destination = booking.trip?.destination ?? "—";
  const kgDisplay = (booking.kg_reserved / 1000).toFixed(1) + " kg";

  return (
    <Link
      to={`/sender/bookings/${booking.id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {departure} → {destination}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {kgDisplay} · Litige ouvert le {formatDate(getDisputedAt(booking))}
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

export default function DisputesPage() {
  const { data, isLoading, isError, refetch } = useBookings();

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
        <p className="text-red-500 mb-4">Erreur lors du chargement des litiges.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const disputes = (data ?? []).filter((b) => b.status === "en_litige");

  if (disputes.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes litiges</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Scale className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun litige en cours</p>
          <p className="text-sm text-gray-400 mt-1">
            Vos litiges ouverts apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes litiges</h1>
        <span className="text-sm text-gray-500">{disputes.length} en cours</span>
      </div>
      <Card className="p-0 overflow-hidden">
        {disputes.map((booking) => (
          <DisputeRow key={booking.id} booking={booking} />
        ))}
      </Card>
    </div>
  );
}
