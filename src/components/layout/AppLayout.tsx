import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'
import toast from 'react-hot-toast'
import { LogOut, User, Menu, X } from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface AppLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
}

export default function AppLayout({ children, navItems }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user     = useAuthStore((s) => s.user)
  const logout   = useAuthStore((s) => s.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try { await client.post('/logout') } catch {}
    logout()
    toast.success('Déconnecté')
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">GP-Valise</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {user?.first_name} {user?.last_name}
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
          <User size={16} />
          <span className="truncate">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile drawer */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 overflow-auto">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-indigo-600">GP-Valise</h1>
        </div>
        {children}
      </main>
    </div>
  )
}