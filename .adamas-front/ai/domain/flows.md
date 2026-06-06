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
→ isSender check
→ redirect /sender
```

### Dashboard /sender

```txt
GET /api/v1/bookings
→ stats calculées côté front depuis la liste
→ compte par statut : PENDING_APPROVAL, EN_PAIEMENT, CONFIRMEE, LIVREE, EN_LITIGE
```

### Liste réservations /sender/bookings

```txt
GET /api/v1/bookings
→ filtres statut côté front (badges cliquables)
→ badges BookingStatusBadge
→ loading / error / empty states
→ clic → /sender/bookings/:id
```

### Détail réservation /sender/bookings/:id

```txt
GET /api/v1/bookings/:id

Affichage selon statut :

PENDING_APPROVAL
  → "En attente d'approbation du voyageur"
  → bouton payer DÉSACTIVÉ
  → bouton annuler

EN_PAIEMENT
  → timer countdown payment_expires_at
  → bouton "Payer"
  → bouton annuler

CONFIRMEE
  → GET /api/v1/bookings/:id/pickup-location
  → adresse exacte si revealed: true
  → bouton "Ouvrir un litige"

LIVREE
  → escrow en cours
  → bouton "Ouvrir un litige"

EN_LITIGE
  → GET /api/v1/disputes/:dispute_id
  → messages chronologiques
  → formulaire ajout message

DECLINED_BY_TRAVELER
  → "Refusée par le voyageur"
  → lien "Rechercher un autre trajet"

TERMINE / REMBOURSEE / ANNULE / EXPIREE
  → lecture seule
```

### Ouvrir litige

```txt
POST /api/v1/bookings/:id/dispute
→ textarea raison (min 10 chars)
→ visible si statut CONFIRMEE ou LIVREE
```

### Mes litiges /sender/disputes

```txt
Filtrer GET /api/v1/bookings où status === en_litige
→ clic → /sender/bookings/:id (section dispute)
```

### KYC /sender/kyc

```txt
GET /api/v1/kyc → statut actuel
POST /api/v1/kyc → soumettre photos

Affichage selon statut :
null    → formulaire soumission
PENDING → "En cours de vérification"
APPROVED → badge "Vérifié"
REJECTED → raison + bouton resoumettre
```

---

## Flow Voyageur (TRAVELER)

### Login

```txt
POST /api/v1/login
→ isTraveler check
→ redirect /traveler
```

### Dashboard /traveler

```txt
GET /api/v1/bookings
→ filtrer bookings sur ses trips (trip.user_id === user.id)
→ Section "Demandes en attente" : statut PENDING_APPROVAL
→ stats : trips actifs, demandes en attente, bookings confirmés
```

### Demandes en attente

```txt
Section prioritaire en haut du dashboard

GET /api/v1/bookings → filter status === pending_approval

Chaque carte :
  - Expéditeur (nom)
  - Trajet concerné
  - Poids réservé + prix
  - Date de la demande
  - Bouton "Accepter" → POST /api/v1/bookings/:id/approve
  - Bouton "Refuser"  → POST /api/v1/bookings/:id/decline
```

### Mes trajets /traveler/trips

```txt
GET /api/v1/trips
→ filtrer par trip.user_id === user.id côté front
→ capacité, statut, destination
→ clic → /traveler/trips/:id
```

### Détail trajet /traveler/trips/:id

```txt
GET /api/v1/trips/:id
→ bookings associés
→ payout estimé par booking confirmé

Par booking CONFIRMEE :
  → GET /api/v1/bookings/:id/pickup-location
  → si pas défini : bouton "Définir le point de dépôt"
  → formulaire : adresse, coordonnées, instructions
  → POST /api/v1/bookings/:id/pickup-location

Par booking CONFIRMEE/LIVREE :
  → bouton "Marquer comme livré" → POST /api/v1/bookings/:id/complete
```

### Paiements /traveler/payments

```txt
GET /api/v1/transactions ← verified_user + kyc requis
→ filtrer type === payout
→ montants en centimes → formatAmount()
```

---

## Routes API confirmées ✅

```txt
✅ POST   /api/v1/login
✅ POST   /api/v1/logout
✅ GET    /api/v1/me

✅ GET    /api/v1/trips
✅ GET    /api/v1/trips/:id
✅ POST   /api/v1/trips                          (TRAVELER)
✅ PUT    /api/v1/trips/:id                      (TRAVELER)
✅ DELETE /api/v1/trips/:id                      (TRAVELER)

✅ GET    /api/v1/bookings
✅ GET    /api/v1/bookings/:id
✅ POST   /api/v1/bookings                       (SENDER)
✅ DELETE /api/v1/bookings/:id                   (SENDER)
✅ POST   /api/v1/bookings/:id/approve           (TRAVELER)
✅ POST   /api/v1/bookings/:id/decline           (TRAVELER)
✅ POST   /api/v1/bookings/:id/pay               (SENDER)
✅ POST   /api/v1/bookings/:id/confirm           (TRAVELER)
✅ POST   /api/v1/bookings/:id/complete          (TRAVELER)
✅ POST   /api/v1/bookings/:id/cancel            (SENDER|TRAVELER)
✅ POST   /api/v1/bookings/:id/dispute           (SENDER)

✅ GET    /api/v1/bookings/:id/pickup-location
✅ POST   /api/v1/bookings/:id/pickup-location   (TRAVELER)

✅ GET    /api/v1/disputes/:id
✅ GET    /api/v1/disputes/:id/messages
✅ POST   /api/v1/disputes/:id/messages

✅ GET    /api/v1/kyc
✅ POST   /api/v1/kyc

✅ GET    /api/v1/transactions                   (verified_user)
✅ GET    /api/v1/payments                       (verified_user + kyc)

✅ POST   /api/v1/waitlist                       (public)
```

---

## Contraintes middleware à gérer

```txt
transactions / payments → verified_user requis
  → si 403 : "Vérification requise"

payments → kyc requis
  → si 403 : "KYC requis — soumettre vos documents"
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
loading → <Spinner /> ou skeleton
error   → message + bouton retry
empty   → message clair + action suggérée
success → données affichées
```

Interdits :

```txt
- écran vide pendant fetch
- useEffect pour fetch
- données mockées en production
- texte en anglais dans l'UI
```

---

## TanStack Query — hooks

```txt
src/hooks/
  useBookings.ts            → GET /api/v1/bookings
  useBooking.ts             → GET /api/v1/bookings/:id
  useTrips.ts               → GET /api/v1/trips
  useTrip.ts                → GET /api/v1/trips/:id
  useTransactions.ts        → GET /api/v1/transactions
  usePickupLocation.ts      → GET /api/v1/bookings/:id/pickup-location
  useDispute.ts             → GET /api/v1/disputes/:id
  useDisputeMessages.ts     → GET /api/v1/disputes/:id/messages
  useKyc.ts                 → GET /api/v1/kyc
```

---

## Zustand Rules

```txt
Autorisé  → user, token, isAuthenticated
Interdit  → cache API, logique métier
```
