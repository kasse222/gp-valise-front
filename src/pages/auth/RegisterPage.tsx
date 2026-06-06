import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import { Button, Input, Card } from '@/components/ui'
import { UserRole } from '@/store/authStore'
import client from '@/api/client'

// ─── Types ─────────────────────────────────────────────────────────────────

interface RegisterPayload {
  first_name:            string
  last_name:             string
  email:                 string
  password:              string
  password_confirmation: string
  phone:                 string
  role:                  number
}

interface FieldErrors {
  first_name?:            string
  last_name?:             string
  email?:                 string
  password?:              string
  password_confirmation?: string
  phone?:                 string
  role?:                  string
}

// ─── Validation téléphone ──────────────────────────────────────────────────
// Format international : +[code pays][numéro] — ex: +212612345678
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/

function validatePhone(phone: string): string | undefined {
  if (!phone) return 'Le numéro de téléphone est obligatoire.'
  if (!PHONE_REGEX.test(phone)) return 'Numéro invalide (ex: +212612345678)'
  return undefined
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate      = useNavigate()
  const [searchParams] = useSearchParams()

  // Pré-sélection rôle via ?role=traveler (depuis CTA "Devenir transporteur")
  const roleParam = searchParams.get('role')
  const initialRole = roleParam === 'traveler' ? UserRole.TRAVELER : UserRole.SENDER

  const [form, setForm] = useState<RegisterPayload>({
    first_name:            '',
    last_name:             '',
    email:                 '',
    password:              '',
    password_confirmation: '',
    phone:                 '',
    role:                  initialRole,
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function set<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // Validation client-side téléphone avant submit
  function validateForm(): boolean {
    const phoneError = validatePhone(form.phone)
    if (phoneError) {
      setFieldErrors((p) => ({ ...p, phone: phoneError }))
      return false
    }
    if (form.password.length < 8) {
      setFieldErrors((p) => ({ ...p, password: 'Le mot de passe doit contenir au moins 8 caractères.' }))
      return false
    }
    if (form.password !== form.password_confirmation) {
      setFieldErrors((p) => ({ ...p, password_confirmation: 'Les mots de passe ne correspondent pas.' }))
      return false
    }
    return true
  }

  const mutation = useMutation({
    mutationFn: () => client.post('/register', form),
    onSuccess: () => {
      toast.success('Inscription réussie ! Connectez-vous.')
      navigate('/login')
    },
    onError: (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
      const data   = error.response?.data
      const status = error.response?.status

      if (status === 422 && data?.errors) {
        const mapped: FieldErrors = {}
        // Traduction des messages API → FR
        const translations: Record<string, string> = {
          'The email has already been taken.':          'Cet email est déjà utilisé.',
          'The email field is required.':               "L'email est obligatoire.",
          'The phone has already been taken.':          'Ce numéro de téléphone est déjà utilisé.',
          'The password must be at least 8 characters.': 'Le mot de passe doit contenir au moins 8 caractères.',
          'The first name field is required.':          'Le prénom est obligatoire.',
          'The last name field is required.':           'Le nom est obligatoire.',
        }
        for (const [field, messages] of Object.entries(data.errors)) {
          const raw = messages[0]
          ;(mapped as Record<string, string>)[field] = translations[raw] ?? raw
        }
        setFieldErrors(mapped)
        toast.error('Veuillez corriger les erreurs ci-dessous.')
      } else {
        toast.error('Une erreur est survenue. Veuillez réessayer.')
      }
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return
    mutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Retour accueil */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors mb-6"
        >
          ← Retour à l'accueil
        </Link>

        {/* Logo + titre */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 mt-1 text-sm">Rejoignez la communauté Safe Move</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                value={form.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                placeholder="Jean"
                error={fieldErrors.first_name}
                autoComplete="given-name"
                required
              />
              <Input
                label="Nom"
                type="text"
                value={form.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                placeholder="Dupont"
                error={fieldErrors.last_name}
                autoComplete="family-name"
                required
              />
            </div>

            {/* Email */}
            <Input
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="vous@exemple.com"
              error={fieldErrors.email}
              autoComplete="email"
              required
            />

            {/* Téléphone — avec format hint */}
            <Input
              label="Téléphone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value
                set('phone', val)
                // Validation live après 6 chars
                if (val.length > 6) {
                  const err = validatePhone(val)
                  setFieldErrors((p) => ({ ...p, phone: err }))
                }
              }}
              placeholder="+212612345678"
              helper="Format international requis (ex: +212612345678)"
              error={fieldErrors.phone}
              autoComplete="tel"
              required
            />

            {/* Rôle — pré-sélectionné si ?role=traveler */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 select-none">
                Je suis… <span className="text-red-500" aria-hidden>*</span>
              </label>
              <select
                value={form.role}
                onChange={(e) => set('role', Number(e.target.value))}
                className="w-full min-h-[48px] px-4 py-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all duration-200"
              >
                <option value={UserRole.SENDER}>Expéditeur — j'envoie des colis</option>
                <option value={UserRole.TRAVELER}>Voyageur — je transporte des bagages</option>
              </select>
              {fieldErrors.role && (
                <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
                  <span aria-hidden>⚠</span> {fieldErrors.role}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <Input
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="8 caractères minimum"
              helper="Minimum 8 caractères"
              error={fieldErrors.password}
              autoComplete="new-password"
              required
            />

            {/* Confirmation */}
            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={form.password_confirmation}
              onChange={(e) => set('password_confirmation', e.target.value)}
              placeholder="••••••••"
              error={fieldErrors.password_confirmation}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              loading={mutation.isPending}
              className="w-full justify-center"
            >
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[#1B3A6B] hover:underline font-semibold">
              Se connecter
            </Link>
          </p>
        </Card>

      </div>
    </div>
  )
}