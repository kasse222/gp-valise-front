import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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
    id: number
    first_name: string
    last_name: string
    email: string
    role: UserRole
    phone: string | null
    country: string | null
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser  = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      client.post<LoginResponse>('/login', { email, password }),
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
    onError: () => {
      toast.error('Email ou mot de passe incorrect')
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Safe Move</h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        <Card className="p-8">
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
            className="space-y-5"
          >
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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
            <Link
              to="/register"
              className="text-indigo-600 hover:underline font-medium"
            >
              S'inscrire
            </Link>
          </p>
        </Card>

      </div>
    </div>
  )
}