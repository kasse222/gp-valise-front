# GP-Valise Front — Safe Move

Frontend React/TypeScript pour la marketplace logistique **Safe Move** (nom technique : GP-Valise).

Interface utilisateur permettant à un expéditeur d'envoyer un objet via un voyageur tiers, avec paiement sécurisé escrow et routing PSP multi-corridor (PayDunya / Kkiapay / Stripe).

---

[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4.svg)](https://tailwindcss.com)

---

## Aperçu

Trois rôles utilisateurs avec interfaces dédiées :

- **Sender** — créer un bagage, réserver de la capacité, payer (mobile money / carte), suivre la livraison, ouvrir un litige.
- **Traveler** — publier un trajet (Standard / Express / Sur devis), voir les réservations reçues, confirmer les livraisons, recevoir les payouts.
- **Public** — landing page, recherche de trajets, inscription.

Flow complet opérationnel : `/trips → Réservation → EN_PAIEMENT → Payer → CONFIRMEE → LIVREE`

---

## Stack technique

- React 19 + TypeScript 6
- Vite 8 (HMR + build optimisé)
- Tailwind CSS 4
- React Router v7
- TanStack Query v5 (server state + cache)
- Zustand v5 (auth state, persist localStorage)
- Axios (Bearer interceptor)
- Lucide React (icônes)
- react-hot-toast (notifications)

---

## Architecture

```
src/
├── api/              → Clients Axios + functions API typées
│   ├── client.ts         → Bearer interceptor (auth routes)
│   ├── trips.ts          → publicClient (sans token)
│   ├── bookings.ts       → createBooking + payBooking
│   ├── users.ts          → updateUser
│   └── transactions.ts
├── components/ui/    → Composants UI réutilisables
│   ├── Button, Card, Input, Spinner, Badge
│   └── EmptyState        → empty states illustrés
├── hooks/            → Hooks TanStack Query
│   ├── useBooking, useBookings
│   ├── useTrip, useTrips
│   └── useTransactions
├── pages/
│   ├── public/       → Landing, TripsPublic
│   ├── auth/         → Login, Register
│   ├── sender/       → Dashboard, Bookings, Detail, Disputes
│   ├── traveler/    → Dashboard, Trips, Detail, Payments, CreateTrip
│   ├── payment/      → Success, Cancel (callbacks PSP)
│   └── profile/      → ProfilePage (phone + country)
├── store/            → Zustand
│   └── authStore.ts      → user, token, persist
├── lib/
│   └── utils.ts          → formatAmount, formatDate, status maps
└── types/            → Types TypeScript partagés
```

---

## Conventions critiques

Le frontend respecte strictement les conventions financières du backend :

```
Montants     : integer minor units (centimes)
              ex : 1500 = 15.00€ → formatAmount(amount, currency)

Poids trips  : integer grammes
              ex : 25000 = 25kg → / 1000 pour affichage

Poids luggage : smallint dixièmes de kg (DB)
              ex : 55 = 5.5kg → * 10 pour envoi API

price_per_kg : centimes/kg → / 100 pour affichage
```

**Jamais de float pour money ou poids.** `Math.round()` sur toutes les conversions.

---

## Patterns

**Fetching :** TanStack Query — jamais `useEffect`.

```ts
const { data: trips, isLoading } = useQuery({
  queryKey: ["trips-public"],
  queryFn: getTrips,
  staleTime: 60_000,
});
```

**Mutations :** `useMutation` avec invalidation cache.

```ts
const payMutation = useMutation({
  mutationFn: () => payBooking(bookingId, payload),
  onSuccess: (data) => {
    if (data.payment_url) {
      window.location.href = data.payment_url;
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
  },
});
```

**Auth :** Bearer Token via Zustand persist.

```ts
const user = useAuthStore((s) => s.user);
const isAuth = useAuthStore((s) => s.isAuthenticated());
```

**Routes protégées :** `PrivateRoute` wrapper + redirect `/login`.

---

## Flow PSP routing

Le country de l'utilisateur détermine le PSP automatiquement :

```
SN → PayDunya (Orange Money, Wave, Free Money, Expresso)
BJ → Kkiapay (MTN Bénin, Moov)
CI → Kkiapay (MTN CI, Orange CI)
MA → Stripe (carte bancaire)
FR → Stripe (carte bancaire)
```

L'utilisateur sélectionne son pays dans `/profile`, le reste est automatique.

---

## Installation locale

```bash
git clone https://github.com/kasse222/gp-valise-front.git
cd gp-valise-front
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:3000` et consomme l'API sur `http://localhost:8000`.

---

## Credentials démo

```
sender@gpvalise.com   / password  (SENDER)
traveler@gpvalise.com / password  (TRAVELER)
admin@gpvalise.com    / password  (ADMIN — interface Filament backend)
```

---

## .adamas-front

Le dossier `.adamas-front/` documente la gouvernance frontend :

```
.adamas-front/
├── architecture/    → patterns Zustand, TanStack Query, Axios
├── conventions/     → types, naming, money/weight rules
├── design-system/   → couleurs, typo, composants
└── decision-log.md  → choix architecturaux datés
```

---

## Roadmap

```
✅ Auth flow (login + register + persist)
✅ Landing page Safe Move
✅ Trips public + réservation
✅ Sender dashboard + bookings + paiement
✅ Traveler dashboard + trips + create trip
✅ Profile (phone + country)
✅ Payment success/cancel callbacks
✅ PayDunya / Kkiapay frontend ready
⏳ Notifications temps réel
⏳ Upload pièces jointes (litiges)
⏳ Multi-langue (FR / EN)
```

---

## Auteur

**Lamine Kasse**
Frontend / Fullstack Engineer — React / TypeScript / Tailwind

📍 Casablanca, Maroc
📧 kasse.lamine.dev@icloud.com
🔗 [LinkedIn](https://www.linkedin.com/in/lamine-kasse-05742536a)
🔗 [Backend API](https://github.com/kasse222/gp-valise-api)
