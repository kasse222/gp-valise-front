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
        <Link to="/" aria-label="Accueil Safe Move" className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="" className="w-9 h-9 object-contain" aria-hidden />
          <img src="/logo-nav-hori.png" alt="Safe Move" className="h-8 object-contain" />
        </Link>
        <p className="text-xs text-gray-500 mt-2 truncate pl-0.5">
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

      {/* Sidebar desktop — w-64 sur md, w-72 sur lg, w-80 sur xl */}
      <aside
        className="hidden md:flex w-64 lg:w-72 xl:w-80 bg-white border-r border-gray-100 flex-col fixed h-screen z-30 shrink-0"
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
          fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-100
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

      {/* Main — s'adapte à la largeur de la sidebar */}
      <main className="flex-1 md:ml-64 lg:ml-72 xl:ml-80 min-w-0 overflow-auto pb-20 md:pb-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={22} className="text-gray-600" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="" className="w-7 h-7 object-contain" aria-hidden />
            <img src="/logo-nav-hori.png" alt="Safe Move" className="h-8 object-contain" />
          </Link>
        </div>

        {/* Contenu — padding généreux sur grand écran, pas de max-w global */}
        <div className="w-full">
          {children}
        </div>
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