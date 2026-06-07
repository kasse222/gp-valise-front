import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import {
  useAuthStore,
  isSender,
  isPublicFrontendRole,
  type UserRole,
} from '@/store/authStore'
import { Button, Input, Card } from '@/components/ui'
import client from '@/api/client'

interface LoginResponse {
  token: string
  user: {
    id:         number
    first_name: string
    last_name:  string
    email:      string
    role:       UserRole
    phone:      string | null
    country:    string | null
  }
}

interface FieldErrors {
  email?:    string
  password?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser  = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

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
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-500 mt-1 text-sm">Accédez à votre espace Safe Move</p>
        </div>

        <Card className="p-6 sm:p-8">
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
                setFieldErrors((p) => ({ ...p, email: undefined }))
              }}
              placeholder="vous@exemple.com"
              error={fieldErrors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setFieldErrors((p) => ({ ...p, password: undefined }))
              }}
              placeholder="••••••••"
              error={fieldErrors.password}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={mutation.isPending}
              className="w-full justify-center"
            >
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#1B3A6B] hover:underline font-semibold">
              S'inscrire
            </Link>
          </p>
        </Card>

      </div>
    </div>
  )
}