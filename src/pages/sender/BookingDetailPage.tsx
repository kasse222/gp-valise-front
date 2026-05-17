import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button, Card, Spinner, BookingStatusBadge } from "@/components/ui";
import { useBooking } from "@/hooks/useBooking";
import { useTransactions } from "@/hooks/useTransactions";
import { payBooking } from "@/api/bookings";
import { formatAmount, formatDate } from "@/lib/utils";

function expiresInMinutes(isoDate: string): string {
  const diff = Math.floor((new Date(isoDate).getTime() - Date.now()) / 60_000);
  if (diff <= 0) return "expiré";
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "card">("mobile_money");

  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);
  const { data: allTransactions, isError: isTxError, error: txError } = useTransactions();

  const payMutation = useMutation({
    mutationFn: () => payBooking(bookingId, {
      method: paymentMethod,
      phone: paymentMethod === "mobile_money" ? (phone || undefined) : undefined,
      country: "SN",
    }),
    onSuccess: (data) => {
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      toast.success("Paiement effectué !");
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Une erreur est survenue";
      toast.error(msg);
    },
  });

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

  const transactions = (allTransactions ?? []).filter(
    (tx) => tx.booking_id === bookingId
  );
  const is403 =
    isTxError && (txError as AxiosError)?.response?.status === 403;

  const canOpenDispute =
    booking.status === "confirmee" || booking.status === "livree";

  const kgDisplay = (booking.kg_reserved / 1000).toFixed(1) + " kg";

  const tripDate =
    booking.trip?.date
      ? booking.trip.date.split("-").reverse().join("/")
      : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        to="/sender/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Mes réservations
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Réservation #{booking.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(booking.created_at)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Trajet */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Trajet
        </h2>
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <span>{booking.trip?.departure ?? "—"}</span>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
          {booking.user && (
            <div>
              <dt className="text-gray-500">Voyageur</dt>
              <dd className="font-medium text-gray-900 mt-0.5 truncate">
                {booking.user.email}
              </dd>
            </div>
          )}
          {booking.comment && (
            <div className="col-span-2">
              <dt className="text-gray-500">Commentaire</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{booking.comment}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Items réservés */}
      {booking.items.length > 0 && (
        <Card className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Items réservés
          </h2>
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
        </Card>
      )}

      {/* Paiement */}
      {booking.status === "en_paiement" && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Paiement
          </h2>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Montant total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatAmount(
                booking.items.reduce((sum, item) => sum + item.price, 0)
              )}
            </span>
          </div>

          {booking.payment_expires_at && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 mb-4">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                Expire dans{" "}
                <span className="font-semibold">
                  {expiresInMinutes(booking.payment_expires_at)}
                </span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setPaymentMethod("mobile_money")}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                paymentMethod === "mobile_money"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:border-blue-400"
              }`}
            >
              📱 Mobile Money
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                paymentMethod === "card"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:border-blue-400"
              }`}
            >
              💳 Carte bancaire
            </button>
          </div>

          {paymentMethod === "mobile_money" && (
            <input
              type="tel"
              placeholder="+221 77 000 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <Button
            variant="primary"
            className="w-full"
            loading={payMutation.isPending}
            onClick={() => payMutation.mutate()}
          >
            Payer maintenant
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Paiement sécurisé via Safe Move
          </p>
        </Card>
      )}

      {/* Transactions */}
      <Card className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Transactions
        </h2>
        {is403 ? (
          <div className="flex items-center gap-2 text-sm text-amber-600 py-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Vérification email requise pour accéder aux transactions.</span>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune transaction pour cette réservation.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{tx.type.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.status.label}</p>
                </div>
                <span className="font-medium text-gray-900">
                  {formatAmount(tx.amount, tx.currency.code)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Historique des statuts */}
      {booking.status_history.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Historique des statuts
          </h2>
          <ol className="space-y-3">
            {booking.status_history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
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
        </Card>
      )}

      {/* Action litige */}
      {canOpenDispute && (
        <div className="flex justify-end">
          <Button
            variant="danger"
            onClick={() =>
              toast("Disponible en Phase 7", { icon: "ℹ️" })
            }
          >
            Ouvrir un litige
          </Button>
        </div>
      )}
    </div>
  );
}
