import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";

import { Button, Card, Spinner, BookingStatusBadge } from "@/components/ui";
import { useBooking } from "@/hooks/useBooking";
import { formatAmount, formatDate } from "@/lib/utils";

// ─── Empty State Component (réutilisable) ─────────────────────────────
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-10">
      <Package className="mx-auto h-12 w-12 text-gray-300" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default function TravelerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement de la réservation.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const tripDate = booking.trip?.date
    ? booking.trip.date.split("-").reverse().join("/")
    : null;

  const kgDisplay = (booking.kg_reserved / 1000).toFixed(1) + " kg";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        to={`/traveler/trips/${booking.trip_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au trajet
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Réservation #{booking.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(booking.created_at)}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Expéditeur */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Expéditeur
        </h2>
        <p className="text-sm text-gray-900">{booking.user?.email ?? "—"}</p>
      </Card>

      {/* Trajet */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Trajet
        </h2>
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <span>{booking.trip?.departure ?? "—"}</span>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <span>{booking.trip?.destination ?? "—"}</span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {tripDate && (
            <div>
              <dt className="text-gray-500">Date du trajet</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{tripDate}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Poids réservé</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{kgDisplay}</dd>
          </div>
          {booking.comment && (
            <div className="col-span-2">
              <dt className="text-gray-500">Commentaire</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{booking.comment}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Items réservés */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Items réservés
        </h2>
        {booking.items.length === 0 ? (
          <EmptyState
            title="Aucun item"
            description="Cette réservation ne contient aucun bagage."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {booking.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div className="text-gray-700">
                  <span className="font-medium">
                    {item.luggage?.tracking_id ?? `Item #${item.id}`}
                  </span>
                  <span className="text-gray-400 ml-2">
                    · {(item.kg_reserved / 1000).toFixed(1)} kg
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatAmount(item.price, "EUR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Historique des statuts */}
      <Card>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Historique des statuts
        </h2>
        {booking.status_history.length === 0 ? (
          <EmptyState
            title="Aucun historique"
            description="Aucun changement de statut enregistré."
          />
        ) : (
          <ol className="space-y-3">
            {booking.status_history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">
                    {entry.old_label ? (
                      <>
                        <span className="text-gray-500">{entry.old_label}</span>
                        {" → "}
                      </>
                    ) : null}
                    <span className="font-medium">{entry.new_label}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(entry.changed_at)}
                  </p>
                  {entry.reason && (
                    <p className="text-xs text-gray-500 mt-0.5">{entry.reason}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}