# API Contracts — GP-Valise Frontend

## Base URL

```
https://safemove.tech/api/v1
```

## Auth

```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Auth

```
POST /register        → { first_name, last_name, email, password, role, phone?, country? }
POST /login           → { email, password }
GET  /me              → user courant
POST /logout
POST /logout-all
```

---

## Trips

```
GET  /trips           → liste publique (no auth)
GET  /trips/{id}      → détail trip (no auth)
POST /trips           → créer trip (TRAVELER)
PUT  /trips/{id}      → modifier trip (TRAVELER)
DELETE /trips/{id}    → supprimer trip (TRAVELER)
```

---

## Bookings

```
GET  /bookings                          → mes bookings
GET  /bookings/{id}                     → détail booking
POST /bookings                          → créer booking (SENDER)
DELETE /bookings/{id}                   → supprimer booking (SENDER)

POST /bookings/{id}/approve             → approuver (TRAVELER)
POST /bookings/{id}/decline             → refuser (TRAVELER)
POST /bookings/{id}/pay                 → payer (SENDER)
POST /bookings/{id}/confirm             → confirmer (TRAVELER)
POST /bookings/{id}/complete            → livrer (TRAVELER)
POST /bookings/{id}/cancel              → annuler (SENDER|TRAVELER)

GET  /bookings/{id}/items               → items du booking
GET  /bookings/{id}/status-histories    → historique statuts
```

## Booking statuts

```
PENDING_APPROVAL     → en attente approbation traveler
EN_PAIEMENT          → approuvé, en attente paiement sender
CONFIRMEE            → payé et confirmé
LIVREE               → livré, escrow 48h
TERMINE              → payout effectué
ANNULE               → annulé
EXPIREE              → délai paiement dépassé
DECLINED_BY_TRAVELER → refusé par le voyageur
EN_LITIGE            → litige ouvert
REMBOURSEE           → remboursé
```

---

## Pickup Location

```
GET  /bookings/{id}/pickup-location     → zone de dépôt
POST /bookings/{id}/pickup-location     → définir zone (TRAVELER)
```

### Réponse selon statut booking

```
Avant CONFIRMEE :
{
  city, approximate_latitude, approximate_longitude,
  latitude: null, longitude: null, address: null,
  revealed: false
}

Après CONFIRMEE :
{
  city, approximate_latitude, approximate_longitude,
  latitude, longitude, address, instructions,
  revealed: true
}
```

---

## Disputes

```
POST /bookings/{id}/dispute             → ouvrir litige (SENDER)
GET  /disputes/{id}                     → détail litige
GET  /disputes/{id}/messages            → messages
POST /disputes/{id}/messages            → ajouter message
```

### Dispute statuts

```
OPEN             → ouvert
UNDER_REVIEW     → en cours d'analyse
WAITING_CUSTOMER → en attente expéditeur
WAITING_TRAVELER → en attente voyageur
ESCALATED        → escaladé
RESOLVED         → résolu
```

---

## KYC

```
GET  /kyc    → statut KYC courant
POST /kyc    → soumettre demande { id_photo_path, parcel_photo_path }
```

### KYC statuts

```
PENDING  → en attente
APPROVED → approuvé
REJECTED → rejeté
```

---

## Luggages

```
GET    /luggages         → mes valises
GET    /luggages/{id}    → détail valise
POST   /luggages         → créer valise (SENDER)
PUT    /luggages/{id}    → modifier valise (SENDER)
DELETE /luggages/{id}    → supprimer valise (SENDER)
```

---

## Waitlist

```
POST /waitlist    → { email, name?, role?, message? }   (no auth)
```

---

## Transactions

```
GET  /transactions         → mes transactions (verified_user requis)
GET  /transactions/{id}    → détail transaction
POST /transactions         → créer charge
POST /transactions/{id}/refund → rembourser
```

---

## Errors

```json
422 → { message, errors: { field: ["message"] } }
401 → { message: "Unauthenticated." }
403 → { message: "This action is unauthorized." }
404 → { message: "Route introuvable.", status: 404 }
```
