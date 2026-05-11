# Architecture Frontend — GP-Valise

## Structure src/ obligatoire

```txt
src/
├── api/
│   ├── client.ts          → Axios instance + interceptors
│   ├── auth.ts            → login, logout, me
│   ├── bookings.ts        → CRUD bookings
│   ├── disputes.ts        → disputes + messages
│   ├── trips.ts           → trips voyageur
│   └── transactions.ts    → transactions
│
├── components/
│   ├── ui/                → design system
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   └── layout/
│       └── AppLayout.tsx
│
├── hooks/                 → TanStack Query hooks
│   ├── useBookings.ts
│   ├── useBooking.ts
│   ├── useDisputes.ts
│   ├── useTrips.ts
│   └── useTransactions.ts
│
├── lib/
│   └── utils.ts           → cn, formatAmount, formatDate, labels, colors
│
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
│
├── store/
│   └── authStore.ts       → Zustand auth
│
├── types/
│   └── index.ts           → types partagés
│
├── App.tsx                → Router + guards
├── main.tsx
├── index.css              → @import "tailwindcss"
└── vite-env.d.ts
```

## Pattern par couche

```txt
Page
  → importe hook TanStack Query
  → importe composants ui/
  → gère loading/error/empty
  → pas de fetch direct

Hook (src/hooks/)
  → importe fonction api/
  → retourne { data, isLoading, isError }
  → queryKey stable

API function (src/api/)
  → importe client Axios
  → retourne Promise<T>
  → pas de logique UI

Composant ui/
  → props typées
  → pas de state externe
  → pas d'appel API
```

## Flow données

```txt
Page → useBookings() → api/bookings.ts → client.ts → Laravel API
                    ↓
              { data, isLoading, isError }
                    ↓
              <BookingCard /> + <Spinner /> + <ErrorState />
```
