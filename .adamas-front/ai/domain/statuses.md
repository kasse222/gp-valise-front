# Statuts — GP-Valise Frontend

> Source de vérité : enums backend Laravel.
> Le frontend ne redéfinit pas les règles — il affiche.

---

## Booking — BookingStatusEnum

| Valeur               | Label                    | Couleur Tailwind              |
| -------------------- | ------------------------ | ----------------------------- |
| en_attente           | En attente               | bg-gray-100 text-gray-700     |
| pending_approval     | En attente d'approbation | bg-yellow-100 text-yellow-800 |
| en_paiement          | En paiement              | bg-yellow-100 text-yellow-800 |
| paiement_echoue      | Paiement échoué          | bg-red-100 text-red-700       |
| confirmee            | Confirmée                | bg-blue-100 text-blue-800     |
| livree               | Livrée                   | bg-green-100 text-green-700   |
| termine              | Terminée                 | bg-green-100 text-green-700   |
| annule               | Annulée                  | bg-red-100 text-red-700       |
| remboursee           | Remboursée               | bg-purple-100 text-purple-700 |
| expiree              | Expirée                  | bg-orange-100 text-orange-700 |
| en_litige            | En litige                | bg-red-100 text-red-700       |
| suspendue            | Suspendue                | bg-gray-100 text-gray-500     |
| declined_by_traveler | Refusée par le voyageur  | bg-red-100 text-red-700       |

Actions possibles par statut (SENDER) :

```txt
pending_approval      → annuler
en_paiement           → payer / annuler (+ timer countdown)
confirmee             → voir adresse dépôt / ouvrir litige
livree                → ouvrir litige
en_litige             → voir dispute / ajouter message
declined_by_traveler  → rechercher nouveau trajet
autres                → lecture seule
```

Actions possibles par statut (TRAVELER) :

```txt
pending_approval  → accepter / refuser
confirmee         → définir point dépôt / marquer livré
livree            → — (escrow en cours)
autres            → lecture seule
```

