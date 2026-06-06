# Dispute UI — GP-Valise Frontend

## Contexte

```
booking.status = EN_LITIGE    ← signal financier (escrow bloqué)
dispute.status                ← workflow arbitrage interne
```

Un booking EN_LITIGE a toujours une entrée dans `disputes`.

---

## Endpoints disponibles

```
POST /bookings/{id}/dispute          → ouvrir litige (SENDER)
GET  /disputes/{id}                  → détail litige
GET  /disputes/{id}/messages         → messages
POST /disputes/{id}/messages         → ajouter message
```

---

## Affichage disputes SENDER

### /sender/bookings/{id}/dispute

```
Section visible si booking.status === EN_LITIGE

Afficher :
- Statut du litige (badge coloré)
- Raison initiale
- Messages (chronologique)
- Formulaire ajout message
- Pièces jointes (optionnel)
```

### Ouvrir un litige

```
Bouton "Ouvrir un litige" visible si :
  - booking.status === CONFIRMEE ou LIVREE

Formulaire :
  - Textarea raison (min 10 chars)
  - Bouton confirmer

POST /bookings/{id}/dispute
```

---

## Affichage disputes TRAVELER

```
Section visible dans le détail booking si EN_LITIGE
Mêmes données que SENDER
Peut ajouter des messages
Ne peut pas ouvrir un litige
```

---

## DisputeStatusEnum — workflow

```
OPEN             → jaune   "Ouvert"
UNDER_REVIEW     → bleu    "En cours d'analyse"
WAITING_CUSTOMER → orange  "En attente de votre réponse"
WAITING_TRAVELER → orange  "En attente du voyageur"
ESCALATED        → rouge   "Escaladé"
RESOLVED         → vert    "Résolu"
```

---

## Messages

```
Affichage chronologique
Bulle gauche = autre partie
Bulle droite = moi
Badge rôle sur chaque message (Expéditeur / Voyageur / Admin)
Timestamp affiché
```

---

## Règles UI

- Formulaire message désactivé si dispute.status === RESOLVED
- Statut mis à jour en temps réel (polling ou websocket futur)
- Résolution affichée si dispute.status === RESOLVED
- Decision affichée : REFUND → "Remboursement accordé" / PAYOUT → "Paiement libéré"
