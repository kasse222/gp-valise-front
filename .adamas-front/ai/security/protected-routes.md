# Routes protégées — GP-Valise Frontend

## Principe

```txt
Frontend guard = confort UX
Backend Policy = sécurité réelle
```

Le frontend redirige les utilisateurs non autorisés.
Il ne remplace jamais les vérifications backend.

---

## Guards React

### PrivateRoute

Vérifie uniquement que l'utilisateur est authentifié.

```tsx
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
```

### PublicRoute

Redirige vers le dashboard si déjà connecté.

```tsx
function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user) {
    return (
      <Navigate to={isSender(user.role) ? "/sender" : "/traveler"} replace />
    );
  }
  return <>{children}</>;
}
```

---

## Table des routes

### Routes publiques — non authentifié seulement

```txt
/login     → LoginPage
/register  → RegisterPage
```

### Routes privées SENDER (role === 3)

```txt
/sender                  → OverviewPage
/sender/bookings         → BookingsPage
/sender/bookings/:id     → BookingDetailPage
/sender/disputes         → DisputesPage
/sender/profile          → ProfilePage
```

### Routes privées TRAVELER (role === 2)

```txt
/traveler                → OverviewPage
/traveler/trips          → TripsPage
/traveler/trips/:id      → TripDetailPage
/traveler/payments       → PaymentsPage
/traveler/profile        → ProfilePage
```

### Fallback

```txt
/*  → redirect /login
```

---

## Implémentation App.tsx

```tsx
<Routes>
  {/* Public */}
  <Route
    path="/login"
    element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    }
  />
  <Route
    path="/register"
    element={
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    }
  />

  {/* Sender */}
  <Route
    path="/sender/*"
    element={
      <PrivateRoute>
        <SenderDashboard />
      </PrivateRoute>
    }
  />

  {/* Traveler */}
  <Route
    path="/traveler/*"
    element={
      <PrivateRoute>
        <TravelerDashboard />
      </PrivateRoute>
    }
  />

  {/* Default */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
```

---

## Redirect 401 — Axios interceptor

Token expiré ou révoqué côté backend :

```ts
// src/api/client.ts
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

---

## Règles non négociables

```txt
- PrivateRoute vérifie isAuthenticated uniquement
- PublicRoute redirect si user présent en Zustand
- 401 API → logout automatique via interceptor Axios
- ADMIN/SUPER_ADMIN → bloqués au login via isPublicFrontendRole()
- Pas de vérification rôle dans PrivateRoute
  → chaque dashboard gère ses sous-routes
- Jamais de permission sensible côté frontend uniquement
```

---

## Accès refusés

```txt
ADMIN (1)       → bloqué au login → /login
SUPER_ADMIN (6) → bloqué au login → /login
MODERATOR (4)   → bloqué au login → /login
SUPPORT (5)     → bloqué au login → /login
```

Ces rôles utilisent Filament — pas ce frontend.
