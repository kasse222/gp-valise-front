/**
 * Safe Move — Design Tokens
 * Source of truth pour couleurs, typography, spacing, shadows
 * Sync avec tailwind.config.ts et CSS custom properties
 */

// ─── Brand Colors ──────────────────────────────────────────────────────────
export const colors = {
  brand: {
    primary:      '#1B3A6B',
    primaryHover: '#2B6CB0',
    primaryDark:  '#0F2544',
    primaryLight: '#EBF4FF',
    primary50:    '#F0F7FF',
  },
  neutral: {
    900: '#111827',
    700: '#374151',
    500: '#6B7280',
    300: '#D1D5DB',
    100: '#F3F4F6',
    50:  '#F9FAFB',
    0:   '#FFFFFF',
  },
  status: {
    pending:     { fg: '#D97706', bg: '#FEF3C7' },
    success:     { fg: '#059669', bg: '#D1FAE5' },
    danger:      { fg: '#DC2626', bg: '#FEE2E2' },
    neutral:     { fg: '#6B7280', bg: '#F3F4F6' },
    info:        { fg: '#2563EB', bg: '#DBEAFE' },
  },
  feedback: {
    error:   { fg: '#DC2626', bg: '#FEF2F2' },
    warning: { fg: '#D97706', bg: '#FFFBEB' },
    success: { fg: '#059669', bg: '#ECFDF5' },
  },
} as const

// ─── Booking Status → Color Mapping ────────────────────────────────────────
export type BookingStatusCode =
  | 'pending_approval'
  | 'en_paiement'
  | 'confirmee'
  | 'livree'
  | 'termine'
  | 'annule'
  | 'expiree'
  | 'declined_by_traveler'
  | 'en_litige'
  | 'remboursee'

export type StatusVariant = 'pending' | 'success' | 'danger' | 'neutral' | 'info'

export const bookingStatusMap: Record<BookingStatusCode, {
  variant: StatusVariant
  label: string
  labelEn: string
}> = {
  pending_approval:     { variant: 'pending', label: "En attente d'approbation", labelEn: 'Pending approval' },
  en_paiement:          { variant: 'pending', label: 'À payer',                  labelEn: 'Payment required' },
  confirmee:            { variant: 'info',    label: 'Confirmée',                labelEn: 'Confirmed' },
  livree:               { variant: 'success', label: 'Livrée',                   labelEn: 'Delivered' },
  termine:              { variant: 'success', label: 'Terminée',                 labelEn: 'Completed' },
  annule:               { variant: 'neutral', label: 'Annulée',                  labelEn: 'Cancelled' },
  expiree:              { variant: 'neutral', label: 'Expirée',                  labelEn: 'Expired' },
  declined_by_traveler: { variant: 'danger',  label: 'Refusée par le voyageur', labelEn: 'Declined' },
  en_litige:            { variant: 'danger',  label: 'En litige',               labelEn: 'Disputed' },
  remboursee:           { variant: 'neutral', label: 'Remboursée',              labelEn: 'Refunded' },
}

// ─── Typography ────────────────────────────────────────────────────────────
export const typography = {
  fonts: {
    display: "'Sora', system-ui, sans-serif",
    body:    "'DM Sans', system-ui, sans-serif",
    mono:    "'JetBrains Mono', 'Fira Code', monospace",
  },
  scale: {
    display: { size: '3rem',       lineHeight: '1.1', weight: '700' },
    h1:      { size: '2.25rem',    lineHeight: '1.2', weight: '700' },
    h2:      { size: '1.5rem',     lineHeight: '1.3', weight: '600' },
    h3:      { size: '1.25rem',    lineHeight: '1.4', weight: '600' },
    h4:      { size: '1rem',       lineHeight: '1.4', weight: '600' },
    body:    { size: '0.9375rem',  lineHeight: '1.6', weight: '400' },
    sm:      { size: '0.8125rem',  lineHeight: '1.5', weight: '400' },
    xs:      { size: '0.6875rem',  lineHeight: '1.4', weight: '500' },
    amount:  { size: '1.125rem',   lineHeight: '1.2', weight: '700' },
  },
} as const

// ─── Spacing ───────────────────────────────────────────────────────────────
export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  16: '64px',
  20: '80px',
} as const

// ─── Border Radius ─────────────────────────────────────────────────────────
export const radius = {
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  '2xl': '28px',
  full: '9999px',
} as const

