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
