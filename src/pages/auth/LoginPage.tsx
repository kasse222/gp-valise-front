import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'

interface LoginResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
    role: number
  }
}

export default function LoginPage() {
  const navigate   = useNavigate()
  const setUser    = useAuthStore((s) => s.setUser)
  const setToken   = useAuthStore((s) => s.setToken)
  const isSender   = useAuthStore((s) => s.isSender)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      client.post<LoginResponse>('/login', { email, password }),
    onSuccess: ({ data }) => {
      setUser(data.user)
      setToken(data.token)
      client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      toast.success('Connexion réussie')
      navigate(data.user.role === 3 ? '/sender' : '/traveler')
    },
    onError: () => {
      toast.error('Email ou mot de passe incorrect')
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SAFEMOVE</h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {mutation.isPending ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-medium">
              S'inscrire
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}