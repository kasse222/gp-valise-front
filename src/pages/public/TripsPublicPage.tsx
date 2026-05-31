import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Plane, ArrowLeft, X } from "lucide-react";
import toast from "react-hot-toast";

import { getTrips } from "@/api/trips";
import { createBooking } from "@/api/bookings";
import { createLuggage } from "@/api/luggages";
import type { Trip } from "@/types";
import { useAuthStore, isSender, isTraveler } from "@/store/authStore";
import { formatDate, formatAmount, tripStatusColor } from "@/lib/utils";
import { Button, Card, Spinner, EmptyState } from "@/components/ui";

interface BookingModalProps {
  trip: Trip;
  onClose: () => void;
}

function BookingModal({ trip, onClose }: BookingModalProps) {
  const navigate = useNavigate();
  const [kgReserved, setKgReserved] = useState(1);
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");

  const maxKg = trip.grams_disponible / 1000;
  const pricePerKg = trip.price_per_kg / 100;
  const totalEstime = kgReserved * pricePerKg;

  const mutation = useMutation({
    mutationFn: async () => {
      const tripDate = trip.date
        ? trip.date.split("T")[0]
        : new Date().toISOString().slice(0, 10);

      const deliveryDate = new Date(tripDate);
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      const deliveryDateStr = deliveryDate.toISOString().split("T")[0];

      const luggage = await createLuggage({
        trip_id: trip.id,
        description,
        weight_kg: Math.round(kgReserved * 10),
        length_cm: 40,
        width_cm: 30,
        height_cm: 20,
        pickup_city: trip.departure,
        delivery_city: trip.destination,
        pickup_date: tripDate,
        delivery_date: deliveryDateStr,
        is_fragile: false,
        insurance_requested: false,
      });

      return createBooking({
        trip_id: trip.id,
        items: [{ luggage_id: luggage.id, kg_reserved: Math.round(kgReserved * 1000) }],
        comment: comment || undefined,
      });
    },
    onSuccess: (booking) => {
      toast.success("Réservation créée avec succès !");
      navigate(`/sender/bookings/${booking.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Une erreur est survenue";
      toast.error(msg);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Réserver ce trajet</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
            <span>{trip.departure}</span>
            <Plane className="h-3.5 w-3.5 text-gray-400" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {trip.date && <span>{formatDate(trip.date)}</span>}
            <span className="text-gray-300">·</span>
            <span className="font-medium text-gray-700">{pricePerKg.toFixed(2)} €/kg</span>
            <span className="text-gray-300">·</span>
            <span>{maxKg.toFixed(1)} kg dispo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Poids réservé (kg)</label>
            <input
              type="number"
              min={0.5}
              max={maxKg}
              step={0.5}
              value={kgReserved}
              onChange={(e) => setKgReserved(Number(e.target.value))}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
            <p className="text-xs text-gray-400">Max : {maxKg.toFixed(1)} kg</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Description du colis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Ex : vêtements, livres, électronique…"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Instructions particulières…"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
            <span className="text-sm text-indigo-700 font-medium">Total estimé</span>
            <span className="text-lg font-bold text-indigo-800">
              {formatAmount(Math.round(totalEstime * 100))}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={mutation.isPending}>
              Confirmer la réservation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TripCardProps {
  trip: Trip;
  onBook: (trip: Trip) => void;
  canBook: boolean;
  isLoggedIn: boolean;
  isTravelerUser: boolean;
}

function TripCard({ trip, onBook, canBook, isLoggedIn, isTravelerUser }: TripCardProps) {
  const statusClass = tripStatusColor[trip.status.code] ?? "bg-gray-100 text-gray-700";
  const kgDispo = (trip.grams_disponible / 1000).toFixed(1);
  const prixParKg = (trip.price_per_kg / 100).toFixed(2);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
          <span>{trip.departure}</span>
          <Plane className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span>{trip.destination}</span>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
          {trip.status.label}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        {trip.date && <span>{formatDate(trip.date)}</span>}
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-800">{prixParKg} €/kg</span>
          <span className="text-gray-300">·</span>
          <span>{kgDispo} kg dispo</span>
        </div>
        {trip.user && (
          <span className="text-gray-400">
            Voyageur : <span className="text-gray-600 font-medium">{trip.user.full_name}</span>
          </span>
        )}
      </div>

      {canBook && (
        <Button variant="primary" size="sm" onClick={() => onBook(trip)} className="w-full mt-auto">
          Réserver
        </Button>
      )}
      {!isLoggedIn && (
        <Link
          to="/login"
          className="w-full mt-auto inline-block text-center bg-[#1B3A6B] hover:bg-[#2B6CB0] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Se connecter pour réserver
        </Link>
      )}
      {isLoggedIn && isTravelerUser && <div />}
    </Card>
  );
}

export default function TripsPublicPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = user !== null;
  const canBook = isLoggedIn && isSender(user!.role);
  const isTravelerUser = isLoggedIn && isTraveler(user!.role);

  const [searchParams] = useSearchParams();
  const filterDeparture = searchParams.get("departure")?.toLowerCase() ?? "";
  const filterDestination = searchParams.get("destination")?.toLowerCase() ?? "";
  const filterDate = searchParams.get("date") ?? "";

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const { data: trips, isLoading, isError } = useQuery<Trip[]>({
    queryKey: ["trips-public"],
    queryFn: getTrips,
    staleTime: 30_000,
  });

  const filteredTrips = (trips ?? []).filter((trip) => {
    if (filterDeparture && !trip.departure.toLowerCase().includes(filterDeparture)) return false;
    if (filterDestination && !trip.destination.toLowerCase().includes(filterDestination)) return false;
    if (filterDate && trip.date && !trip.date.startsWith(filterDate)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <img src="/logo-nav-hori.png" alt="Safe Move" className="h-10" />
        {!isLoggedIn ? (
          <Link to="/login" className="text-sm font-medium text-[#1B3A6B] hover:underline">
            Se connecter
          </Link>
        ) : (
          <Link
            to={isSender(user!.role) ? "/sender" : "/traveler"}
            className="text-sm font-medium text-[#1B3A6B] hover:underline"
          >
            Mon espace
          </Link>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trajets disponibles</h1>
          <p className="text-gray-500 mt-2">Trouvez un voyageur partant vers votre destination</p>
          {(filterDeparture || filterDestination || filterDate) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-indigo-600">
              <span>Filtres actifs :</span>
              {filterDeparture && <span className="bg-indigo-50 px-2 py-0.5 rounded-full">{filterDeparture}</span>}
              {filterDestination && <span className="bg-indigo-50 px-2 py-0.5 rounded-full">{filterDestination}</span>}
              {filterDate && <span className="bg-indigo-50 px-2 py-0.5 rounded-full">{filterDate}</span>}
              <button onClick={() => navigate("/trips")} className="text-gray-400 hover:text-gray-600 underline ml-1">
                Effacer
              </button>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">Impossible de charger les trajets.</p>
            <p className="text-gray-400 text-sm mt-1">Vérifiez votre connexion et réessayez.</p>
          </div>
        )}

        {!isLoading && !isError && filteredTrips.length === 0 && (
          <EmptyState
            icon={Plane}
            title="Aucun trajet trouvé"
            description="Aucun trajet ne correspond à votre recherche. Essayez d'autres critères."
          />
        )}

        {!isLoading && !isError && filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onBook={setSelectedTrip}
                canBook={canBook}
                isLoggedIn={isLoggedIn}
                isTravelerUser={isTravelerUser}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTrip && (
        <BookingModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}
    </div>
  );
}