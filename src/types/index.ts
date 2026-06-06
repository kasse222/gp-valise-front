import type { UserRole } from "@/store/authStore";

// ── User ──────────────────────────────────────────────────────────────────────

export interface PlanResource {
  id: number;
  type: string;
  label: string;
  expires_at: string | null;
}

export interface UserResource {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  role: UserRole;
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

// ── Location ──────────────────────────────────────────────────────────────────

export interface LocationResource {
  id: number;
  trip_id: number;
  latitude: number;
  longitude: number;
  city: string;
  order_index: number;
  position: string;
  position_label: string;
  type: string;
  type_label: string;
  is_departure: boolean;
  is_customs_point: boolean;
  is_hub: boolean;
  created_at: string;
}

// ── Pickup Location ───────────────────────────────────────────────────────────

export interface PickupLocation {
  address:               string | null;
  city:                  string | null;
  latitude:              number | null;
  longitude:             number | null;
  approximate_latitude:  number | null;
  approximate_longitude: number | null;
  instructions:          string | null;
  revealed:              boolean;
}

// ── Trip ──────────────────────────────────────────────────────────────────────

export interface TripResource {
  id: number;
  user_id: number;
  departure: string;
  destination: string;
  date: string | null;
  flight_number: string | null;
  capacity: number;
  price_per_kg: number;
  type_trip: string | null;
  type_badge: { label: string; color: string } | null;
  status: {
    code: string;
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
  // Pickup location — objet révélé/masqué selon contexte sender
  pickup_location:            PickupLocation | null;
  // Delivery location
  delivery_location:          PickupLocation | null;
  // Champs directs — pour le traveler owner (PUT /trips/:id)
  pickup_address?:           string | null;
  pickup_city?:              string | null;
  pickup_latitude?:          number | null;
  pickup_longitude?:         number | null;
  pickup_approx_latitude?:   number | null;
  pickup_approx_longitude?:  number | null;
  pickup_instructions?:      string | null;
  delivery_address?:         string | null;
  delivery_city?:            string | null;
  delivery_latitude?:        number | null;
  delivery_longitude?:       number | null;
  delivery_approx_latitude?:  number | null;
  delivery_approx_longitude?: number | null;
  delivery_instructions?:    string | null;
}

// ── Luggage ───────────────────────────────────────────────────────────────────

export interface LuggageResource {
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
  status: string;
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

// ── Booking ───────────────────────────────────────────────────────────────────

export interface BookingItemResource {
  id: number;
  booking_id: number;
  luggage_id: number;
  trip_id: number;
  kg_reserved: number;
  price: number;
  luggage: LuggageResource | null;
  trip: TripResource | null;
  created_at: string;
  updated_at: string;
}

export interface BookingStatusHistoryResource {
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

export interface BookingResource {
  id: number;
  trip_id: number;
  user_id: number;
  status: string;
  status_label: string;
  status_color: string;
  is_final: boolean;
  comment: string | null;
  kg_reserved: number;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  payment_expires_at: string | null;
  expired_at: string | null;
  trip: TripResource | null;
  user: UserResource | null;
  items: BookingItemResource[];
  status_history: BookingStatusHistoryResource[];
  created_at: string;
  updated_at: string;
}

export type Booking = BookingResource;
export type Trip    = TripResource;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ── Transaction ───────────────────────────────────────────────────────────────

export interface TransactionResource {
  id: number;
  type: {
    code: string;
    label: string;
  };
  amount: number;
  currency: {
    code: string;
    label: string;
  };
  method: {
    code: string | null;
    label: string | null;
  };
  status: {
    code: string;
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

export type Transaction = TransactionResource;

// ── Payment ───────────────────────────────────────────────────────────────────

export interface PaymentResource {
  id: number;
  user_id: number;
  booking_id: number;
  method: string | null;
  method_label: string | null;
  status: number | null;
  status_label: string | null;
  amount: number;
  currency: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Payment = PaymentResource;