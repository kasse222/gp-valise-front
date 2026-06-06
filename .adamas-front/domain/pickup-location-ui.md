# Pickup Location UI — GP-Valise Frontend

## Contexte

Le point de dépôt est défini par le voyageur après confirmation du booking.

```
Traveler définit le point de dépôt
    ↓
Sender voit zone approximative (~500m) avant paiement
    ↓
Sender paie → booking CONFIRMEE
    ↓
Sender voit adresse exacte + instructions
```

---

## Endpoints

```
GET  /bookings/{id}/pickup-location    → zone de dépôt
POST /bookings/{id}/pickup-location    → définir zone (TRAVELER uniquement)
```

---

## Réponse API

```json
// Avant CONFIRMEE (revealed: false)
{
  "city": "Casablanca",
  "approximate_latitude": 33.578,
  "approximate_longitude": -7.585,
  "latitude": null,
  "longitude": null,
  "address": null,
  "instructions": null,
  "revealed": false
}

// Après CONFIRMEE (revealed: true)
{
  "city": "Casablanca",
  "approximate_latitude": 33.578,
  "approximate_longitude": -7.585,
  "latitude": 33.5731,
  "longitude": -7.5898,
  "address": "50 rue Ouled Ziane, Casablanca",
  "instructions": "Sonner à l'interphone numéro 3.",
  "revealed": true
}
```

---

## Affichage SENDER

### Avant CONFIRMEE

```
Carte centrée sur approximate_lat/lng
Cercle flou rayon ~500m (pas de pin exact)
Message : "L'adresse exacte sera révélée après confirmation du paiement"
```

### Après CONFIRMEE

```
Carte avec pin exact sur latitude/longitude
Adresse complète affichée sous la carte
Instructions affichées si présentes
Bouton "Copier l'adresse"
Bouton "Ouvrir dans Maps"
```

---

## Affichage TRAVELER

### Formulaire de définition

```
Champs :
- Recherche adresse (autocomplete Google Maps / OpenStreetMap)
- Latitude / Longitude (auto-rempli)
- Latitude approx / Longitude approx (auto-calculé ±500m)
- Adresse complète (texte)
- Ville
- Instructions (optionnel)

Bouton : "Enregistrer le point de dépôt"
```

### Vue après définition

```
Carte avec pin exact
Adresse affichée
Option modifier
```

---

## Règles UI

- Carte obligatoire — ne pas afficher juste du texte
- Coordonnées approx calculées automatiquement (offset ±0.005°)
- Si pickup_location null → message "Le voyageur n'a pas encore défini de point de dépôt"
- Bouton "Définir le point de dépôt" visible pour TRAVELER si booking CONFIRMEE
- Adresse exacte jamais visible si revealed === false
