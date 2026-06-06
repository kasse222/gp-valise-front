# KYC UI — GP-Valise Frontend

## Contexte

Le KYC est requis pour accéder aux paiements réels.

```
User soumet photos
    ↓
PENDING (admin examine)
    ↓
APPROVED → accès paiements
REJECTED → peut resoumettre
```

---

## Endpoints

```
GET  /kyc    → statut KYC courant
POST /kyc    → soumettre { id_photo_path, parcel_photo_path }
```

---

## Affichage selon statut

| Statut   | Affichage                     | Action                     |
| -------- | ----------------------------- | -------------------------- |
| null     | "KYC non soumis"              | Bouton "Soumettre mon KYC" |
| PENDING  | "En cours de vérification"    | —                          |
| APPROVED | Badge vert "Vérifié"          | —                          |
| REJECTED | "Rejeté : {rejection_reason}" | Bouton "Resoumettre"       |

---

## Formulaire KYC

```
Section dans le profil utilisateur

Champs :
- Upload photo pièce d'identité (id_photo_path)
  → JPG/PNG, max 5MB
  → Prévisualisation avant envoi

- Upload photo du colis (parcel_photo_path)
  → JPG/PNG, max 5MB
  → Prévisualisation avant envoi

Bouton : "Soumettre ma demande KYC"
```

---

## Upload photos

```
Pour l'instant : chemin texte (string)
Futur : upload S3 → URL retournée

Phase actuelle :
  - Input texte pour le chemin
  - Ou URL d'une image hébergée
```

---

## Règles UI

- KYC badge visible dans la navbar si APPROVED
- Blocage accès paiement si kyc_passed_at === null
- Message clair si tentative paiement sans KYC
- Rejection reason affichée clairement
- Statut PENDING → spinner / message d'attente
