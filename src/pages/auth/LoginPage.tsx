import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { Eye, EyeOff, ArrowRight, Shield, Lock, Package } from 'lucide-react'
import {
  useAuthStore, isSender, isPublicFrontendRole, type UserRole,
} from '@/store/authStore'
import { Button, Input } from '@/components/ui'
import client from '@/api/client'

interface LoginResponse {
  token: string
  user: {
    id: number; first_name: string; last_name: string
    email: string; role: UserRole; phone: string | null; country: string | null
  }
}

interface FieldErrors { email?: string; password?: string }

// ── Trust pill ───────────────────────────────────────────────────────────────

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-white/70 text-sm">
      <span className="shrink-0">{icon}</span>
      {label}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser  = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const mutation = useMutation({
    mutationFn: () => client.post<LoginResponse>('/login', { email, password }),
    onSuccess: ({ data }) => {
      if (!isPublicFrontendRole(data.user.role)) {
        toast.error('Accès non autorisé sur ce portail.')
        return
      }
      setUser(data.user)
      setToken(data.token)
      client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      toast.success('Connexion réussie')
      navigate(isSender(data.user.role) ? '/sender' : '/traveler')
    },
    onError: (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
      const status = error.response?.status
      const data   = error.response?.data
      if (status === 422 && data?.errors) {
        const mapped: FieldErrors = {}
        if (data.errors.email)    mapped.email    = data.errors.email[0]
        if (data.errors.password) mapped.password = data.errors.password[0]
        setFieldErrors(mapped)
        return
      }
      if (status === 401 || status === 422) {
        setFieldErrors({ email: 'Email ou mot de passe incorrect.' })
        return
      }
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    },
  })

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ───────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #050d1a 0%, #0f2544 40%, #1B3A6B 100%)' }}
      >
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} aria-hidden />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(50px)' }} aria-hidden />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img src="/logo-icon.png" alt="" className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105" aria-hidden />
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-9 object-contain" />
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-8">
          {/* Big quote */}
          <div>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
              Vos colis voyagent{' '}
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                en sécurité
              </span>
            </h2>
            <p className="text-blue-100/60 leading-relaxed">
              Connectez-vous pour gérer vos envois, suivre vos colis et profiter de la plateforme SafeMove.
            </p>
          </div>

          {/* Floating mockup card */}
          <div
            className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-[20px] p-5"
            style={{ animation: 'sm-float 4s ease-in-out infinite' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}>
                A
              </div>
              <div>
                <p className="text-white font-bold text-sm">Aminata S.</p>
                <p className="text-white/50 text-xs">Dakar → Paris · 3 kg</p>
              </div>
              <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-400/15 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                Livré ✓
              </span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed italic">
              "Livraison parfaite, paiement sécurisé. Je recommande SafeMove à toute ma famille."
            </p>
          </div>
        </div>

        {/* Bottom trust pills */}
        <div className="relative z-10 flex flex-col gap-3">
          <TrustPill icon={<Shield className="w-4 h-4 text-emerald-400" />} label="Identités KYC vérifiées" />
          <TrustPill icon={<Lock   className="w-4 h-4 text-blue-400"    />} label="Paiement escrow sécurisé" />
          <TrustPill icon={<Package className="w-4 h-4 text-amber-400"  />} label="Suivi en temps réel" />
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
        <div
          className="w-full max-w-md"
          style={{ animation: 'sm-fade-up 0.5s ease both' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 justify-center">
              <img src="/logo-icon.png" alt="" className="w-8 h-8 object-contain" aria-hidden />
              <img src="/logo-nav-hori.png" alt="Safe Move" className="h-8 object-contain" />
            </Link>
          </div>

          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1B3A6B] transition-colors mb-8 group">
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            Retour à l'accueil
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">Connexion</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Accédez à votre espace Safe Move</p>
          </div>

          {/* Form card */}
          <div
            className="bg-white rounded-[20px] p-7 sm:p-8"
            style={{ boxShadow: '0 4px 32px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)' }}
          >
            <form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
              className="flex flex-col gap-5"
              noValidate
            >
              <Input
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldErrors(p => ({ ...p, email: undefined }))
                }}
                placeholder="vous@exemple.com"
                error={fieldErrors.email}
                required
                autoComplete="email"
              />

              <div className="flex flex-col gap-1.5">
                <Input
                  label="Mot de passe"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors(p => ({ ...p, password: undefined }))
                  }}
                  placeholder="••••••••"
                  error={fieldErrors.password}
                  required
                  autoComplete="current-password"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                loading={mutation.isPending}
                className="w-full justify-center mt-1"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Se connecter
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-[#1B3A6B] hover:underline font-bold">
                S'inscrire gratuitement →
              </Link>
            </p>
          </div>

          {/* Trust footer */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Connexion sécurisée
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