# Review Checklist — GP-Valise Frontend

> À vérifier avant tout commit sur une feature front.

---

## Auth & Sécurité

- [ ] `isPublicFrontendRole()` vérifié au login
- [ ] Pas de magic numbers rôle dans les composants (`role === 3` interdit)
- [ ] `UserRole.SENDER` / `isSender()` / `isTraveler()` utilisés partout
- [ ] Token Bearer présent dans Axios headers après login
- [ ] Interceptor 401 → logout + redirect /login actif
- [ ] Zustand persist configuré (`name: 'gp-valise-auth'`)
- [ ] Logout = clear Zustand + redirect /login

---

## Routing & Navigation

- [ ] `PrivateRoute` sur toutes les routes authentifiées
- [ ] `PublicRoute` redirige si déjà connecté
- [ ] SENDER ne peut pas accéder à `/traveler/*`
- [ ] TRAVELER ne peut pas accéder à `/sender/*`
- [ ] Route `*` fallback vers `/login`

---

## Fetch & Data

- [ ] Zéro `useEffect` pour fetch de données
- [ ] Toutes les données serveur via `useQuery` / `useMutation`
- [ ] `queryKey` stable et cohérent (`['bookings']`, `['booking', id]`)
- [ ] `invalidateQueries` après chaque mutation
- [ ] `staleTime` explicite sur les queries
- [ ] Axios client importé depuis `@/api/client`

---

## États UI obligatoires

- [ ] `isLoading` → `<Spinner />`
- [ ] `isError` → message erreur + bouton retry
- [ ] Liste vide → empty state avec message clair
- [ ] Mutation pending → `loading` prop sur `<Button />`
- [ ] Succès mutation → `toast.success(...)`
- [ ] Erreur mutation → `toast.error(...)`

---

## Composants UI

- [ ] `<Button />` — pas de `<button>` HTML brut
- [ ] `<Input />` — pas de `<input>` HTML brut
- [ ] `<Card />` — pas de div avec classes dupliquées
- [ ] `<Badge />` ou `<BookingStatusBadge />` pour les statuts
- [ ] `<Spinner />` pour les loadings
- [ ] Imports depuis `@/components/ui` (index.ts)

---

## TypeScript

- [ ] Zéro `any`
- [ ] Types dans `src/types/index.ts`
- [ ] Props interfaces nommées (`BookingCardProps`)
- [ ] `import type` pour les types purs

---

## Données & Formatage

- [ ] Montants via `formatAmount(amount, currency)` — pas de division inline
- [ ] Dates via `formatDate(date)`
- [ ] `kg_reserved` en grammes → `(grams / 1000).toFixed(1) + ' kg'`
- [ ] `status_color` Filament non utilisé directement en Tailwind
      → `bookingStatusColor[booking.status]` de utils.ts
- [ ] Labels statuts via `bookingStatusLabel[status]`
- [ ] Labels dispute via `disputeStatusLabel[status]`

---

## Structure fichiers

- [ ] Pages dans `src/pages/sender/` ou `src/pages/traveler/`
- [ ] Hooks dans `src/hooks/`
- [ ] Fonctions API dans `src/api/`
- [ ] Types dans `src/types/index.ts`
- [ ] Nommage : `PascalCase` pages, `camelCase` hooks (`useBookings`)

---

## Interdits — vérification finale

- [ ] Pas de `fetch()` natif
- [ ] Pas de `localStorage` direct (Zustand persist gère)
- [ ] Pas de `console.log`
- [ ] Pas de logique métier dans les composants
- [ ] Pas de données mockées
- [ ] Pas de styles inline (`style={{ }}`)
- [ ] Pas de classes Tailwind dupliquées (extraire composant)

---

## Commit

- [ ] Message commit clair et descriptif
- [ ] Branche correcte (`feat/...`, `fix/...`)
- [ ] Pas de fichiers inutiles (.DS_Store, node_modules)
- [ ] `.adamas-front` mis à jour si décision architecturale prise
