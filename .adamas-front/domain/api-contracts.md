# API Contracts — GP-Valise Frontend

> Source de vérité : Resources Laravel + routes api.php
> Toutes les réponses sont wrappées dans `{ data: ... }`

---

## Base URL

```txt
Development : http://localhost:8000/api/v1  (via Vite proxy)
Production  : https://api.gpvalise.com/api/v1
```

## Auth header

```txt
Authorization: Bearer {token}
```

---

## Auth

### POST /login

```ts
// Request
{ email: string, password: string }

// Response
{
  message: string
  token: string
  token_type: 'Bearer'
  is_admin: boolean
  is_premium: boolean
  user: UserResource
}
```

### GET /me

```ts
// Response
{
  user: UserResource;
  is_admin: boolean;
  is_premium: boolean;
  has_kyc: boolean;
  role: number;
}
```

### POST /logout

```ts
// Response
{
  message: string;
}
```

---

## UserResource

```ts
interface UserResource {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  role: number; // UserRoleEnum integer
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

## Bookings

### GET /bookings

```ts
// Response — liste paginée
{
  data: BookingResource[]
  links: { first, last, prev, next }
  meta: { current_page, last_page, per_page, total }
}
```

### GET /bookings/:id

```ts
// Response
{
  data: BookingResource;
}
```

### BookingResource

```ts
interface BookingResource {
  id: number;
  trip_id: number;
  user_id: number;
  status: string; // BookingStatusEnum value
  status_label: string;
  status_color: string; // 'gray' | 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'orange'
  is_final: boolean;
  comment: string | null;
  kg_reserved: number; // grammes — sum des items
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  payment_expires_at: string | null;
  expired_at: string | null;
  trip: TripResource | null; // whenLoaded
  user: UserResource | null; // whenLoaded
  items: BookingItemResource[];
  status_history: BookingStatusHistoryResource[];
  created_at: string;
  updated_at: string;
}
```

### BookingItemResource

```ts
interface BookingItemResource {
  id: number;
  booking_id: number;
  luggage_id: number;
  trip_id: number;
  kg_reserved: number; // grammes
  price: number; // centimes
  luggage: LuggageResource | null;
  trip: TripResource | null;
  created_at: string;
  updated_at: string;
}
```

### BookingStatusHistoryResource

```ts
interface BookingStatusHistoryResource {
  id: number;
  booking_id: number;
  old_status: string | null;
  old_label: string | null;
  new_status: string;
  new_label: string;
  reason: string | null;
  changed_by: number | null;
  user: UserResource | null;
  changed_at: string;
}
```

---

## Trips

### GET /trips

```ts
// Response
{ data: TripResource[] }
```

### GET /trips/:id

```ts
// Response
{
  data: TripResource;
}
```

### TripResource

```ts
interface TripResource {
  id: number;
  user_id: number;
  departure: string;
  destination: string;
  date: string | null; // YYYY-MM-DD
  flight_number: string | null;
  capacity: number; // grammes
  price_per_kg: number; // centimes/kg — integer
  type_trip: string | null; // TripTypeEnum value
  type_badge: { label: string; color: string } | null;
  status: {
    code: string; // TripStatusEnum value
    label: string;
    color: string;
  };
  is_reservable: boolean;
  grams_disponible: number;
  user: UserResource | null;
  bookings: BookingResource[];
  locations: LocationResource[];
  created_at: string;
  updated_at: string;
}
```

### LocationResource

```ts
interface LocationResource {
  id: number;
  trip_id: number;
  latitude: number;
  longitude: number;
  city: string;
  order_index: number;
  position: string; // LocationPositionEnum value
  position_label: string;
  type: string; // LocationTypeEnum value
  type_label: string;
  is_departure: boolean;
  is_customs_point: boolean;
  is_hub: boolean;
  created_at: string;
}
```

---

## Transactions

### GET /transactions

```txt
Middleware: verified_user requis
Si 403 → afficher "Vérification email requise"
```

```ts
// Response
{ data: TransactionResource[] }
```

### TransactionResource

```ts
interface TransactionResource {
  id: number;
  type: {
    code: string; // TransactionTypeEnum value
    label: string;
  };
  amount: number; // centimes (float retourné par API)
  currency: {
    code: string; // CurrencyEnum value
    label: string;
  };
  method: {
    code: string | null;
    label: string | null;
  };
  status: {
    code: string; // TransactionStatusEnum value
    label: string;
    color: string;
    is_final: boolean;
    is_success: boolean;
  };
  processed_at: string | null;
  created_at: string;
  user_id: number;
  booking_id: number;
  user: UserResource | null;
  booking: BookingResource | null;
}
```

---

## Payments

### GET /payments

```txt
Middleware: verified_user + kyc requis
Si 403 → afficher "KYC requis"
```

```ts
// Response
{ data: PaymentResource[] }
```

### PaymentResource

```ts
interface PaymentResource {
  id: number;
  user_id: number;
  booking_id: number;
  method: string | null; // PaymentMethodEnum value
  method_label: string | null;
  status: number | null; // PaymentStatusEnum integer
  status_label: string | null;
  amount: number; // float
  currency: string | null; // CurrencyEnum value
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Luggages

### GET /luggages

```ts
{ data: LuggageResource[] }
```

### LuggageResource

```ts
interface LuggageResource {
  id: number;
  tracking_id: string;
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  pickup_city: string;
  delivery_city: string;
  pickup_date: string | null;
  delivery_date: string | null;
  status: string; // LuggageStatusEnum value
  status_label: string;
  status_color: string;
  is_final: boolean;
  is_fragile: boolean;
  insurance_requested: boolean;
  description: string | null;
  user: UserResource | null;
  created_at: string;
  updated_at: string;
}
```

---

## Erreurs standard

```ts
// 401 — token expiré
{ message: 'Unauthenticated.' }
→ logout + redirect /login

// 403 — non autorisé
{ message: string }
→ toast.error(message)

// 422 — validation
{
  message: string,
  errors: Record<string, string[]>
}
→ afficher errors[field][0]

// 404 — non trouvé
{ message: 'Route introuvable.', status: 404 }
→ toast.error('Ressource introuvable')

// 500 — erreur serveur
{ message: string, error?: string }
→ toast.error('Une erreur est survenue')
```

---

## Notes importantes

```txt
- kg_reserved      → grammes (diviser par 1000 pour afficher en kg)
- price_per_kg     → centimes/kg (diviser par 100 pour afficher)
- amount           → centimes → formatAmount(amount, currency)
- capacity (trip)  → grammes
- status_color (booking) → couleur Filament ('gray','blue','green','red'...)
                           NE PAS utiliser directement en Tailwind
                           → utiliser bookingStatusColor[status] de utils.ts
- transactions     → middleware verified_user obligatoire
- payments         → middleware verified_user + kyc obligatoire
```
