# Dispute UI — GP-Valise Frontend

## Contexte

```txt
booking.status = EN_LITIGE    ← signal financier
dispute.status                ← workflow arbitrage
```

Un booking EN_LITIGE a toujours une entrée dans `disputes`.

## Endpoints disponibles

```txt
⚠️ Aucune route API publique /disputes n'existe en MVP

Accès disputes via bookings :
GET /api/v1/bookings?status=en_litige  → bookings EN_LITIGE du user
GET /api/v1/bookings/:id               → inclut dispute via relation si chargée

Routes dispute dédiées → Phase 7
```

## Affichage disputes SENDER (MVP)

```txt
/sender/disputes
→ GET /api/v1/bookings
→ filtrer client-side : status === 'en_litige'
→ afficher liste bookings EN_LITIGE
```

## DisputeStatusEnum — workflow

```txt
OPEN → UNDER_REVIEW → WAITING_CUSTOMER → RESOLVED
                    → WAITING_TRAVELER → RESOLVED
                    → ESCALATED       → RESOLVED
     → ESCALATED   → UNDER_REVIEW    → RESOLVED
```

## Actions par rôle

### SENDER (expéditeur)

```txt
- Voir statut dispute
- Voir messages
- Phase 7 : ajouter message via API
```

### TRAVELER (voyageur)

```txt
- Voir statut dispute
- Voir messages
- Phase 7 : ajouter message via API
```

### ADMIN (Filament uniquement — pas ce frontend)

```txt
- UpdateDisputeStatus → changer statut workflow
- AddDisputeMessage   → ajouter message
- ResolveDispute      → décision finale refund|payout
```

## AddDisputeMessage — règles backend

```txt
Acteurs autorisés :
  - expéditeur du booking (booking.user_id)
  - voyageur du trip (booking.trip.user_id)
  - admin / super_admin

Conditions :
  - dispute non RESOLVED
  - body non vide
```

## OpenDispute — règles backend

```txt
Acteurs : expéditeur du booking + admin
Statuts éligibles : CONFIRMEE | LIVREE
Bloqué si :
  - PAYOUT COMPLETED existant
  - REFUND existant (PENDING ou COMPLETED)
  - disputed_at non null (idempotence)
```

## ResolveDispute — admin Filament uniquement

```txt
Décisions :
  REFUND → AdminRefundTransaction → booking REMBOURSEE
  PAYOUT → writePayoutPaid → booking TERMINE

Conditions PAYOUT :
  → PAYOUT PENDING requis (booking livré avant litige)
  → Si booking en litige depuis CONFIRMEE → seul REFUND possible
```

## Statuts dispute — UI

```ts
// src/lib/utils.ts
disputeStatusLabel['open']             → 'Ouvert'
disputeStatusLabel['under_review']     → 'En cours d\'analyse'
disputeStatusLabel['waiting_customer'] → 'En attente expéditeur'
disputeStatusLabel['waiting_traveler'] → 'En attente voyageur'
disputeStatusLabel['escalated']        → 'Escaladé'
disputeStatusLabel['resolved']         → 'Résolu'

// Couleurs Tailwind
disputeStatusColor['open']             → 'bg-yellow-100 text-yellow-800'
disputeStatusColor['under_review']     → 'bg-blue-100 text-blue-700'
disputeStatusColor['waiting_customer'] → 'bg-orange-100 text-orange-700'
disputeStatusColor['waiting_traveler'] → 'bg-orange-100 text-orange-700'
disputeStatusColor['escalated']        → 'bg-red-100 text-red-700'
disputeStatusColor['resolved']         → 'bg-green-100 text-green-700'
```

## QueryKey TanStack Query

```ts
// Pas de query dispute dédiée en MVP
// Disputes = bookings filtrés EN_LITIGE

queryKey: ["bookings", { status: "en_litige" }];
queryKey: ["booking", id]; // détail avec dispute
```

## Roadmap Phase 7

```txt
GET  /api/v1/disputes              → liste disputes user
GET  /api/v1/disputes/:id          → détail + messages
POST /api/v1/disputes/:id/messages → ajouter message
```
