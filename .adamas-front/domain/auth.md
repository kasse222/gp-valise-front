# Auth — GP-Valise Frontend

## Endpoints

### POST /api/v1/login

```ts
// Request
{
  email: string     // required, email
  password: string  // required
}

// Response 200
{
  message: string
  token: string
  token_type: 'Bearer'
  is_admin: boolean
  is_premium: boolean
  user: UserResource
}

// Response 422
{
  message: string
  errors: { email: string[] }
}
```

### GET /api/v1/me

```ts
// Headers: Authorization: Bearer {token}

// Response 200
{
  user: UserResource;
  is_admin: boolean;
  is_premium: boolean;
  has_kyc: boolean;
  role: number; // UserRoleEnum integer
}

// Response 401 → logout + redirect /login
```

### POST /api/v1/logout

```ts
// Headers: Authorization: Bearer {token}

// Response 200
{
  message: "Déconnexion réussie.";
}
```

### POST /api/v1/register

```ts
// Request
{
  first_name: string; // required, max 100
  last_name: string; // required, max 100
  email: string; // required, unique
  password: string; // required, confirmed, min 8
  password_confirmation: string;
  role: number; // required, 2 (TRAVELER) ou 3 (SENDER) uniquement
  phone: string; // required, max 20
  country: string | null; // nullable
  plan_id: number | null; // nullable
}

// Response 201
{
  message: "Inscription réussie.";
  user: UserResource;
  token: string;
}

// Response 422
{
  message: string;
  errors: Record<string, string[]>;
}
```

---

## UserResource shape

```ts
interface UserResource {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string; // "{first_name} {last_name}"
  email: string;
  phone: string | null;
  country: string | null;
  role: number; // UserRoleEnum integer (1|2|3|4|5|6)
  role_label: string;
  verified_user: boolean;
  kyc_passed_at: string | null;
  email_verified_at: string | null;
  plan_id: number | null;
  plan_expires_at: string | null;
  is_premium: boolean;
  plan: PlanResource | null;
  created_at: string;
}
```

---

## Règles frontend

### Rôles autorisés sur ce frontend

```ts
// Seuls SENDER (3) et TRAVELER (2) peuvent accéder
// Vérification au login via isPublicFrontendRole()

import { isPublicFrontendRole } from "@/store/authStore";

onSuccess: ({ data }) => {
  if (!isPublicFrontendRole(data.user.role)) {
    toast.error("Accès non autorisé sur ce portail.");
    return;
  }
  setUser(data.user);
  setToken(data.token);
  navigate(isSender(data.user.role) ? "/sender" : "/traveler");
};
```

### Token Bearer

```ts
// Stocké dans Zustand + localStorage
// Envoyé via interceptor Axios
client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

### Rehydration au démarrage

```ts
// Au montage App.tsx — si token présent mais pas de user
// GET /api/v1/me pour recharger le user
// Si 401 → logout automatique
```

### Champs RegisterRequest

```txt
role → publicValues() = [2, 3] uniquement
     → jamais 1 (ADMIN) ou 6 (SUPER_ADMIN)
     → frontend affiche select SENDER/TRAVELER

password → min 8 caractères + confirmation
phone    → obligatoire (pas nullable)
country  → nullable
```
