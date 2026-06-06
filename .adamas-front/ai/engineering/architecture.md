# Architecture Frontend — GP-Valise

## Structure src/ obligatoire

```txt
src/
├── api/
│   ├── client.ts              → Axios instance + interceptors
│   ├── auth.ts                → login, logout, me
│   ├── bookings.ts            → CRUD bookings + actions
│   ├── disputes.ts            → disputes + messages
│   ├── trips.ts               → trips voyageur
│   ├── transactions.ts        → transactions
│   ├── kyc.ts                 → KYC submit + status
│   ├── pickupLocation.ts      → pickup location get/set
│   └── waitlist.ts            → waitlist public
│
├── components/
│   ├── ui/                    → design system
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── WaitlistForm.tsx
│   │   └── index.ts
│   └── layout/
│       └── AppLayout.tsx
│
├── hooks/                     → TanStack Query hooks
│   ├── useBookings.ts
│   ├── useBooking.ts
│   ├── useTrips.ts
│   ├── useTrip.ts
│   ├── useTransactions.ts
│   ├── useDispute.ts
│   ├── useDisputeMessages.ts
│   ├── usePickupLocation.ts
│   └── useKyc.ts
│
├── lib/
│   └── utils.ts               → cn, formatAmount, formatDate, labels, colors
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── public/
│   │   ├── LandingPage.tsx
│   │   └── TripsPublicPage.tsx
│   ├── sender/
│   │   ├── DashboardPage.tsx
│   │   ├── BookingsPage.tsx
│   │   ├── BookingDetailPage.tsx
│   │   └── DisputesPage.tsx
│   └── traveler/
│       ├── DashboardPage.tsx
│       ├── PendingApprovalsPage.tsx   ← nouveau
│       ├── TripsPage.tsx
│       ├── TripDetailPage.tsx
│       └── PaymentsPage.tsx
│
├── store/
│   └── authStore.ts           → Zustand auth
│
├── types/
│   └── index.ts               → types partagés
│
├── App.tsx                    → Router + guards
├── main.tsx
├── index.css                  → @import "tailwindcss"
└── vite-env.d.ts
```

---

## Pattern par couche

```txt
Page
  → importe hook TanStack Query
  → importe composants ui/
  → gère loading/error/empty
  → pas de fetch direct

Hook (src/hooks/)
  → importe fonction api/
  → retourne { data, isLoading, isError, mutate }
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

---

## Flow données

```txt
Page → useBookings() → api/bookings.ts → client.ts → Laravel API
                    ↓
              { data, isLoading, isError }
                    ↓
              <BookingCard /> + <Spinner /> + <ErrorState />
```

---

## Nouveaux modules à créer

### api/kyc.ts

```ts
export const getKyc = () => client.get("/kyc").then((r) => r.data.data);

export const submitKyc = (data: {
  id_photo_path: string;
  parcel_photo_path: string;
}) => client.post("/kyc", data).then((r) => r.data.data);
```

### api/pickupLocation.ts

```ts
export const getPickupLocation = (bookingId: number) =>
  client.get(`/bookings/${bookingId}/pickup-location`).then((r) => r.data.data);

export const setPickupLocation = (
  bookingId: number,
  data: PickupLocationPayload,
) =>
  client
    .post(`/bookings/${bookingId}/pickup-location`, data)
    .then((r) => r.data.data);
```

### api/disputes.ts

```ts
export const openDispute = (bookingId: number, reason: string) =>
  client
    .post(`/bookings/${bookingId}/dispute`, { reason })
    .then((r) => r.data.data);

export const getDispute = (disputeId: number) =>
  client.get(`/disputes/${disputeId}`).then((r) => r.data.data);

export const getDisputeMessages = (disputeId: number) =>
  client.get(`/disputes/${disputeId}/messages`).then((r) => r.data.data);

export const addDisputeMessage = (disputeId: number, body: string) =>
  client
    .post(`/disputes/${disputeId}/messages`, { body })
    .then((r) => r.data.data);
```

### api/bookings.ts — nouvelles actions

```ts
export const approveBooking = (bookingId: number) =>
  client.post(`/bookings/${bookingId}/approve`).then((r) => r.data);

export const declineBooking = (bookingId: number) =>
  client.post(`/bookings/${bookingId}/decline`).then((r) => r.data);
```

---

## Types — à ajouter dans src/types/index.ts

```ts
export interface PickupLocation {
  id: number;
  city: string;
  approximate_latitude: number;
  approximate_longitude: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  instructions: string | null;
  revealed: boolean;
}

export interface Dispute {
  id: number;
  booking_id: number;
  status: { code: string; label: string; color: string };
  reason: string;
  resolution: string | null;
  decision: string | null;
  opened_by: number;
  resolved_at: string | null;
  created_at: string;
  messages?: DisputeMessage[];
}

export interface DisputeMessage {
  id: number;
  dispute_id: number;
  body: string;
  attachments: string[] | null;
  author: { id: number; name: string; role: string };
  created_at: string;
}

export interface KycRequest {
  id: number;
  status: { code: string; label: string; color: string };
  id_photo_path: string;
  parcel_photo_path: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}
```

---

## Règles absolues

```txt
- useEffect pour fetch → INTERDIT
- données mockées en production → INTERDIT
- texte en anglais dans l'UI → INTERDIT
- logique métier dans les composants → INTERDIT
- appel API direct dans un composant → INTERDIT
```
