import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import LandingPage from '@/pages/public/LandingPage'
import TripsPublicPage from '@/pages/public/TripsPublicPage'
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
    <div className="font-sans">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/trips" element={<TripsPublicPage />} />

            {/* Public */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Sender */}
            <Route
              path="/sender/*"
              element={
                <PrivateRoute>
                  <SenderDashboard />
                </PrivateRoute>
              }
            />

            {/* Traveler */}
            <Route
              path="/traveler/*"
              element={
                <PrivateRoute>
                  <TravelerDashboard />
                </PrivateRoute>
              }
            />

            {/* Payment callbacks — public, sans token */}
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  )
}