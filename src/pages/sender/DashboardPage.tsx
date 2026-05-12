import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { LayoutDashboard, Package, AlertTriangle } from 'lucide-react'
import OverviewPage from './OverviewPage'
import BookingsPage from './BookingsPage'
import BookingDetailPage from './BookingDetailPage'

const navItems = [
  { label: 'Vue d\'ensemble',  path: '/sender',          icon: <LayoutDashboard size={16} /> },
  { label: 'Mes réservations', path: '/sender/bookings', icon: <Package size={16} /> },
  { label: 'Mes litiges',      path: '/sender/disputes', icon: <AlertTriangle size={16} /> },
]

export default function SenderDashboard() {
  return (
    <AppLayout navItems={navItems}>
      <Routes>
        <Route index          element={<OverviewPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
      </Routes>
    </AppLayout>
  )
}