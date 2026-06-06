# Composants UI — GP-Valise Frontend

## Design system src/components/ui/

### Button

```tsx
import { Button } from '@/components/ui'

<Button variant="primary"   loading={isPending}>Se connecter</Button>
<Button variant="secondary"                    >Annuler</Button>
<Button variant="danger"                       >Supprimer</Button>
<Button variant="ghost"                        >Voir plus</Button>
<Button size="sm" />
<Button size="md" />  // default
<Button size="lg" />
```

### Input

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  placeholder="vous@exemple.com"
/>
```

### Card

```tsx
<Card className="p-6">contenu</Card>
```

### Badge

```tsx
<Badge variant="success">Confirmée</Badge>
<Badge variant="warning">En paiement</Badge>
<Badge variant="danger" >En litige</Badge>
<Badge variant="gray"   >Expirée</Badge>

// Booking status automatique
<BookingStatusBadge status={booking.status.code} />

// Dispute status automatique
<DisputeStatusBadge status={dispute.status.code} />

// KYC status automatique
<KycStatusBadge status={kyc.status.code} />
```

### Spinner

```tsx
<Spinner />
<Spinner className="h-8 w-8" />
```

---

## Nouveaux composants à créer

### BookingStatusBadge

```tsx
// src/components/ui/BookingStatusBadge.tsx
import { bookingStatusLabel, bookingStatusColor } from "@/lib/utils";

export function BookingStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${bookingStatusColor[status]}`}
    >
      {bookingStatusLabel[status] ?? status}
    </span>
  );
}
```

### DisputeStatusBadge

```tsx
// src/components/ui/DisputeStatusBadge.tsx
import { disputeStatusLabel, disputeStatusColor } from "@/lib/utils";

export function DisputeStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${disputeStatusColor[status]}`}
    >
      {disputeStatusLabel[status] ?? status}
    </span>
  );
}
```

### KycStatusBadge

```tsx
// src/components/ui/KycStatusBadge.tsx
import { kycStatusLabel, kycStatusColor } from "@/lib/utils";

export function KycStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${kycStatusColor[status]}`}
    >
      {kycStatusLabel[status] ?? status}
    </span>
  );
}
```

### PickupLocationCard

```tsx
// src/components/booking/PickupLocationCard.tsx
// Affiche la zone approximative ou exacte selon revealed

<PickupLocationCard
  pickupLocation={pickupLocation}
  // revealed: false → carte zone ~500m
  // revealed: true  → carte + adresse exacte + instructions
/>
```

### DisputeMessages

```tsx
// src/components/dispute/DisputeMessages.tsx
// Liste chronologique de messages avec bulles (gauche/droite)

<DisputeMessages
  messages={messages}
  currentUserId={user.id}
  onSend={(body) => addMessage(disputeId, body)}
  disabled={dispute.status.code === "resolved"}
/>
```

### PendingApprovalCard

```tsx
// src/components/booking/PendingApprovalCard.tsx
// Carte pour les demandes en attente côté Traveler

<PendingApprovalCard
  booking={booking}
  onApprove={() => approveBooking(booking.id)}
  onDecline={() => declineBooking(booking.id)}
  isLoading={isPending}
/>
```

### PaymentTimer

```tsx
// src/components/booking/PaymentTimer.tsx
// Compte à rebours payment_expires_at

<PaymentTimer expiresAt={booking.payment_expires_at} />
// Affiche: "Expire dans 14:32" → rouge si < 5 min
```

### EmptyState

```tsx
// src/components/ui/EmptyState.tsx

<EmptyState
  title="Aucune réservation"
  description="Vous n'avez pas encore de réservation."
  action={{ label: "Rechercher un trajet", href: "/trips" }}
/>
```

### ErrorState

```tsx
// src/components/ui/ErrorState.tsx

<ErrorState
  message="Impossible de charger les données."
  onRetry={() => refetch()}
/>
```

---

## AppLayout

```tsx
<AppLayout navItems={navItems}>
  <Routes>...</Routes>
</AppLayout>

// navItems shape:
{ label: string, path: string, icon: ReactNode }
```

---

## Règles

```txt
- Toujours utiliser les composants ui/ — pas de HTML brut stylé
- Pas de Tailwind dupliqué — créer composant si besoin
- Props typées obligatoires
- className prop forwarded sur tous les composants
- Texte toujours en français dans les composants
- Pas d'appel API dans les composants ui/
- EmptyState obligatoire sur toute liste vide
- ErrorState obligatoire sur toute erreur de fetch
- Spinner obligatoire pendant le loading
```
