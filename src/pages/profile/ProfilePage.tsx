import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button, Card, Input } from "@/components/ui";
import { updateUser } from "@/api/users";
import { useAuthStore } from "@/store/authStore";

const COUNTRIES = [
  { value: "",   label: "Sélectionner un pays" },
  { value: "SN", label: "Sénégal 🇸🇳" },
  { value: "MA", label: "Maroc 🇲🇦" },
  { value: "FR", label: "France 🇫🇷" },
  { value: "CI", label: "Côte d'Ivoire 🇨🇮" },
  { value: "BJ", label: "Bénin 🇧🇯" },
] as const;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName,  setLastName]  = useState(user?.last_name  ?? "");
  const [phone,     setPhone]     = useState(user?.phone      ?? "");
  const [country,   setCountry]   = useState(user?.country    ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      updateUser(user!.id, {
        first_name: firstName,
        last_name:  lastName,
        phone:      phone  || undefined,
        country:    country || undefined,
      }),
    onSuccess: (data) => {
      useAuthStore.getState().setUser({ ...user!, ...data });
      toast.success("Profil mis à jour !");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Une erreur est survenue";
      toast.error(msg);
    },
  });

  if (!user) return null;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <Input
            label="Prénom"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Input
            label="Nom"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Input
            label="Téléphone"
            type="tel"
            value={phone}
            placeholder="+221 77 000 00 00"
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Pays</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Enregistrer
          </Button>
        </div>
      </Card>
    </div>
  );
}
