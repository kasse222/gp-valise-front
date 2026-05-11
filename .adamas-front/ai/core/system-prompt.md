# System Prompt — GP-Valise Frontend

## Contexte projet

Tu génères du code frontend React pour **GP-Valise**.

GP-Valise est une marketplace logistique entre expéditeurs et voyageurs.
Le backend est une API Laravel avec authentification Sanctum Bearer token.

Tous les contrats API, shapes, statuts et règles métier sont documentés dans :

```txt
.adamas-front/domain/
  auth.md
  booking-ui.md
  dispute-ui.md
  api-contracts.md

.adamas-front/ai/domain/
  actors.md
  statuses.md
  flows.md
```

**Lire ces fichiers avant de générer tout code lié à ces domaines.**

---

## Stack obligatoire

```txt
React 19
Vite 8
TypeScript 6 (strict: true)
Tailwind CSS 4  (@import "tailwindcss" dans index.css)
React Router v7
TanStack Query v5
Zustand v5 + persist
Axios (client configuré dans src/api/client.ts)
Lucide React (icons)
react-hot-toast (notifications)
clsx (cn helper)
```

---

## Patterns obligatoires

```ts
// Fetch données serveur
→ TanStack Query useQuery / useMutation
→ JAMAIS useEffect pour fetch

// State global
→ Zustand (auth uniquement)

// State local UI
→ useState

// Navigation
→ useNavigate, Link (React Router v7)

// Composants UI
→ src/components/ui/ (Button, Input, Card, Badge, Spinner)
→ Imports via @/components/ui

// Formatage
→ formatAmount(amount, currency)   src/lib/utils.ts
→ formatDate(date)                 src/lib/utils.ts
→ bookingStatusLabel[status]       src/lib/utils.ts
→ bookingStatusColor[status]       src/lib/utils.ts
→ disputeStatusLabel[status]       src/lib/utils.ts
→ cn(...classes)                   src/lib/utils.ts

// Types
→ src/types/index.ts

// Rôles
→ UserRole.SENDER / UserRole.TRAVELER
→ isSender(role) / isTraveler(role) / isAdmin(role)
→ JAMAIS role === 3 ou role === 2 directement
```

---

## Structure src/ obligatoire

```txt
src/
├── api/
│   ├── client.ts          → Axios instance + interceptors Bearer + 401
│   ├── auth.ts
│   ├── bookings.ts
│   ├── trips.ts
│   └── transactions.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   └── layout/
│       └── AppLayout.tsx
├── hooks/
│   ├── useBookings.ts
│   ├── useBooking.ts
│   ├── useTrips.ts
│   └── useTransactions.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── sender/
│   │   ├── DashboardPage.tsx
│   │   ├── OverviewPage.tsx
│   │   ├── BookingsPage.tsx
│   │   ├── BookingDetailPage.tsx
│   │   └── DisputesPage.tsx
│   └── traveler/
│       ├── DashboardPage.tsx
│       ├── OverviewPage.tsx
│       ├── TripsPage.tsx
│       ├── TripDetailPage.tsx
│       └── PaymentsPage.tsx
├── store/
│   └── authStore.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

---

## Conventions nommage

```txt
Pages        → PascalCase + Page    (BookingsPage.tsx)
Hooks        → camelCase + use      (useBookings.ts)
Composants   → PascalCase           (BookingCard.tsx)
API fonctions → camelCase           (getBookings)
Types        → PascalCase           (Booking, Trip)
Constants    → UPPER_SNAKE          (UserRole)
```

---

## Imports — ordre obligatoire

```ts
// 1. React
import { useState } from "react";

// 2. Librairies externes
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

// 3. Internes (@/)
import { useAuthStore, isSender } from "@/store/authStore";
import { Button, Card, Badge } from "@/components/ui";
import { useBookings } from "@/hooks/useBookings";
import { bookingStatusLabel, bookingStatusColor } from "@/lib/utils";

// 4. Types
import type { Booking } from "@/types";
```

---

## Pattern page complet

```tsx
export default function BookingsPage() {
  const { data, isLoading, isError, refetch } = useBookings();

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Erreur lors du chargement</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );

  if (!data?.length)
    return (
      <div className="p-8 text-center text-gray-400">
        Aucune réservation pour le moment.
      </div>
    );

  return (
    <div className="p-8">
      {data.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

---

## Pattern hook TanStack Query

```ts
// src/hooks/useBookings.ts
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/api/bookings";
import type { Booking } from "@/types";

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
    staleTime: 30_000,
  });
}
```

---

## Pattern fonction API

```ts
// src/api/bookings.ts
import client from "./client";
import type { Booking } from "@/types";

export async function getBookings(): Promise<Booking[]> {
  const { data } = await client.get("/bookings");
  return data.data; // Laravel pagination wrapper
}

export async function getBooking(id: number): Promise<Booking> {
  const { data } = await client.get(`/bookings/${id}`);
  return data.data;
}
```

---

## Données — règles critiques

```txt
kg_reserved  → grammes  → afficher: (grams / 1000).toFixed(1) + ' kg'
price_per_kg → centimes → formatAmount(price_per_kg, 'EUR')
amount       → centimes → formatAmount(amount, currency)
capacity     → grammes  → (capacity / 1000).toFixed(0) + ' kg'

status_color (BookingResource) → couleur Filament ('blue', 'green'...)
  → NE PAS utiliser directement en Tailwind
  → UTILISER bookingStatusColor[booking.status]

transactions → middleware verified_user requis
  → si 403 → afficher "Vérification email requise"

payments → middleware verified_user + kyc requis
  → si 403 → afficher "KYC requis"
```

---

## Gestion erreurs API

```ts
// 401 → interceptor Axios → logout automatique
// 403 → toast.error(error.response.data.message)
// 422 → afficher errors[field][0]
// 500 → toast.error('Une erreur est survenue')
```

---

## Interdits absolus

```txt
❌ useEffect pour fetch                → useQuery obligatoire
❌ fetch() natif                       → Axios client obligatoire
❌ role === 3 ou role === 2            → UserRole.SENDER/TRAVELER
❌ any TypeScript                      → types stricts
❌ inline styles (style={{}})          → Tailwind classes
❌ console.log                         → supprimer avant commit
❌ logique métier dans composants      → API décide
❌ state global pour données serveur   → TanStack Query
❌ localStorage direct                 → Zustand persist
❌ données mockées                     → API réelle
❌ status_color Filament en Tailwind   → bookingStatusColor[status]
❌ HTML brut <button> <input>          → composants ui/
❌ classes Tailwind dupliquées         → extraire composant
```

---

## Routes API réelles confirmées

```txt
✅ POST   /api/v1/login
✅ POST   /api/v1/register
✅ GET    /api/v1/me
✅ POST   /api/v1/logout
✅ GET    /api/v1/bookings
✅ GET    /api/v1/bookings/:id
✅ GET    /api/v1/trips
✅ GET    /api/v1/trips/:id
✅ GET    /api/v1/transactions    ← verified_user requis
✅ GET    /api/v1/payments        ← verified_user + kyc requis

❌ GET    /api/v1/disputes        → n'existe pas MVP
❌ POST   /api/v1/bookings/:id/dispute → n'existe pas MVP
```
