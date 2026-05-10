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

export const bookingStatusLabel: Record<string, string> = {
  en_paiement:     'En paiement',
  confirmee:       'Confirmée',
  livree:          'Livrée',
  en_litige:       'En litige',
  remboursee:      'Remboursée',
  termine:         'Terminée',
  annule:          'Annulée',
  expiree:         'Expirée',
  paiement_echoue: 'Paiement échoué',
}

export const bookingStatusColor: Record<string, string> = {
  en_paiement:     'bg-yellow-100 text-yellow-800',
  confirmee:       'bg-blue-100 text-blue-800',
  livree:          'bg-green-100 text-green-800',
  en_litige:       'bg-red-100 text-red-800',
  remboursee:      'bg-gray-100 text-gray-800',
  termine:         'bg-green-100 text-green-800',
  annule:          'bg-gray-100 text-gray-800',
  expiree:         'bg-gray-100 text-gray-800',
  paiement_echoue: 'bg-red-100 text-red-800',
}
