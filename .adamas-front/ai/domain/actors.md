# Acteurs — GP-Valise Frontend

## Rôles

Les rôles viennent du backend via `UserRoleEnum`.

| Rôle        | Value | Route base | Description                     |
| ----------- | ----- | ---------- | ------------------------------- |
| ADMIN       | 1     | /admin     | Filament uniquement             |
| TRAVELER    | 2     | /traveler  | Voyageur — publie des trajets   |
| SENDER      | 3     | /sender    | Expéditeur — réserve des places |
| MODERATOR   | 4     | —          | Hors scope frontend MVP         |
| SUPPORT     | 5     | —          | Hors scope frontend MVP         |
| SUPER_ADMIN | 6     | /admin     | Filament uniquement             |

---

## Règle frontend

Le frontend peut utiliser les rôles pour l'UX et la redirection.
La sécurité réelle reste toujours côté backend.

```txt
Frontend guard = confort utilisateur
Backend Policy = sécurité réelle
```

Aucun composant ne doit comparer directement :

```ts
role === 3; // ❌ interdit
```

Toujours passer par les helpers centralisés.

---

## Constantes frontend

```ts
export const UserRole = {
  ADMIN: 1,
  TRAVELER: 2,
  SENDER: 3,
  MODERATOR: 4,
  SUPPORT: 5,
  SUPER_ADMIN: 6,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export function isSender(role: UserRole): boolean {
  return role === UserRole.SENDER;
}

export function isTraveler(role: UserRole): boolean {
  return role === UserRole.TRAVELER;
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export function isPublicFrontendRole(role: UserRole): boolean {
  return isSender(role) || isTraveler(role);
}
```

---

## Redirect après login

```ts
if (isSender(user.role)) navigate("/sender");
if (isTraveler(user.role)) navigate("/traveler");
if (isAdmin(user.role)) navigate("/login"); // accès refusé
```

Règles :

```txt
SENDER      → /sender
TRAVELER    → /traveler
ADMIN       → accès refusé
SUPER_ADMIN → accès refusé
MODERATOR   → accès refusé (MVP)
SUPPORT     → accès refusé (MVP)
```

---

## Pages accessibles par rôle

```txt
SENDER
  /sender                → Vue d'ensemble
  /sender/bookings       → Mes réservations
  /sender/bookings/:id   → Détail réservation
  /sender/disputes       → Mes litiges
  /sender/profile        → Mon profil

TRAVELER
  /traveler              → Vue d'ensemble
  /traveler/trips        → Mes trajets
  /traveler/trips/:id    → Détail trajet
  /traveler/payments     → Mes paiements
  /traveler/profile      → Mon profil
```

---

## Zustand authStore

```ts
export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
```

---

## Règles non négociables

- Ne jamais exposer `/admin` dans ce frontend
- Ne jamais autoriser une action sensible uniquement via le frontend
- Ne jamais dupliquer les règles métier backend dans React
- Ne jamais comparer les rôles avec des nombres magiques dans les composants
- Toujours passer par `UserRole`, `isSender()`, `isTraveler()`, `isAdmin()`