Statuts finaux (pas d'action) :

```txt
annule / remboursee / expiree / termine / declined_by_traveler
```

---

## KYC — KycStatusEnum

| Valeur   | Label      | Couleur Tailwind              |
| -------- | ---------- | ----------------------------- |
| pending  | En attente | bg-yellow-100 text-yellow-800 |
| approved | Approuvé   | bg-green-100 text-green-700   |
| rejected | Rejeté     | bg-red-100 text-red-700       |

Actions par statut :

```txt
null     → bouton "Soumettre mon KYC"
pending  → message "En cours de vérification"
approved → badge "Vérifié" dans navbar
rejected → afficher rejection_reason + bouton "Resoumettre"
```

---

## Pickup Location

```txt
revealed: false → coordonnées exactes masquées (avant CONFIRMEE)
revealed: true  → adresse + coordonnées exactes visibles (après CONFIRMEE)
```

Affichage :

```txt
revealed: false → carte avec zone approximative (~500m)
                  message "Adresse révélée après paiement"

revealed: true  → carte avec pin exact
                  adresse complète
                  instructions si présentes
                  bouton "Copier" + "Ouvrir dans Maps"
```

---

## Dispute — DisputeStatusEnum

| Valeur           | Label                 | Couleur Tailwind              |
| ---------------- | --------------------- | ----------------------------- |
| open             | Ouvert                | bg-yellow-100 text-yellow-800 |
| under_review     | En cours d'analyse    | bg-blue-100 text-blue-700     |
| waiting_customer | En attente expéditeur | bg-orange-100 text-orange-700 |
| waiting_traveler | En attente voyageur   | bg-orange-100 text-orange-700 |
| escalated        | Escaladé              | bg-red-100 text-red-700       |
| resolved         | Résolu                | bg-green-100 text-green-700   |

Statut terminal : `resolved` — pas d'action possible.

Actions SENDER/TRAVELER par statut :

```txt
open / under_review / waiting_* / escalated → ajouter message
resolved                                    → lecture seule
```

---

## Transaction — TransactionTypeEnum + TransactionStatusEnum

Types :

| Valeur      | Label              | Couleur       |
| ----------- | ------------------ | ------------- |
| charge      | Encaissement       | bg-blue-100   |
| refund      | Remboursement      | bg-yellow-100 |
| fee         | Commission         | bg-indigo-100 |
| payment_fee | Frais PSP          | bg-red-100    |
| payout      | Versement voyageur | bg-green-100  |

Statuts :

| Valeur     | Label         | Couleur       |
| ---------- | ------------- | ------------- |
| pending    | En attente    | bg-gray-100   |
| processing | En traitement | bg-blue-100   |
| completed  | Complétée     | bg-green-100  |
| failed     | Échouée       | bg-red-100    |
| refunded   | Remboursée    | bg-yellow-100 |
| cancelled  | Annulée       | bg-red-100    |

---

## Trip — TripStatusEnum

| Valeur    | Label      | Couleur      |
| --------- | ---------- | ------------ |
| pending   | En attente | bg-gray-100  |
| active    | Actif      | bg-green-100 |
| cancelled | Annulé     | bg-red-100   |
| completed | Terminé    | bg-blue-100  |

Trip types — TripTypeEnum :

| Valeur    | Label     |
| --------- | --------- |
| standard  | Standard  |
| express   | Express   |
| sur_devis | Sur devis |

---

## Luggage — LuggageStatusEnum

| Valeur     | Label      | Couleur       |
| ---------- | ---------- | ------------- |
| en_attente | En attente | bg-gray-100   |
| reservee   | Réservée   | bg-blue-100   |
| en_transit | En transit | bg-indigo-100 |
| livree     | Livrée     | bg-green-100  |
| annulee    | Annulée    | bg-red-100    |
| perdue     | Perdue     | bg-orange-100 |
| retour     | Retour     | bg-purple-100 |

---

## Dispute Decision — DisputeDecisionEnum

| Valeur | Label                    |
| ------ | ------------------------ |
| refund | Remboursement expéditeur |
| payout | Paiement voyageur        |

---

## Currency — CurrencyEnum

| Valeur | Symbole | Label           |
| ------ | ------- | --------------- |
| EUR    | €       | Euro            |
| USD    | $       | Dollar US       |
| XOF    | CFA     | Franc CFA       |
| GBP    | £       | Livre sterling  |
| MAD    | DH      | Dirham marocain |

Devise par défaut : EUR

---

## Plan — PlanTypeEnum

| Valeur     | Label      |
| ---------- | ---------- |
| free       | Gratuit    |
| basic      | Basique    |
| premium    | Premium    |
| entreprise | Entreprise |

---

## Implémentation TypeScript — src/lib/utils.ts

```ts
// Booking
export const bookingStatusLabel: Record<string, string> = {
  en_attente: "En attente",
  pending_approval: "En attente d'approbation",
  en_paiement: "En paiement",
  paiement_echoue: "Paiement échoué",
  confirmee: "Confirmée",
  livree: "Livrée",
  termine: "Terminée",
  annule: "Annulée",
  remboursee: "Remboursée",
  expiree: "Expirée",
  en_litige: "En litige",
  suspendue: "Suspendue",
  declined_by_traveler: "Refusée par le voyageur",
};

export const bookingStatusColor: Record<string, string> = {
  en_attente: "bg-gray-100 text-gray-700",
  pending_approval: "bg-yellow-100 text-yellow-800",
  en_paiement: "bg-yellow-100 text-yellow-800",
  paiement_echoue: "bg-red-100 text-red-700",
  confirmee: "bg-blue-100 text-blue-800",
  livree: "bg-green-100 text-green-700",
  termine: "bg-green-100 text-green-700",
  annule: "bg-red-100 text-red-700",
  remboursee: "bg-purple-100 text-purple-700",
  expiree: "bg-orange-100 text-orange-700",
  en_litige: "bg-red-100 text-red-700",
  suspendue: "bg-gray-100 text-gray-500",
  declined_by_traveler: "bg-red-100 text-red-700",
};

// KYC
export const kycStatusLabel: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

export const kycStatusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

// Dispute
export const disputeStatusLabel: Record<string, string> = {
  open: "Ouvert",
  under_review: "En cours d'analyse",
  waiting_customer: "En attente expéditeur",
  waiting_traveler: "En attente voyageur",
  escalated: "Escaladé",
  resolved: "Résolu",
};

export const disputeStatusColor: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-700",
  waiting_customer: "bg-orange-100 text-orange-700",
  waiting_traveler: "bg-orange-100 text-orange-700",
  escalated: "bg-red-100 text-red-700",
  resolved: "bg-green-100 text-green-700",
};

// Transaction type
export const transactionTypeLabel: Record<string, string> = {
  charge: "Encaissement",
  refund: "Remboursement",
  fee: "Commission",
  payment_fee: "Frais PSP",
  payout: "Versement voyageur",
};

// Transaction status
export const transactionStatusLabel: Record<string, string> = {
  pending: "En attente",
  processing: "En traitement",
  completed: "Complétée",
  failed: "Échouée",
  refunded: "Remboursée",
  cancelled: "Annulée",
};

// Trip status
export const tripStatusLabel: Record<string, string> = {
  pending: "En attente",
  active: "Actif",
  cancelled: "Annulé",
  completed: "Terminé",
};

export const tripStatusColor: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};
```
