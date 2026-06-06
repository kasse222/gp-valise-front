/**
 * Safe Move — i18n setup
 * react-i18next · namespaces : common, booking, trip, auth
 * Détection : navigator.language → fallback 'fr'
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// ─── Namespaces FR ─────────────────────────────────────────────────────────

const frCommon = {
  actions: {
    save:     'Enregistrer',
    cancel:   'Annuler',
    confirm:  'Confirmer',
    back:     'Retour',
    retry:    'Réessayer',
    search:   'Rechercher',
    seeAll:   'Voir tout',
    copy:     'Copier',
    copied:   'Copié !',
    openMaps: 'Ouvrir dans Maps',
    loading:  'Chargement…',
    close:    'Fermer',
  },
  errors: {
    generic:     'Une erreur est survenue. Veuillez réessayer.',
    network:     'Impossible de joindre le serveur. Vérifiez votre connexion.',
    notFound:    'Ressource introuvable.',
    unauthorized: 'Vous devez être connecté pour accéder à cette page.',
    forbidden:   "Vous n'avez pas les droits nécessaires.",
    validation:  'Veuillez corriger les erreurs ci-dessous.',
  },
  empty: {
    default:  'Aucun résultat',
    bookings: 'Aucune réservation pour le moment.',
    trips:    'Aucun trajet disponible.',
    messages: 'Aucun message pour le moment.',
  },
  nav: {
    home:       'Accueil',
    mySpace:    'Mon espace',
    login:      'Se connecter',
    register:   "S'inscrire",
    logout:     'Déconnexion',
    howItWorks: 'Comment ça marche',
    services:   'Nos services',
    pricing:    'Tarifs',
  },
  roles: {
    sender:   'Expéditeur',
    traveler: 'Voyageur',
  },
} as const

const frAuth = {
  login: {
    title:       'Connexion',
    subtitle:    'Accédez à votre espace Safe Move',
    email:       'Adresse email',
    password:    'Mot de passe',
    submit:      'Se connecter',
    noAccount:   "Pas encore de compte ?",
    register:    "S'inscrire",
    backHome:    "← Retour à l'accueil",
    errors: {
      invalidCredentials: 'Email ou mot de passe incorrect.',
      emailRequired:      "L'email est obligatoire.",
      passwordRequired:   'Le mot de passe est obligatoire.',
    },
  },
  register: {
    title:         'Créer un compte',
    subtitle:      'Rejoignez la communauté Safe Move',
    fullName:      'Nom complet',
    email:         'Adresse email',
    phone:         'Téléphone (ex: +212612345678)',
    password:      'Mot de passe',
    role:          'Je suis…',
    roleSender:    'Expéditeur — j\'envoie des colis',
    roleTraveler:  'Voyageur — je transporte des bagages',
    submit:        'Créer mon compte',
    hasAccount:    'Déjà un compte ?',
    login:         'Se connecter',
    backHome:      "← Retour à l'accueil",
    errors: {
      fullNameRequired: 'Le nom complet est obligatoire.',
      emailRequired:    "L'email est obligatoire.",
      phoneInvalid:     'Numéro de téléphone invalide (ex: +212612345678)',
      passwordMin:      'Le mot de passe doit contenir au moins 8 caractères.',
      roleRequired:     'Veuillez sélectionner un rôle.',
    },
  },
} as const

const frBooking = {
  status: {
    pending_approval:     "En attente d'approbation",
    en_paiement:          'À payer',
    confirmee:            'Confirmée',
    livree:               'Livrée',
    termine:              'Terminée',
    annule:               'Annulée',
    expiree:              'Expirée',
    declined_by_traveler: 'Refusée par le voyageur',
    en_litige:            'En litige',
    remboursee:           'Remboursée',
  },
  actions: {
    pay:      'Payer maintenant',
    cancel:   'Annuler la réservation',
    approve:  'Accepter la demande',
    decline:  'Refuser',
    dispute:  'Ouvrir un litige',
    book:     'Réserver',
    confirm:  'Confirmer la réservation',
  },
  labels: {
    weightKg:        'Poids réservé (kg)',
    description:     'Description du colis',
    comment:         'Commentaire',
    commentOptional: 'Commentaire (optionnel)',
    totalEstimated:  'Total estimé',
    pricePerKg:      'Prix/kg',
    available:       'dispo',
    max:             'Max',
    by:              'Par',
    traveler:        'Voyageur',
    sender:          'Expéditeur',
    requestDate:     'Date de la demande',
  },
  messages: {
    pendingApprovalInfo:  "En attente d'approbation du voyageur. Vous serez notifié par email.",
    paymentRequired:      'Le paiement doit être effectué avant expiration du délai.',
    approvedSuccess:      'Réservation approuvée.',
    declinedSuccess:      'Réservation refusée.',
    cancelledSuccess:     'Réservation annulée.',
    createdSuccess:       'Réservation créée avec succès !',
    disputeOpenedSuccess: 'Litige ouvert.',
  },
  sections: {
    pendingRequests: 'Demandes en attente',
    myBookings:      'Mes réservations',
    bookingDetail:   'Détail de la réservation',
  },
  pickup: {
    title:               'Point de dépôt',
    notDefined:          "Le voyageur n'a pas encore défini de point de dépôt.",
    approximateZone:     "L'adresse exacte sera révélée après confirmation du paiement.",
    exactAddress:        'Adresse exacte',
    instructions:        'Instructions',
    defineTitle:         'Définir le point de dépôt',
    address:             'Adresse',
    city:                'Ville',
    latitude:            'Latitude',
    longitude:           'Longitude',
    approxLatitude:      'Latitude approximative',
    approxLongitude:     'Longitude approximative',
    instructionsHint:    'Instructions pour l\'expéditeur (optionnel)',
    saveSuccess:         'Point de dépôt enregistré.',
  },
  dispute: {
    title:           'Litige',
    openTitle:       'Ouvrir un litige',
    reason:          'Motif du litige',
    reasonMin:       'Le motif doit contenir au moins 10 caractères.',
    messagePlaceholder: 'Votre message…',
    sendMessage:     'Envoyer',
    resolvedInfo:    'Ce litige est résolu.',
    you:             'Vous',
    admin:           'Administrateur',
    addMessage:      'Ajouter un message',
  },
  kyc: {
    title:           'Vérification d\'identité (KYC)',
    pending:         'Votre demande est en cours de vérification.',
    approved:        'Identité vérifiée ✓',
    rejectedPrefix:  'Demande refusée :',
    resubmit:        'Resoumettre',
    idPhotoUrl:      'URL photo de votre pièce d\'identité',
    parcelPhotoUrl:  'URL photo du colis',
    submitSuccess:   'Demande KYC soumise.',
    submit:          'Soumettre',
  },
} as const

const frTrip = {
  labels: {
    departure:   'Départ',
    destination: 'Destination',
    date:        'Date',
    pricePerKg:  'Prix/kg',
    available:   'Disponible',
    traveler:    'Voyageur',
    status:      'Statut',
  },
  search: {
    title:       'Rechercher un trajet',
    subtitle:    'Trouvez des voyageurs partant vers votre destination',
    departure:   'Ville de départ',
    destination: 'Destination',
    date:        'Date de départ',
    submit:      'Rechercher',
    seeAll:      'Voir tous les trajets disponibles →',
    noResults:   'Aucun trajet ne correspond à votre recherche.',
  },
  actions: {
    see:    'Voir ce trajet',
    book:   'Réserver',
    login:  'Se connecter pour réserver',
  },
} as const

// ─── Namespaces EN ─────────────────────────────────────────────────────────

const enCommon = {
  actions: {
    save:     'Save',
    cancel:   'Cancel',
    confirm:  'Confirm',
    back:     'Back',
    retry:    'Retry',
    search:   'Search',
    seeAll:   'See all',
    copy:     'Copy',
    copied:   'Copied!',
    openMaps: 'Open in Maps',
    loading:  'Loading…',
    close:    'Close',
  },
  errors: {
    generic:      'An error occurred. Please try again.',
    network:      'Cannot reach the server. Check your connection.',
    notFound:     'Resource not found.',
    unauthorized: 'You must be logged in to access this page.',
    forbidden:    "You don't have the required permissions.",
    validation:   'Please fix the errors below.',
  },
  empty: {
    default:  'No results',
    bookings: 'No bookings yet.',
    trips:    'No trips available.',
    messages: 'No messages yet.',
  },
  nav: {
    home:       'Home',
    mySpace:    'My space',
    login:      'Log in',
    register:   'Sign up',
    logout:     'Log out',
    howItWorks: 'How it works',
    services:   'Our services',
    pricing:    'Pricing',
  },
  roles: {
    sender:   'Sender',
    traveler: 'Traveler',
  },
} as const

const enBooking = {
  status: {
    pending_approval:     'Pending approval',
    en_paiement:          'Payment required',
    confirmee:            'Confirmed',
    livree:               'Delivered',
    termine:              'Completed',
    annule:               'Cancelled',
    expiree:              'Expired',
    declined_by_traveler: 'Declined by traveler',
    en_litige:            'Disputed',
    remboursee:           'Refunded',
  },
  actions: {
    pay:     'Pay now',
    cancel:  'Cancel booking',
    approve: 'Accept request',
    decline: 'Decline',
    dispute: 'Open dispute',
    book:    'Book',
    confirm: 'Confirm booking',
  },
  labels: {
    weightKg:        'Reserved weight (kg)',
    description:     'Parcel description',
    comment:         'Comment',
    commentOptional: 'Comment (optional)',
    totalEstimated:  'Estimated total',
    pricePerKg:      'Price/kg',
    available:       'available',
    max:             'Max',
    by:              'By',
    traveler:        'Traveler',
    sender:          'Sender',
    requestDate:     'Request date',
  },
  messages: {
    pendingApprovalInfo:  'Waiting for traveler approval. You will be notified by email.',
    paymentRequired:      'Payment must be completed before the deadline.',
    approvedSuccess:      'Booking approved.',
    declinedSuccess:      'Booking declined.',
    cancelledSuccess:     'Booking cancelled.',
    createdSuccess:       'Booking created successfully!',
    disputeOpenedSuccess: 'Dispute opened.',
  },
  sections: {
    pendingRequests: 'Pending requests',
    myBookings:      'My bookings',
    bookingDetail:   'Booking detail',
  },
} as const

const enAuth = {
  login: {
    title:    'Log in',
    subtitle: 'Access your Safe Move account',
    email:    'Email address',
    password: 'Password',
    submit:   'Log in',
    noAccount: "Don't have an account?",
    register:  'Sign up',
    backHome:  '← Back to home',
    errors: {
      invalidCredentials: 'Invalid email or password.',
      emailRequired:      'Email is required.',
      passwordRequired:   'Password is required.',
    },
  },
  register: {
    title:        'Create account',
    subtitle:     'Join the Safe Move community',
    fullName:     'Full name',
    email:        'Email address',
    phone:        'Phone (e.g. +33612345678)',
    password:     'Password',
    role:         'I am…',
    roleSender:   'Sender — I send parcels',
    roleTraveler: 'Traveler — I carry luggage',
    submit:       'Create account',
    hasAccount:   'Already have an account?',
    login:        'Log in',
    backHome:     '← Back to home',
    errors: {
      fullNameRequired: 'Full name is required.',
      emailRequired:    'Email is required.',
      phoneInvalid:     'Invalid phone number (e.g. +33612345678)',
      passwordMin:      'Password must be at least 8 characters.',
      roleRequired:     'Please select a role.',
    },
  },
} as const

const enTrip = {
  labels: {
    departure:   'Departure',
    destination: 'Destination',
    date:        'Date',
    pricePerKg:  'Price/kg',
    available:   'Available',
    traveler:    'Traveler',
    status:      'Status',
  },
  search: {
    title:       'Find a trip',
    subtitle:    'Find travelers heading to your destination',
    departure:   'Departure city',
    destination: 'Destination',
    date:        'Departure date',
    submit:      'Search',
    seeAll:      'See all available trips →',
    noResults:   'No trips match your search.',
  },
  actions: {
    see:   'View trip',
    book:  'Book',
    login: 'Log in to book',
  },
} as const

// ─── Init ──────────────────────────────────────────────────────────────────

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common:  frCommon,
        auth:    frAuth,
        booking: frBooking,
        trip:    frTrip,
      },
      en: {
        common:  enCommon,
        auth:    enAuth,
        booking: enBooking,
        trip:    enTrip,
      },
    },
    defaultNS: 'common',
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sm_lang',
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n

// ─── Type helpers ──────────────────────────────────────────────────────────
export type SupportedLanguage = 'fr' | 'en'

export function isSupported(lang: string): lang is SupportedLanguage {
  return lang === 'fr' || lang === 'en'
}