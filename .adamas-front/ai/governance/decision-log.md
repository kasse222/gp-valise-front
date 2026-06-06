# Decision Log — GP-Valise Frontend

## [2026-05] React + Vite vs Next.js

### Décision

React + Vite

### Raisons

- App authentifiée — SEO inutile
- Setup Sanctum Bearer plus simple qu'avec Next.js
- Fondations déjà posées
- Vitesse de développement

### Alternatives rejetées

- Next.js : SSR inutile pour app derrière auth
- Vue.js : moins demandé au Maroc
- Remix : complexité inutile MVP

---

## [2026-05] Bearer Token vs Cookie SPA Sanctum

### Décision

Bearer Token (MVP)

### Raisons

- Cookie SPA = setup CORS complexe avec Vite proxy
- Bearer token = fonctionnel immédiatement
- Sanctum supporte les deux modes

### Phase 2

Migrer vers Cookie HTTP-only si déploiement
frontend séparé du backend.

---

## [2026-05] TanStack Query vs SWR vs useEffect

### Décision

TanStack Query v5

### Raisons

- Cache serveur dédié
- Invalidation après mutation
- DevTools
- Standard industrie 2024-2025

### Interdit

useEffect pour fetch — jamais.

---

## [2026-05] Zustand vs Redux vs Context

### Décision

Zustand v5

### Raisons

- Auth state minimal
- Persist middleware intégré
- API simple
- Pas de boilerplate

### Règle

Zustand = auth uniquement.
Données serveur = TanStack Query.

---

## [2026-05] UserRole — integer vs string

### Décision

Integer (valeur backend) + helpers frontend

### Raisons

- Backend retourne integer (UserRoleEnum)
- Mapping string = risque de désynchronisation
- Helpers centralisés évitent magic numbers

### Implémentation

```ts
export const UserRole = { SENDER: 3, TRAVELER: 2, ... }
export function isSender(role): boolean
export function isTraveler(role): boolean
```

## [2026-05] — Déploiement production statique sur VPS

### Décision

Build Vite statique servi par Nginx système sur le VPS Hetzner.

### Setup

```txt
/var/www/gp-valise-front/dist → Nginx port 80/443
/api/* → proxy_pass localhost:8080 (Docker backend)
```

SSL Let's Encrypt via Certbot sur safemove.tech + www.safemove.tech.

### Conséquences

- `npm run build` sur le VPS après chaque `git pull`
- Pas de SSR — build statique suffisant (app authentifiée)
- `VITE_API_URL` pointe vers `/api` (même domaine, pas de CORS)

### Statut

✅ actif

---

## [2026-05] — Responsive mobile : sidebar drawer

### Décision

`AppLayout.tsx` refactorisé avec deux modes :

- Desktop (`md:`) : sidebar fixe 64px
- Mobile : drawer caché par défaut, ouvert via hamburger `<Menu />`

Pattern :

```tsx
// Desktop
<aside className="hidden md:flex w-64 fixed h-screen">

// Mobile drawer
<aside className={`fixed z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

// Overlay
{sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" />}
```

### Règle

Fermer la sidebar au clic sur un lien nav (`onClick={() => setSidebarOpen(false)}`).

### Statut

✅ actif

---

## [2026-05] — PSP routing : country fallback côté frontend

### Décision

`BookingDetailPage.tsx` envoie `country` dans le payload pay :

```ts
const userCountry = useAuthStore((s) => s.user?.country) ?? "SN";
```

Fallback `"SN"` car le backend route `SN + mobile_money → PayDunya`.
Fallback `"FR"` initial causait `FakeProvider` → bloqué en production.

### Règle

Le fallback doit toujours pointer vers un pays avec PSP réel configuré.
À remplacer par détection automatique (géolocalisation ou profil user) en Phase 2.

### Statut

✅ actif — fallback SN
⏳ à améliorer — Phase 2 détection pays automatique

---

## [2026-05] — Recherche trajets : filtrage côté client

### Décision

Filtrage côté client sur les données déjà fetchées (pas de requête API par filtre).

Landing → `/trips?departure=X&destination=Y&date=Z`
`TripsPublicPage` → `useSearchParams()` → init states locaux → filtre en mémoire.

```ts
const filteredTrips = trips.filter((trip) => {
  if (dep && !trip.departure.toLowerCase().includes(dep)) return false;
  if (dest && !trip.destination.toLowerCase().includes(dest)) return false;
  if (date && !trip.date.startsWith(date)) return false;
  return true;
});
```

### Limite

Filtrage client = tous les trips fetchés en mémoire.
Acceptable pour MVP (volume faible). À migrer vers `GET /trips?departure=X` en Phase 2.

### Statut

✅ actif — MVP
⏳ à migrer — filtrage backend Phase 2

---

## [2026-05] — Branding : GP-Valise → Safe Move

### Décision

Renommage complet du nom affiché dans l'UI :

- `AppLayout.tsx` : sidebar + topbar mobile
- `LoginPage.tsx` + `RegisterPage.tsx`
- Logo : `logo-nav-hori.png` + `logo-blanc.png`

Le nom technique du repo et des packages reste `gp-valise-front`.

### Statut

## ✅ actif

## [2026-06] — Refonte frontend complète

### Décision

Refonte UI/UX complète après validation produit (66 utilisateurs, feedback Sileye).

### Raisons

- UX insuffisante pour le grand public
- Nouveaux flows backend à intégrer (PENDING_APPROVAL, pickup location, dispute, KYC)
- Mobile-first non respecté actuellement
- Feedback utilisateur clair sur les blocages

### Périmètre

Pages prioritaires :

1. Landing page
2. Login / Register
3. Trips public
4. Sender dashboard (PENDING_APPROVAL flow)
5. Traveler dashboard (demandes en attente)
6. Booking detail (pickup location, dispute)
7. KYC form

### Corrections feedback Sileye

- "Voir ce trajet" → ouvre le bon trajet
- Logo Trip → redirige accueil
- Badges → filtrent la liste bookings
- Mes trajets voyageur → filtre par user connecté
- Messages d'erreur → tout en français
- Validation téléphone inscription
- "Devenir transporteur" → pré-sélectionne Voyageur

### Contraintes

- Stack conservée (React 19 + TypeScript + TanStack Query v5 + Zustand + Tailwind CSS 4)
- Mobile-first obligatoire
- FR uniquement
- Identité Safe Move conservée (#1B3A6B)

### Statut

⏳
