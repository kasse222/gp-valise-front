import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import LandingPage from '@/pages/public/LandingPage'
import TripsPublicPage from '@/pages/public/TripsPublicPage'
import TripDetailPublicPage from '@/pages/public/TripDetailPublicPage'
import GpPublicProfilePage from '@/pages/public/GpPublicProfilePage'
import TrackingPage from '@/pages/public/TrackingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import SenderDashboard from '@/pages/sender/DashboardPage'
import TravelerDashboard from '@/pages/traveler/DashboardPage'
import PaymentSuccessPage from '@/pages/payment/PaymentSuccessPage'
import PaymentCancelPage from '@/pages/payment/PaymentCancelPage'

import { useAuthStore, isSender } from '@/store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

// F-031 — Error Boundary global
// Affiche un écran de récupération au lieu d'un écran blanc sur exception non catchée.
function AppErrorFallback({ error, resetErrorBoundary }: {
  error: unknown
  resetErrorBoundary: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          L'application a rencontré un problème inattendu.
          Vos données sont en sécurité.
        </p>
        {import.meta.env.DEV && error instanceof Error && (
          <pre className="text-left text-xs text-red-600 bg-red-50 rounded-[10px] p-3 mb-6 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1B3A6B] text-white text-sm font-semibold rounded-[10px] hover:bg-[#152d54] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <button
            onClick={() => { window.location.href = '/' }}
            className="px-4 py-3 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) {
    return <Navigate to={isSender(user.role) ? '/sender' : '/traveler'} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <div className="font-sans">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              {/* Landing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/trips" element={<TripsPublicPage />} />
              <Route path="/trips/:id" element={<TripDetailPublicPage />} />
              <Route path="/gp/:id" element={<GpPublicProfilePage />} />

              {/* Auth */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

              {/* Sender */}
              <Route path="/sender/*" element={<PrivateRoute><SenderDashboard /></PrivateRoute>} />

              {/* Traveler */}
              <Route path="/traveler/*" element={<PrivateRoute><TravelerDashboard /></PrivateRoute>} />

              {/* Payment callbacks */}
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/cancel" element={<PaymentCancelPage />} />

              {/* Tracking public — sans auth */}
              <Route path="/track/:tracking_id" element={<TrackingPage />} />

              {/* Default */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>

          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </div>
    </ErrorBoundary>
  )
}