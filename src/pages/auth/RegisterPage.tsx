import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

import { Button, Input, Card } from "@/components/ui";
import { UserRole } from "@/store/authStore";
import client from "@/api/client";

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role: number;
}

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: string;
}

interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterPayload>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    role: UserRole.SENDER,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function set<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const mutation = useMutation({
    mutationFn: () => client.post("/register", form),
    onSuccess: () => {
      toast.success("Inscription réussie ! Connectez-vous.");
      navigate("/login");
    },
    onError: (error: AxiosError<ApiValidationError>) => {
      const data = error.response?.data;
      if (error.response?.status === 422 && data?.errors) {
        const mapped: FieldErrors = {};
        for (const [field, messages] of Object.entries(data.errors)) {
          if (field in ({} as FieldErrors) || true) {
            (mapped as Record<string, string>)[field] = messages[0];
          }
        }
        setFieldErrors(mapped);
        toast.error(data.message ?? "Erreur de validation.");
      } else {
        toast.error("Une erreur est survenue.");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Safe Move</h1>
          <p className="text-gray-500 mt-2">Créez votre compte</p>
        </div>

        <Card className="p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Jean"
                error={fieldErrors.first_name}
                required
              />
              <Input
                label="Nom"
                type="text"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Dupont"
                error={fieldErrors.last_name}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="vous@exemple.com"
              error={fieldErrors.email}
              required
            />

            <Input
              label="Téléphone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+33 6 00 00 00 00"
              error={fieldErrors.phone}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Je suis
              </label>
              <select
                value={form.role}
                onChange={(e) => set("role", Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={UserRole.SENDER}>Expéditeur — j'envoie des colis</option>
                <option value={UserRole.TRAVELER}>Voyageur — je transporte des colis</option>
              </select>
              {fieldErrors.role && (
                <p className="text-xs text-red-500">{fieldErrors.role}</p>
              )}
            </div>

            <Input
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="8 caractères minimum"
              error={fieldErrors.password}
              required
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={form.password_confirmation}
              onChange={(e) => set("password_confirmation", e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              loading={mutation.isPending}
              className="w-full justify-center"
            >
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
