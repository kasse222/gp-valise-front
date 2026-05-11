# Statuts — GP-Valise Frontend

> Source de vérité : enums backend Laravel.
> Le frontend ne redéfinit pas les règles — il affiche.

---

## Booking — BookingStatusEnum

| Valeur          | Label           | Couleur Tailwind              |
| --------------- | --------------- | ----------------------------- |
| en_attente      | En attente      | bg-gray-100 text-gray-700     |
| en_paiement     | En paiement     | bg-yellow-100 text-yellow-800 |
| paiement_echoue | Paiement échoué | bg-red-100 text-red-700       |
| confirmee       | Confirmée       | bg-blue-100 text-blue-800     |
| livree          | Livrée          | bg-green-100 text-green-700   |
| termine         | Terminée        | bg-green-100 text-green-700   |
| annule          | Annulée         | bg-red-100 text-red-700       |
| remboursee      | Remboursée      | bg-purple-100 text-purple-700 |
| expiree         | Expirée         | bg-orange-100 text-orange-700 |
| en_litige       | En litige       | bg-red-100 text-red-700       |
| suspendue       | Suspendue       | bg-gray-100 text-gray-500     |

Actions possibles par statut (SENDER) :

```txt
confirmee       → bouton "Ouvrir litige"
livree          → bouton "Ouvrir litige"
en_litige       → voir dispute
autres          → lecture seule
```

Statuts finaux (pas d'action) :

```txt
annule / remboursee / expiree / termine
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

Actions SENDER par statut :

```txt
open / under_review / waiting_customer → ajouter message
waiting_traveler                       → ajouter message
escalated                              → ajouter message
resolved                               → lecture seule
```

---

## Transaction — TransactionTypeEnum + TransactionStatusEnum

Types :
| Valeur | Label | Couleur |
|---|---|---|
| charge | Encaissement | bg-blue-100 |
| refund | Remboursement | bg-yellow-100 |
| fee | Commission | bg-indigo-100 |
| payment_fee | Frais PSP | bg-red-100 |
| payout | Versement voyageur | bg-green-100 |

Statuts :
| Valeur | Label | Couleur |
|---|---|---|
| pending | En attente | bg-gray-100 |
| processing | En traitement | bg-blue-100 |
| completed | Complétée | bg-green-100 |
| failed | Échouée | bg-red-100 |
| refunded | Remboursée | bg-yellow-100 |
| cancelled | Annulée | bg-red-100 |

---

## Trip — TripStatusEnum

| Valeur    | Label      | Couleur      |
| --------- | ---------- | ------------ |
| pending   | En attente | bg-gray-100  |
| active    | Actif      | bg-green-100 |
| cancelled | Annulé     | bg-red-100   |
| completed | Terminé    | bg-blue-100  |

Trip types — TripTypeEnum :
| Valeur | Label |
|---|---|
| standard | Standard |
| express | Express |
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

## Payment — PaymentStatusEnum

| Valeur | Label      | Couleur       |
| ------ | ---------- | ------------- |
| 0      | En attente | bg-gray-100   |
| 1      | En cours   | bg-blue-100   |
| 2      | Succès     | bg-green-100  |
| 3      | Échec      | bg-red-100    |
| 4      | Remboursé  | bg-orange-100 |
| 5      | Annulé     | bg-gray-100   |
| 6      | Fraude     | bg-red-100    |

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

## Invitation — InvitationStatusEnum

| Valeur | Label      | Couleur       |
| ------ | ---------- | ------------- |
| 0      | En attente | bg-yellow-100 |
| 1      | Acceptée   | bg-green-100  |
| 2      | Expirée    | bg-red-100    |

---

## Report — ReportReasonEnum

| Valeur                      | Label                      |
| --------------------------- | -------------------------- |
| abusive_behaviour           | Comportement abusif        |
| luggage_not_delivered       | Valise non livrée          |
| inappropriate_communication | Communication inappropriée |
| suspected_scam              | Escroquerie suspectée      |

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
};

export const bookingStatusColor: Record<string, string> = {
  en_attente: "bg-gray-100 text-gray-700",
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
