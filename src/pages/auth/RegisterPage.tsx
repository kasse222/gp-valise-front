import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { Eye, EyeOff, ArrowRight, Shield, Lock, Package, Plane } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { UserRole } from '@/store/authStore'
import client from '@/api/client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegisterPayload {
  first_name: string; last_name: string; email: string
  password: string; password_confirmation: string; phone: string; role: number
}

interface FieldErrors {
  first_name?: string; last_name?: string; email?: string
  password?: string; password_confirmation?: string; phone?: string; role?: string
}

const PHONE_REGEX = /^\+[1-9]\d{7,14}$/

function validatePhone(phone: string): string | undefined {
  if (!phone) return 'Le numéro de téléphone est obligatoire.'
  if (!PHONE_REGEX.test(phone)) return 'Numéro invalide (ex: +212612345678)'
  return undefined
}

// ── Role selector card ────────────────────────────────────────────────────────

function RoleCard({
  value, selected, onChange, icon, title, description,
}: {
  value: number; selected: boolean; onChange: () => void
  icon: React.ReactNode; title: string; description: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        flex-1 flex flex-col items-center text-center gap-3 p-4 rounded-[14px] border-2
        transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-[#1B3A6B] bg-[#EBF4FF] shadow-[0_0_0_4px_rgba(27,58,107,0.1)]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
      `}
      aria-pressed={selected}
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
        ${selected ? 'bg-[#1B3A6B] text-white shadow-sm' : 'bg-slate-100 text-slate-500'}
      `}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-bold transition-colors ${selected ? 'text-[#1B3A6B]' : 'text-slate-700'}`}>
          {title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className={`
        w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
        ${selected ? 'border-[#1B3A6B] bg-[#1B3A6B]' : 'border-slate-300 bg-white'}
      `}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam      = searchParams.get('role')
  const initialRole    = roleParam === 'traveler' ? UserRole.TRAVELER : UserRole.SENDER

  const [form, setForm] = useState<RegisterPayload>({
    first_name: '', last_name: '', email: '',
    password: '', password_confirmation: '', phone: '',
    role: initialRole,
  })
  const [showPwd,     setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function set<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
    setForm(p => ({ ...p, [key]: value }))
    setFieldErrors(p => ({ ...p, [key]: undefined }))
  }

  function validateForm(): boolean {
    const phoneError = validatePhone(form.phone)
    if (phoneError) { setFieldErrors(p => ({ ...p, phone: phoneError })); return false }
    if (form.password.length < 8) {
      setFieldErrors(p => ({ ...p, password: 'Au moins 8 caractères.' })); return false
    }
    if (form.password !== form.password_confirmation) {
      setFieldErrors(p => ({ ...p, password_confirmation: 'Les mots de passe ne correspondent pas.' })); return false
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
        const translations: Record<string, string> = {
          'The email has already been taken.': 'Cet email est déjà utilisé.',
          'The phone has already been taken.': 'Ce numéro est déjà utilisé.',
          'The email field is required.':      "L'email est obligatoire.",
          'The password must be at least 8 characters.': 'Au moins 8 caractères.',
          'The first name field is required.': 'Le prénom est obligatoire.',
          'The last name field is required.':  'Le nom est obligatoire.',
        }
        const mapped: FieldErrors = {}
        for (const [field, messages] of Object.entries(data.errors)) {
          ;(mapped as Record<string, string>)[field] = translations[messages[0]] ?? messages[0]
        }
        setFieldErrors(mapped)
        toast.error('Veuillez corriger les erreurs ci-dessous.')
      } else {
        toast.error('Une erreur est survenue. Veuillez réessayer.')
      }
    },
  })

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ───────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[42%] xl:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #050d1a 0%, #0f2544 40%, #1B3A6B 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} aria-hidden />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', filter: 'blur(50px)' }} aria-hidden />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img src="/logo-icon.png" alt="" className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105" aria-hidden />
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-9 object-contain" />
          </Link>
        </div>

        {/* Center */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-4">
              Rejoignez la communauté{' '}
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Safe Move
              </span>
            </h2>
            <p className="text-blue-100/60 leading-relaxed text-sm">
              Des milliers d'utilisateurs font déjà confiance à SafeMove pour leurs envois entre l'Afrique et l'Europe.
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: 'Identité vérifiée', sub: 'KYC rapide, 100% sécurisé' },
              { icon: <Lock   className="w-5 h-5 text-blue-400"    />, title: 'Escrow garanti',    sub: 'Paiement libéré à la livraison' },
              { icon: <Package className="w-5 h-5 text-amber-400"  />, title: 'Suivi en temps réel', sub: 'QR code + code secret' },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-4 bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-[14px] px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-white/50 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">© 2026 GP-Valise / Safe Move</p>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-slate-50 overflow-y-auto">
        <div
          className="w-full max-w-lg"
          style={{ animation: 'sm-fade-up 0.5s ease both' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 justify-center">
              <img src="/logo-icon.png" alt="" className="w-8 h-8 object-contain" aria-hidden />
              <img src="/logo-nav-hori.png" alt="Safe Move" className="h-8 object-contain" />
            </Link>
          </div>

          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1B3A6B] transition-colors mb-8 group">
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            Retour à l'accueil
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">Créer un compte</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Rejoignez la communauté Safe Move</p>
          </div>

          {/* Form card */}
          <div
            className="bg-white rounded-[20px] p-7 sm:p-8"
            style={{ boxShadow: '0 4px 32px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)' }}
          >
            <form onSubmit={(e) => { e.preventDefault(); if (validateForm()) mutation.mutate() }}
              className="flex flex-col gap-5" noValidate>

              {/* Role selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">
                  Je suis… <span className="text-red-500" aria-hidden>*</span>
                </label>
                <div className="flex gap-3">
                  <RoleCard
                    value={UserRole.SENDER}
                    selected={form.role === UserRole.SENDER}
                    onChange={() => set('role', UserRole.SENDER)}
                    icon={<Package className="w-5 h-5" />}
                    title="Expéditeur"
                    description="J'envoie des colis"
                  />
                  <RoleCard
                    value={UserRole.TRAVELER}
                    selected={form.role === UserRole.TRAVELER}
                    onChange={() => set('role', UserRole.TRAVELER)}
                    icon={<Plane className="w-5 h-5" />}
                    title="Voyageur"
                    description="Je transporte des bagages"
                  />
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" type="text" value={form.first_name}
                  onChange={(e) => set('first_name', e.target.value)}
                  placeholder="Jean" error={fieldErrors.first_name}
                  autoComplete="given-name" required />
                <Input label="Nom" type="text" value={form.last_name}
                  onChange={(e) => set('last_name', e.target.value)}
                  placeholder="Dupont" error={fieldErrors.last_name}
                  autoComplete="family-name" required />
              </div>

              <Input label="Adresse email" type="email" value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="vous@exemple.com" error={fieldErrors.email}
                autoComplete="email" required />

              <Input label="Téléphone" type="tel" value={form.phone}
                onChange={(e) => {
                  set('phone', e.target.value)
                  if (e.target.value.length > 6) {
                    const err = validatePhone(e.target.value)
                    setFieldErrors(p => ({ ...p, phone: err }))
                  }
                }}
                placeholder="+212612345678"
                helper="Format international requis"
                error={fieldErrors.phone}
                autoComplete="tel" required />

              <Input label="Mot de passe" type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="8 caractères minimum"
                helper="Minimum 8 caractères"
                error={fieldErrors.password}
                autoComplete="new-password" required
                rightIcon={
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                } />

              <Input label="Confirmer le mot de passe" type={showConfirm ? 'text' : 'password'}
                value={form.password_confirmation}
                onChange={(e) => set('password_confirmation', e.target.value)}
                placeholder="••••••••"
                error={fieldErrors.password_confirmation}
                autoComplete="new-password" required
                rightIcon={
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                } />

              <Button type="submit" loading={mutation.isPending}
                className="w-full justify-center mt-1" size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}>
                Créer mon compte
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">déjà inscrit ?</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500">
              <Link to="/login" className="text-[#1B3A6B] hover:underline font-bold">
                Se connecter →
              </Link>
            </p>
          </div>

          {/* Trust footer */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Inscription gratuite
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              Données chiffrées
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}