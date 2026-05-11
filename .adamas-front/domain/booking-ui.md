# Booking UI — GP-Valise Frontend

## Endpoints utilisés

```txt
GET  /api/v1/bookings          → liste bookings utilisateur connecté
GET  /api/v1/bookings/:id      → détail booking avec relations
```

## Comportement GetUserBookings

```txt
SENDER   → retourne ses propres bookings (user_id = auth)
TRAVELER → retourne les bookings des trips qui lui appartiennent
```

## BookingResource — champs clés UI

```ts
{
  id: number
  status: string          // valeur enum ex: 'confirmee'
  status_label: string    // ex: 'Confirmée'
  status_color: string    // Filament color ex: 'blue' — NE PAS utiliser en Tailwind
  is_final: boolean       // true = pas d'action possible

  kg_reserved: number     // grammes — afficher: (kg_reserved / 1000).toFixed(1) + ' kg'
  comment: string | null

  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  payment_expires_at: string | null   // ISO string
  expired_at: string | null

  trip: TripResource | null
  user: UserResource | null
  items: BookingItemResource[]
  status_history: BookingStatusHistoryResource[]
}
```

⚠️ `status_color` = couleur Filament ('blue', 'green', 'red'...)
→ Utiliser `bookingStatusColor[booking.status]` de utils.ts pour Tailwind

## Affichage kg_reserved

```ts
// grammes → kg
const displayKg = (grams: number) => (grams / 1000).toFixed(1) + " kg";

// Exemple: 5000 → '5.0 kg'
```

## Actions par statut (SENDER)

```txt
en_attente       → aucune action
en_paiement      → aucune action (attente paiement PSP)
paiement_echoue  → aucune action
confirmee        → bouton "Ouvrir un litige"
livree           → bouton "Ouvrir un litige"
en_litige        → voir dispute
suspendue        → lecture seule
annule           → lecture seule (is_final)
remboursee       → lecture seule (is_final)
expiree          → lecture seule (is_final)
termine          → lecture seule (is_final)
```

## Actions par statut (TRAVELER)

```txt
en_paiement → attente
confirmee   → livraison gérée via Filament admin
livree      → escrow en cours
termine     → payout reçu
```

## canEnterDispute — statuts éligibles

```txt
CONFIRMEE → oui
LIVREE    → oui
Autres    → non
```

Condition backend supplémentaire :

```txt
- pas de PAYOUT COMPLETED existant
- pas de REFUND existant
- disputed_at === null
```

## Ouvrir un litige

```txt
⚠️ Route inexistante côté API MVP
Pas de POST /api/v1/bookings/:id/open-dispute

→ Cette action n'est pas exposée en API publique
→ Afficher statut EN_LITIGE après action Filament admin
→ Phase 7 : ajouter route API publique
```

## payment_expires_at

```ts
// Afficher countdown si statut en_paiement
const isExpired = new Date(booking.payment_expires_at) < new Date();

// Si expiré → afficher badge "Expiré"
// Si non → afficher "Expire dans X minutes"
```

## Pagination

```txt
GET /api/v1/bookings retourne pagination Laravel
{
  data: BookingResource[]
  links: { first, last, prev, next }
  meta: { current_page, last_page, per_page, total }
}
```

## QueryKey TanStack Query

```ts
queryKey: ["bookings"]; // liste
queryKey: ["booking", id]; // détail
```
