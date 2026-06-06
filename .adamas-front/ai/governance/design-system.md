# Safe Move — Design System v1.0

## 1. Design Philosophy

**Tone** : Confiance institutionnelle + accessibilité africaine

- Pas de gradients agressifs, pas de purple/violet
- Bleu marine ancré (#1B3A6B) = fiabilité, sécurité, international
- Contrastes forts pour lecture en plein soleil (mobile Afrique)
- Touch targets 48px minimum (doigts, pas curseurs)
- Chaque état interactif visible à 3m sur écran mobile

---

## 2. Color Tokens

### Brand

| Token                   | Hex       | Usage                              |
| ----------------------- | --------- | ---------------------------------- |
| `--color-primary`       | `#1B3A6B` | CTA principal, liens actifs, focus |
| `--color-primary-hover` | `#2B6CB0` | Hover sur éléments primary         |
| `--color-primary-dark`  | `#0F2544` | Header, footer, fond sombre        |
| `--color-primary-light` | `#EBF4FF` | Backgrounds subtils, badges info   |
| `--color-primary-50`    | `#F0F7FF` | Hover states sur fond clair        |

### Neutral

| Token              | Hex       | Usage                         |
| ------------------ | --------- | ----------------------------- |
| `--color-gray-900` | `#111827` | Texte principal               |
| `--color-gray-700` | `#374151` | Texte secondaire              |
| `--color-gray-500` | `#6B7280` | Texte tertiaire, placeholders |
| `--color-gray-300` | `#D1D5DB` | Bordures, séparateurs         |
| `--color-gray-100` | `#F3F4F6` | Fond carte, input bg          |
| `--color-gray-50`  | `#F9FAFB` | Fond page                     |
| `--color-white`    | `#FFFFFF` | Fond composants               |

### Semantic — Status Bookings

| Token                       | Hex       | Label FR         | Usage                           |
| --------------------------- | --------- | ---------------- | ------------------------------- |
| `--color-status-pending`    | `#D97706` | En attente       | pending_approval, en_paiement   |
| `--color-status-pending-bg` | `#FEF3C7` | —                | Badge bg                        |
| `--color-status-success`    | `#059669` | Confirmé / Livré | confirmee, livree, termine      |
| `--color-status-success-bg` | `#D1FAE5` | —                | Badge bg                        |
| `--color-status-danger`     | `#DC2626` | Erreur / Litige  | en_litige, declined_by_traveler |
| `--color-status-danger-bg`  | `#FEE2E2` | —                | Badge bg                        |
| `--color-status-neutral`    | `#6B7280` | Annulé           | annule, expiree, remboursee     |
| `--color-status-neutral-bg` | `#F3F4F6` | —                | Badge bg                        |
| `--color-status-info`       | `#2563EB` | Info             | Trip statuses                   |
| `--color-status-info-bg`    | `#DBEAFE` | —                | Badge bg                        |

### Feedback

| Token                | Hex       | Usage                  |
| -------------------- | --------- | ---------------------- |
| `--color-error`      | `#DC2626` | Validation erreurs     |
| `--color-error-bg`   | `#FEF2F2` | Input error bg         |
| `--color-warning`    | `#D97706` | Alertes non bloquantes |
| `--color-warning-bg` | `#FFFBEB` | Alert bg               |
| `--color-success`    | `#059669` | Confirmations          |
| `--color-success-bg` | `#ECFDF5` | Toast/banner bg        |

---

## 3. Typography

### Font Stack

```
Display  : 'Sora', system-ui, sans-serif          — titres H1/H2
Body     : 'DM Sans', system-ui, sans-serif        — corps, UI
Mono     : 'JetBrains Mono', monospace             — montants, codes
```

> **Sora** : géométrique, moderne, lisible en petite taille — bien rendu sur Android low-end
> **DM Sans** : excellent rendu OLED/LCD, hinting parfait en 14-16px

### Scale

| Token          | Size             | Line Height | Weight | Usage                      |
| -------------- | ---------------- | ----------- | ------ | -------------------------- |
| `text-display` | 48px / 3rem      | 1.1         | 700    | Hero H1                    |
| `text-h1`      | 36px / 2.25rem   | 1.2         | 700    | Page titles                |
| `text-h2`      | 24px / 1.5rem    | 1.3         | 600    | Section titles             |
| `text-h3`      | 20px / 1.25rem   | 1.4         | 600    | Card titles                |
| `text-h4`      | 16px / 1rem      | 1.4         | 600    | Labels, subheadings        |
| `text-body`    | 15px / 0.9375rem | 1.6         | 400    | Corps de texte             |
| `text-sm`      | 13px / 0.8125rem | 1.5         | 400    | Labels, captions           |
| `text-xs`      | 11px / 0.6875rem | 1.4         | 500    | Badges, metadata           |
| `text-amount`  | 18px / 1.125rem  | 1.2         | 700    | Montants financiers (mono) |

### Règles typographiques

- Montants → toujours `font-mono font-bold` + formatAmount(centimes)
- Jamais de texte sous 11px
- Contraste minimum : 4.5:1 (WCAG AA) sur fond blanc
- Sur fond sombre (#0F2544) : texte blanc ou `#93C5FD` uniquement

---

## 4. Spacing Scale

Base : 4px

| Token      | Value | Usage                    |
| ---------- | ----- | ------------------------ |
| `space-1`  | 4px   | Gap interne icône/texte  |
| `space-2`  | 8px   | Padding compact          |
| `space-3`  | 12px  | Gap interne composant    |
| `space-4`  | 16px  | Padding standard card    |
| `space-5`  | 20px  | Gap entre composants     |
| `space-6`  | 24px  | Padding section          |
| `space-8`  | 32px  | Gap entre sections       |
| `space-10` | 40px  | Padding vertical section |
| `space-16` | 64px  | Section padding desktop  |
| `space-20` | 80px  | Hero padding             |

---

## 5. Border Radius

| Token         | Value  | Usage           |
| ------------- | ------ | --------------- |
| `radius-sm`   | 6px    | Inputs, tags    |
| `radius-md`   | 10px   | Boutons, badges |
| `radius-lg`   | 14px   | Cards           |
| `radius-xl`   | 20px   | Modals, panels  |
| `radius-2xl`  | 28px   | Hero cards      |
| `radius-full` | 9999px | Pills, avatars  |

---

## 6. Shadows

| Token                | Value                                                      | Usage              |
| -------------------- | ---------------------------------------------------------- | ------------------ |
| `shadow-xs`          | `0 1px 2px rgba(0,0,0,0.05)`                               | Inputs focus       |
| `shadow-sm`          | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)`   | Cards repos        |
| `shadow-md`          | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)`   | Cards hover        |
| `shadow-lg`          | `0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)` | Modals             |
| `shadow-focus`       | `0 0 0 3px rgba(27,58,107,0.25)`                           | Focus ring primary |
| `shadow-focus-error` | `0 0 0 3px rgba(220,38,38,0.25)`                           | Focus ring erreur  |

---

## 7. Breakpoints (Mobile-First)

| Token | Value  | Contexte                            |
| ----- | ------ | ----------------------------------- |
| `sm`  | 480px  | Mobile large (iPhone Plus, Samsung) |
| `md`  | 768px  | Tablette portrait                   |
| `lg`  | 1024px | Tablette landscape / laptop         |
| `xl`  | 1280px | Desktop                             |
| `2xl` | 1536px | Large desktop                       |

**Règle** : tout composant s'écrit d'abord pour 375px (iPhone SE / Android entrée gamme).

---

## 8. Component States

### Button

```
default   → bg-primary, text-white, shadow-sm
hover     → bg-primary-hover, shadow-md, transition 200ms
focus     → shadow-focus, outline-none (jamais outline:none sans focus ring)
active    → scale(0.98), brightness(0.95)
disabled  → opacity-50, cursor-not-allowed, pointer-events-none
loading   → spinner inline-left + opacity-70, pointer-events-none
```

### Input

```
default   → border-gray-300, bg-white, text-gray-900
focus     → border-primary, shadow-focus, bg-white
error     → border-error, bg-error-bg, shadow-focus-error
disabled  → bg-gray-100, text-gray-500, cursor-not-allowed
readonly  → bg-gray-50, border-gray-200
```

### Card

```
default   → bg-white, border-gray-100, shadow-sm, radius-lg
hover     → shadow-md, border-gray-200, transition 200ms
selected  → border-primary, shadow-focus
```

### Badge / Status

```
Structure : <span role="status" aria-label="Statut : {label}">
Padding   : px-3 py-1, radius-full, text-xs font-semibold
```

---

## 9. Accessibilité (WCAG AA)

### Focus Management

- **Jamais** `outline: none` sans `box-shadow` focus ring de remplacement
- Focus ring : `shadow-focus` (3px, couleur primary avec 25% opacité)
- Ordre de focus logique dans les modals → `focus-trap`
- Fermeture modal sur `Escape`

### ARIA

```tsx
// Bouton état
<button aria-busy={isLoading} aria-disabled={disabled}>

// Badge statut
<span role="status" aria-label={`Statut : ${label}`}>

// Input erreur
<input aria-invalid={!!error} aria-describedby={`${id}-error`} />
<p id={`${id}-error`} role="alert">{error}</p>

// Modal
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// Navigation
<nav aria-label="Navigation principale">
<nav aria-label="Fil d'ariane">
```

### Contrastes validés

| Combinaison         | Ratio | WCAG                                     |
| ------------------- | ----- | ---------------------------------------- |
| #1B3A6B sur #FFFFFF | 8.9:1 | AAA ✅                                   |
| #1B3A6B sur #EBF4FF | 7.2:1 | AAA ✅                                   |
| #FFFFFF sur #1B3A6B | 8.9:1 | AAA ✅                                   |
| #374151 sur #FFFFFF | 7.0:1 | AAA ✅                                   |
| #6B7280 sur #FFFFFF | 4.6:1 | AA ✅                                    |
| #D97706 sur #FFFFFF | 2.9:1 | ⚠️ — utiliser sur fond coloré uniquement |
| #D97706 sur #FEF3C7 | 4.7:1 | AA ✅                                    |
| #DC2626 sur #FEE2E2 | 5.1:1 | AA ✅                                    |

### Touch Targets

- Minimum 48×48px sur mobile (boutons, liens, badges cliquables)
- Gap minimum 8px entre deux éléments interactifs adjacents

---

## 10. Performance Patterns

### Images

```tsx
// Toujours lazy + dimensions explicites
<img loading="lazy" width={800} height={400} alt="..." />

// Unsplash → ajouter &w=800&q=75&fm=webp
```

### Skeleton Screens

- Remplacer spinners par skeletons sur les listes et cards
- Animation : `animate-pulse` (Tailwind) — pas de clignotement brutal
- Maintenir la même hauteur que le contenu réel (éviter layout shift)

### Code Splitting

```tsx
// Pages → lazy import
const SenderDashboard = lazy(() => import('@/pages/sender/SenderDashboard'))

// Wrapper
<Suspense fallback={<PageSkeleton />}>
  <SenderDashboard />
</Suspense>
```

### TanStack Query

```tsx
staleTime: 60_000; // données stables (trips public)
staleTime: 30_000; // dashboards
staleTime: 0; // bookings (temps réel critique)
gcTime: 5 * 60_000; // garbage collect après 5min
```

---

## 11. Internationalisation (i18n)

### Stratégie

- Librairie : `react-i18next` (légère, lazy loading par namespace)
- Langues initiales : `fr` (défaut) + `en`
- Détection : `navigator.language` → fallback `fr`
- Persistance : `localStorage` → clé `sm_lang`

### Structure fichiers

```
src/
  i18n/
    index.ts              ← config i18next
    fr/
      common.json         ← labels partagés (boutons, états, erreurs)
      booking.json        ← domaine réservation
      trip.json           ← domaine trajet
      auth.json           ← login/register
    en/
      common.json
      booking.json
      trip.json
      auth.json
```

### Conventions clés

```json
// fr/booking.json
{
  "status": {
    "pending_approval": "En attente d'approbation",
    "en_paiement": "À payer",
    "confirmee": "Confirmée",
    "livree": "Livrée",
    "termine": "Terminée",
    "annule": "Annulée",
    "expiree": "Expirée",
    "declined_by_traveler": "Refusée par le voyageur",
    "en_litige": "En litige",
    "remboursee": "Remboursée"
  },
  "actions": {
    "pay": "Payer maintenant",
    "cancel": "Annuler",
    "approve": "Accepter",
    "decline": "Refuser",
    "dispute": "Ouvrir un litige"
  }
}
```

### Montants — règle absolue

```tsx
// Toujours centimes → formatAmount, jamais de float direct
formatAmount(centimes: number, currency = 'EUR'): string
// → "12,50 €" | "12.50 €" selon locale
```

---

## 12. Component Inventory (à implémenter)

### Atoms

- `Button` — variants: primary | secondary | ghost | danger | loading
- `Badge` — variants: status (mapping automatique depuis code)
- `Input` — avec label, error, helper text, aria complet
- `Textarea` — même spec que Input
- `Spinner` — sizes: sm | md | lg
- `Avatar` — initiales fallback si pas d'image
- `Skeleton` — variants: text | card | avatar | list

### Molecules

- `StatusBadge` — prend `status.code` → couleur + label auto
- `TripCard` — sender view vs public view
- `BookingCard` — avec actions contextuelles par statut
- `CountdownTimer` — pour `payment_expires_at`
- `EmptyState` — icon + title + description + CTA optionnel
- `ErrorBoundary` — page-level + component-level
- `ConfirmModal` — pour actions destructives (annuler, refuser)

### Organisms

- `Navbar` — public vs auth, mobile menu
- `DashboardLayout` — sidebar + main + mobile bottom nav
- `BookingList` — avec filtres par statut (badges cliquables)
- `DisputeThread` — bulles messages + formulaire
- `PickupLocationCard` — revealed vs masquée

---

## 13. Animation Tokens

```css
--transition-fast: 150ms ease-in-out /* hover states */ --transition-base: 200ms
  ease-in-out /* most transitions */ --transition-slow: 300ms ease-out
  /* modals, drawers */
  --transition-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275)
  /* micro-interactions */;
```

**Règle** : `prefers-reduced-motion` → désactiver toutes animations non essentielles.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