// ─── Shadows ───────────────────────────────────────────────────────────────
export const shadows = {
  xs:         '0 1px 2px rgba(0,0,0,0.05)',
  sm:         '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  md:         '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
  lg:         '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
  focus:      '0 0 0 3px rgba(27,58,107,0.25)',
  focusError: '0 0 0 3px rgba(220,38,38,0.25)',
} as const

// ─── Transitions ───────────────────────────────────────────────────────────
export const transitions = {
  fast:   '150ms ease-in-out',
  base:   '200ms ease-in-out',
  slow:   '300ms ease-out',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const

// ─── Breakpoints ───────────────────────────────────────────────────────────
export const breakpoints = {
  sm:  480,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
} as const

// ─── Touch Targets (a11y) ──────────────────────────────────────────────────
export const touchTarget = {
  min: '48px',   // WCAG 2.5.8 — minimum touch target
  gap: '8px',    // Gap minimum entre éléments interactifs
} as const

// ─── Z-Index Scale ─────────────────────────────────────────────────────────
export const zIndex = {
  base:    0,
  raised:  10,
  dropdown: 100,
  sticky:  200,
  overlay: 300,
  modal:   400,
  toast:   500,
} as const

// ─── CSS Custom Properties (injecter dans :root) ───────────────────────────
export const cssVariables = `
  :root {
    /* Brand */
    --color-primary:       ${colors.brand.primary};
    --color-primary-hover: ${colors.brand.primaryHover};
    --color-primary-dark:  ${colors.brand.primaryDark};
    --color-primary-light: ${colors.brand.primaryLight};
    --color-primary-50:    ${colors.brand.primary50};

    /* Neutral */
    --color-gray-900: ${colors.neutral[900]};
    --color-gray-700: ${colors.neutral[700]};
    --color-gray-500: ${colors.neutral[500]};
    --color-gray-300: ${colors.neutral[300]};
    --color-gray-100: ${colors.neutral[100]};
    --color-gray-50:  ${colors.neutral[50]};

    /* Status */
    --color-status-pending-fg:  ${colors.status.pending.fg};
    --color-status-pending-bg:  ${colors.status.pending.bg};
    --color-status-success-fg:  ${colors.status.success.fg};
    --color-status-success-bg:  ${colors.status.success.bg};
    --color-status-danger-fg:   ${colors.status.danger.fg};
    --color-status-danger-bg:   ${colors.status.danger.bg};
    --color-status-neutral-fg:  ${colors.status.neutral.fg};
    --color-status-neutral-bg:  ${colors.status.neutral.bg};
    --color-status-info-fg:     ${colors.status.info.fg};
    --color-status-info-bg:     ${colors.status.info.bg};

    /* Shadows */
    --shadow-xs:          ${shadows.xs};
    --shadow-sm:          ${shadows.sm};
    --shadow-md:          ${shadows.md};
    --shadow-lg:          ${shadows.lg};
    --shadow-focus:       ${shadows.focus};
    --shadow-focus-error: ${shadows.focusError};

    /* Transitions */
    --transition-fast:   ${transitions.fast};
    --transition-base:   ${transitions.base};
    --transition-slow:   ${transitions.slow};

    /* Typography */
    --font-display: ${typography.fonts.display};
    --font-body:    ${typography.fonts.body};
    --font-mono:    ${typography.fonts.mono};

    /* Touch */
    --touch-target-min: ${touchTarget.min};
    --touch-target-gap: ${touchTarget.gap};
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Formate un montant en centimes → string localisé
 * @example formatAmount(1250) → "12,50 €"
 */
export function formatAmount(
  centimes: number,
  currency: 'EUR' | 'XOF' = 'EUR',
  locale: 'fr' | 'en' = 'fr',
): string {
  const amount = centimes / 100
  const localeStr = locale === 'fr' ? 'fr-FR' : 'en-US'

  if (currency === 'XOF') {
    return new Intl.NumberFormat(localeStr, {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat(localeStr, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Résout les classes Tailwind d'un badge selon le variant de statut
 */
export function statusBadgeClasses(variant: StatusVariant): string {
  const map: Record<StatusVariant, string> = {
    pending: 'text-amber-700 bg-amber-100',
    success: 'text-emerald-700 bg-emerald-100',
    danger:  'text-red-700 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
    info:    'text-blue-700 bg-blue-100',
  }
  return map[variant]
}