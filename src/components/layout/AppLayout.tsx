import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'
import toast from 'react-hot-toast'
import { LogOut, User, Menu, X } from 'lucide-react'


interface NavItem {
  label: string
  path:  string
  icon:  React.ReactNode
}

interface AppLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
}

export default function AppLayout({ children, navItems }: AppLayoutProps) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const user      = useAuthStore((s) => s.user)
  const logout    = useAuthStore((s) => s.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try { await client.post('/logout') } catch {}
    logout()
    toast.success('Déconnecté')
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/" aria-label="Accueil Safe Move">
          <img src="/logo-nav-hori.png" alt="Safe Move" className="h-14" />
        </Link>
        <p className="text-xs text-gray-500 mt-2 truncate">
          {user?.first_name} {user?.last_name}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation principale">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
                transition-colors duration-150 min-h-[44px]
                ${active
                  ? 'bg-[#EBF4FF] text-[#1B3A6B]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <span className="shrink-0" aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer user */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
          <User size={16} aria-hidden />
          <span className="truncate text-xs">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
        >
          <LogOut size={16} aria-hidden />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar desktop */}
      <aside
        className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col fixed h-screen z-30"
        aria-label="Barre latérale"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100
          flex flex-col transform transition-transform duration-200 md:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu mobile"
        aria-hidden={!sidebarOpen}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Fermer le menu"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 overflow-auto pb-20 md:pb-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={22} className="text-gray-600" />
          </button>
          <Link to="/">
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-12" />
          </Link>
        </div>

        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex"
        aria-label="Navigation mobile"
      >
        {navItems.slice(0, 4).map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 gap-0.5
                text-xs font-medium transition-colors min-h-[56px]
                ${active ? 'text-[#1B3A6B]' : 'text-gray-400'}
              `}
            >
              <span className="h-5 w-5" aria-hidden>{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}

        {/* Bouton déconnexion dans la bottom nav mobile */}
        <button
          onClick={handleLogout}
          aria-label="Déconnexion"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium text-red-500 min-h-[56px] transition-colors hover:bg-red-50"
        >
          <LogOut size={20} aria-hidden />
          <span className="text-[10px]">Quitter</span>
        </button>
      </nav>
    </div>
  )
}