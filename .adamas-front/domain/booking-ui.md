# Booking UI — GP-Valise Frontend

## Flow complet

```
Sender crée booking
    ↓
PENDING_APPROVAL
    → Sender voit "En attente d'approbation du voyageur"
    → Bouton payer DÉSACTIVÉ

Traveler approuve
    ↓
EN_PAIEMENT
    → Sender reçoit notification email
    → Sender peut payer
    → Timer payment_expires_at visible

Sender paie
    ↓
CONFIRMEE
    → Adresse exacte pickup révélée
    → Email confirmation envoyé

Traveler livre
    ↓
LIVREE
    → Escrow 48h visible
    → Sender peut ouvrir litige

Escrow libéré
    ↓
TERMINE
```

---

## Sender Dashboard

### Section "Mes réservations"

Filtres par statut (badges cliquables) :

- Actives (PENDING_APPROVAL + EN_PAIEMENT + CONFIRMEE + LIVREE)
- En attente (PENDING_APPROVAL)
- À payer (EN_PAIEMENT)
- Confirmées (CONFIRMEE + LIVREE)
- Terminées (TERMINE + REMBOURSEE)
- Annulées (ANNULE + EXPIREE + DECLINED_BY_TRAVELER)

### Affichage par statut

| Statut               | Texte affiché                             | Action disponible                  |
| -------------------- | ----------------------------------------- | ---------------------------------- |
| PENDING_APPROVAL     | "En attente d'approbation"                | Annuler                            |
| EN_PAIEMENT          | "Approuvé — procéder au paiement" + timer | Payer / Annuler                    |
| CONFIRMEE            | "Confirmé"                                | Voir adresse dépôt / Ouvrir litige |
| LIVREE               | "Livré — escrow en cours"                 | Ouvrir litige                      |
| TERMINE              | "Terminé"                                 | —                                  |
| DECLINED_BY_TRAVELER | "Refusé par le voyageur"                  | Rechercher nouveau trajet          |
| EXPIREE              | "Délai de paiement expiré"                | —                                  |
| ANNULE               | "Annulé"                                  | —                                  |
| EN_LITIGE            | "Litige en cours"                         | Voir litige                        |
| REMBOURSEE           | "Remboursé"                               | —                                  |

---

## Traveler Dashboard

### Section "Demandes en attente"

```
Nouvelle section prioritaire en haut du dashboard
Liste des bookings PENDING_APPROVAL sur ses trips
Chaque carte affiche :
  - Expéditeur (nom)
  - Trajet concerné
  - Poids réservé + prix
  - Date de la demande
  - Boutons : Accepter / Refuser
```

### Section "Mes trajets"

```
Filtrer par trip.user_id === user.id
Ne pas afficher les trajets des autres voyageurs
```

### Affichage par statut booking

| Statut           | Texte affiché             | Action                              |
| ---------------- | ------------------------- | ----------------------------------- |
| PENDING_APPROVAL | "Demande en attente"      | Accepter / Refuser                  |
| EN_PAIEMENT      | "En attente de paiement"  | —                                   |
| CONFIRMEE        | "Réservation confirmée"   | Définir point dépôt / Marquer livré |
| LIVREE           | "Livré — escrow en cours" | —                                   |
| TERMINE          | "Terminé — payout reçu"   | —                                   |

---

## Pickup Location

### Avant CONFIRMEE

```
Afficher carte avec point approximatif (approximate_lat/lng)
Message : "L'adresse exacte sera révélée après confirmation du paiement"
Rayon approximatif visible sur la carte (~500m)
```

### Après CONFIRMEE

```
Afficher adresse exacte
Afficher coordonnées exactes sur la carte
Afficher instructions si présentes
```

---

## Règles UI critiques

- Bouton "Payer" désactivé si status !== EN_PAIEMENT
- Timer payment_expires_at affiché en compte à rebours si EN_PAIEMENT
- Adresse dépôt masquée si booking non CONFIRMEE
- Litige disponible uniquement si CONFIRMEE ou LIVREE
- Messages d'erreur tous en français
