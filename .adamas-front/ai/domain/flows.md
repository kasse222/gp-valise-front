# Flows utilisateur — GP-Valise Frontend

## Principe fondamental

```txt
Frontend = orchestration UI
Backend  = source de vérité métier
```

Le frontend :

- affiche les données
- déclenche des actions utilisateur
- consomme les contrats API backend
- ne contient aucune logique métier critique

---

## Authentification — Bearer Token (MVP)

```txt
POST /api/v1/login
→ token retourné dans response body
→ stocké Zustand + persist localStorage
→ envoyé via Authorization: Bearer {token}

GET /api/v1/me
→ rehydration au démarrage

POST /api/v1/logout
→ supprime token Sanctum
→ clear Zustand
→ redirect /login
```

Zustand stocke :

```txt
user: AuthUser
token: string
```

---

## Flow Expéditeur (SENDER)

### Login

```txt
POST /api/v1/login
→ isPublicFrontendRole check
→ redirect /sender
```

### Dashboard /sender

```txt
GET /api/v1/bookings
→ stats calculées côté front depuis la liste
→ compte par statut : CONFIRMEE, LIVREE, EN_LITIGE
```

### Liste réservations /sender/bookings

```txt
GET /api/v1/bookings
→ liste paginée
→ filtres statut côté front
→ badges BookingStatusBadge
→ loading / error / empty states
→ clic → /sender/bookings/:id
```

### Détail réservation /sender/bookings/:id

```txt
GET /api/v1/bookings/:id
→ statut + badge
→ trajet (départ → destination)
→ voyageur email
→ items réservés
→ transactions liste
→ bouton "Ouvrir litige" si statut CONFIRMEE | LIVREE
```

### Ouvrir litige

```txt
POST /api/v1/bookings/:id/open-dispute
⚠️  Route inexistante — à créer backend Phase 7
En attendant : afficher statut seulement
```

### Mes litiges /sender/disputes

```txt
GET /api/v1/bookings?status=en_litige
→ filtre bookings EN_LITIGE
→ pas de route /disputes dédiée côté API MVP
```

---

## Flow Voyageur (TRAVELER)

### Login

```txt
POST /api/v1/login
→ redirect /traveler
```

### Dashboard /traveler

```txt
GET /api/v1/trips
→ stats calculées côté front
→ trips actifs, bookings reçus
```

### Mes trajets /traveler/trips

```txt
GET /api/v1/trips
→ liste trajets du voyageur connecté
→ capacité, statut, destination
→ clic → /traveler/trips/:id
```

### Détail trajet /traveler/trips/:id

```txt
GET /api/v1/trips/:id
→ infos trajet
→ bookings associés via GET /api/v1/bookings
→ payout estimé
```

### Paiements /traveler/payments

```txt
GET /api/v1/transactions
⚠️  Middleware verified_user + kyc requis
→ filtre type=payout côté front
→ montants en centimes → formatAmount()
```

---

## Routes API réelles confirmées

```txt
✅ POST   /api/v1/login
✅ GET    /api/v1/me
✅ POST   /api/v1/logout
✅ GET    /api/v1/bookings
✅ GET    /api/v1/bookings/:id
✅ GET    /api/v1/trips
✅ GET    /api/v1/trips/:id
✅ GET    /api/v1/transactions     ← verified_user requis
✅ GET    /api/v1/payments         ← verified_user + kyc requis

❌ GET    /api/v1/dashboard/sender   → n'existe pas
❌ GET    /api/v1/dashboard/traveler → n'existe pas
❌ GET    /api/v1/disputes           → n'existe pas
❌ POST   /api/v1/bookings/:id/dispute → n'existe pas (Phase 7)
```

---

## Contraintes middleware à gérer

```txt
transactions → verified_user requis
  → si 403 : afficher message "Vérification email requise"

payments → verified_user + kyc requis
  → si 403 : afficher message "KYC requis"
```

---

## Navigation Rules

```txt
Non authentifié         → redirect /login
401 API                 → logout + redirect /login
403 API                 → toast.error message backend
SENDER sur /traveler/*  → redirect /sender
TRAVELER sur /sender/*  → redirect /traveler
ADMIN / SUPER_ADMIN     → accès refusé → /login
```

---

## UI State Rules

Chaque page gère obligatoirement :

```txt
loading → <Spinner />
error   → message + bouton retry
empty   → message clair + action suggérée
success → données affichées
```

Interdits :

```txt
- écran vide pendant fetch
- useEffect pour fetch
- données mockées en production
```

---

## TanStack Query — hooks prévus

```txt
src/hooks/
  useBookings.ts      → GET /api/v1/bookings
  useBooking.ts       → GET /api/v1/bookings/:id
  useTrips.ts         → GET /api/v1/trips
  useTrip.ts          → GET /api/v1/trips/:id
  useTransactions.ts  → GET /api/v1/transactions
```

---

## Zustand Rules

```txt
Autorisé  → user, token, isAuthenticated
Interdit  → cache API, logique métier
```
