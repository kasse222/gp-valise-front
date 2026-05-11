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
Pages        → PascalCase + Page   (BookingsPage.tsx)
Hooks        → camelCase + use     (useBookings.ts)
Composants   → PascalCase          (BookingCard.tsx)
API fonctions → camelCase          (getBookings, createDispute)
Utils        → camelCase           (formatAmount)
Types        → PascalCase          (Booking, Dispute, Trip)
Constants    → UPPER_SNAKE         (UserRole)
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

// Après mutation — toujours invalider
queryClient.invalidateQueries({ queryKey: ["bookings"] });

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

## Interdits

```txt
❌ useEffect pour fetch
❌ fetch() natif
❌ any TypeScript
❌ inline styles
❌ console.log
❌ magic numbers (role === 3)
❌ logique métier dans composants
❌ state global pour données serveur
```

EOF
