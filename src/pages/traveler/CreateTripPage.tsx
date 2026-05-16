import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

import { Button, Card, Input } from "@/components/ui";
import { createTrip } from "@/api/trips";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [availableKg, setAvailableKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [typeTrip, setTypeTrip] = useState("standard");

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trajet créé avec succès !");
      navigate("/traveler/trips");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Une erreur est survenue");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate({
      departure,
      destination,
      date,
      capacity: Math.round(Number(availableKg) * 1000),
      price_per_kg: Math.round(Number(pricePerKg) * 100),
      type_trip: typeTrip,
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proposer un trajet</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Ville de départ"
            type="text"
            required
            placeholder="ex : Paris"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
          />
          <Input
            label="Destination"
            type="text"
            required
            placeholder="ex : Casablanca"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <Input
            label="Date et heure de départ"
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Capacité disponible (kg)"
            type="number"
            required
            min="1"
            step="0.1"
            placeholder="ex : 10"
            value={availableKg}
            onChange={(e) => setAvailableKg(e.target.value)}
          />
          <Input
            label="Prix par kg (€/kg)"
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="ex : 8"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Type de trajet
            </label>
            <select
              required
              value={typeTrip}
              onChange={(e) => setTypeTrip(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="sur_devis">Sur devis</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              Publier le trajet
            </Button>
            <Link
              to="/traveler/trips"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
