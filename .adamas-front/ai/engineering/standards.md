# Standards de code — GP-Valise Frontend

## TypeScript

```txt
strict: true obligatoire
Pas de any
Types dans src/types/index.ts
Interfaces pour objets complexes
Type pour unions simples
```

## Nommage

```txt
Pages         → PascalCase + Page    (BookingsPage.tsx)
Hooks         → camelCase + use      (useBookings.ts)
Composants    → PascalCase           (BookingCard.tsx)
API fonctions → camelCase            (getBookings, createDispute)
Utils         → camelCase            (formatAmount)
Types         → PascalCase           (Booking, Dispute, Trip)
Constants     → UPPER_SNAKE          (UserRole)
```

## Imports — ordre obligatoire

```ts
// 1. React
import { useState } from "react";

// 2. Librairies externes
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

// 3. Internes absolus (@/)
import { useAuthStore } from "@/store/authStore";
import { Button, Card } from "@/components/ui";
import { useBookings } from "@/hooks/useBookings";

// 4. Types
import type { Booking } from "@/types";
```

## Composants

```txt
- Functional components uniquement
- Props interface nommée (BookingCardProps)
- Default export pour pages
- Named export pour composants ui/
- Pas de JSX inline complexe → extraire composant
```

## TanStack Query

```ts
// queryKey — toujours tableau stable
queryKey: ["bookings"];
queryKey: ["booking", id];
queryKey: ["bookings", { status }];
queryKey: ["pickup-location", bookingId];
queryKey: ["dispute", disputeId];
queryKey: ["dispute-messages", disputeId];
queryKey: ["kyc"];

// Après mutation — toujours invalider
queryClient.invalidateQueries({ queryKey: ["bookings"] });
queryClient.invalidateQueries({ queryKey: ["booking", id] });

// staleTime explicite
staleTime: 30_000;
```

## Gestion états obligatoire

```tsx
if (isLoading) return <Spinner />;
if (isError) return <ErrorState onRetry={refetch} />;
if (!data?.length) return <EmptyState message="..." />;
return <DataList data={data} />;
```

## Mutations — pattern standard

```tsx
const { mutate, isPending } = useMutation({
  mutationFn: () => approveBooking(booking.id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    toast.success("Réservation approuvée.");
  },
  onError: (error: AxiosError) => {
    const message = error.response?.data?.message ?? "Une erreur est survenue.";
    toast.error(message);
  },
});
```

## Messages utilisateur

```txt
- Toujours en français
- Toast success → action confirmée
- Toast error → message backend si disponible, sinon message générique
- Pas d'alert() natif
- Erreurs API 422 → afficher errors.field[0] sous le champ
```

## Montants financiers

```ts
// Les montants viennent en centimes du backend
// Toujours utiliser formatAmount()

export function formatAmount(centimes: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(centimes / 100);
}

// Exemples :
formatAmount(1500); // "15,00 €"
formatAmount(10000, "XOF"); // "100,00 XOF"
```

## Interdits absolus

```txt
❌ useEffect pour fetch
❌ fetch() natif — utiliser Axios client
❌ any TypeScript
❌ inline styles
❌ console.log en production
❌ magic numbers (role === 3 → utiliser UserRole.SENDER)
❌ logique métier dans composants
❌ state global pour données serveur (Zustand = auth uniquement)
❌ texte en anglais dans l'UI utilisateur
❌ montants en float (toujours centimes integer)
```
