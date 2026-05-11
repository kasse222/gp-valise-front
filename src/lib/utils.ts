import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatAmount(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// ── Booking ───────────────────────────────────────────────────────────────────

export const bookingStatusLabel: Record<string, string> = {
  en_attente:      'En attente',
  en_paiement:     'En paiement',
  paiement_echoue: 'Paiement échoué',
  confirmee:       'Confirmée',
  livree:          'Livrée',
  termine:         'Terminée',
  annule:          'Annulée',
  remboursee:      'Remboursée',
  expiree:         'Expirée',
  en_litige:       'En litige',
  suspendue:       'Suspendue',
}

export const bookingStatusColor: Record<string, string> = {
  en_attente:      'bg-gray-100 text-gray-700',
  en_paiement:     'bg-yellow-100 text-yellow-800',
  paiement_echoue: 'bg-red-100 text-red-700',
  confirmee:       'bg-blue-100 text-blue-800',
  livree:          'bg-green-100 text-green-700',
  termine:         'bg-green-100 text-green-700',
  annule:          'bg-red-100 text-red-700',
  remboursee:      'bg-purple-100 text-purple-700',
  expiree:         'bg-orange-100 text-orange-700',
  en_litige:       'bg-red-100 text-red-700',
  suspendue:       'bg-gray-100 text-gray-500',
}

// ── Dispute ───────────────────────────────────────────────────────────────────

export const disputeStatusLabel: Record<string, string> = {
  open:             'Ouvert',
  under_review:     'En cours d\'analyse',
  waiting_customer: 'En attente expéditeur',
  waiting_traveler: 'En attente voyageur',
  escalated:        'Escaladé',
  resolved:         'Résolu',
}

export const disputeStatusColor: Record<string, string> = {
  open:             'bg-yellow-100 text-yellow-800',
  under_review:     'bg-blue-100 text-blue-700',
  waiting_customer: 'bg-orange-100 text-orange-700',
  waiting_traveler: 'bg-orange-100 text-orange-700',
  escalated:        'bg-red-100 text-red-700',
  resolved:         'bg-green-100 text-green-700',
}

// ── Transaction ───────────────────────────────────────────────────────────────

export const transactionTypeLabel: Record<string, string> = {
  charge:      'Encaissement',
  refund:      'Remboursement',
  fee:         'Commission',
  payment_fee: 'Frais PSP',
  payout:      'Versement voyageur',
}

export const transactionTypeColor: Record<string, string> = {
  charge:      'bg-blue-100 text-blue-700',
  refund:      'bg-yellow-100 text-yellow-800',
  fee:         'bg-indigo-100 text-indigo-700',
  payment_fee: 'bg-red-100 text-red-700',
  payout:      'bg-green-100 text-green-700',
}

export const transactionStatusLabel: Record<string, string> = {
  pending:    'En attente',
  processing: 'En traitement',
  completed:  'Complétée',
  failed:     'Échouée',
  refunded:   'Remboursée',
  cancelled:  'Annulée',
}

export const transactionStatusColor: Record<string, string> = {
  pending:    'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
  refunded:   'bg-yellow-100 text-yellow-800',
  cancelled:  'bg-red-100 text-red-700',
}

// ── Trip ──────────────────────────────────────────────────────────────────────

export const tripStatusLabel: Record<string, string> = {
  pending:   'En attente',
  active:    'Actif',
  cancelled: 'Annulé',
  completed: 'Terminé',
}

export const tripStatusColor: Record<string, string> = {
  pending:   'bg-gray-100 text-gray-700',
  active:    'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

export const tripTypeLabel: Record<string, string> = {
  standard:  'Standard',
  express:   'Express',
  sur_devis: 'Sur devis',
}

// ── Luggage ───────────────────────────────────────────────────────────────────

export const luggageStatusLabel: Record<string, string> = {
  en_attente: 'En attente',
  reservee:   'Réservée',
  en_transit: 'En transit',
  livree:     'Livrée',
  annulee:    'Annulée',
  perdue:     'Perdue',
  retour:     'Retour',
}

export const luggageStatusColor: Record<string, string> = {
  en_attente: 'bg-gray-100 text-gray-700',
  reservee:   'bg-blue-100 text-blue-700',
  en_transit: 'bg-indigo-100 text-indigo-700',
  livree:     'bg-green-100 text-green-700',
  annulee:    'bg-red-100 text-red-700',
  perdue:     'bg-orange-100 text-orange-700',
  retour:     'bg-purple-100 text-purple-700',
}

// ── Currency ──────────────────────────────────────────────────────────────────

export const currencySymbol: Record<string, string> = {
  EUR: '€',
  USD: '$',
  XOF: 'CFA',
  GBP: '£',
  MAD: 'DH',
}
