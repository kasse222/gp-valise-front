import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'
import toast from 'react-hot-toast'
import { LogOut, Menu, X } from 'lucide-react'

interface NavItem {
  label: string
  path:  string
  icon:  React.ReactNode
}

interface AppLayoutProps {
  children:  React.ReactNode
  navItems:  NavItem[]
}

export default function AppLayout({ children, navItems }: AppLayoutProps) {
  const navigate     = useNavigate()
  const location     = useLocation()
  const user         = useAuthStore((s) => s.user)
  const logout       = useAuthStore((s) => s.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted,     setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const handleLogout = async () => {
    try { await client.post('/logout') } catch {}
    logout()
    toast.success('Déconnecté')
    navigate('/login')
  }

  // Active path detection — handle nested routes
  const isActive = (path: string) => {
    if (path === '/sender' || path === '/traveler') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link
          to="/"
          aria-label="Accueil Safe Move"
          className="flex items-center gap-2.5 group"
          onClick={() => setSidebarOpen(false)}
        >
          <img
            src="/logo-icon.png"
            alt=""
            className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110"
            aria-hidden
          />
          <img
            src="/logo-nav-hori.png"
            alt="Safe Move"
            className="h-8 object-contain"
          />
        </Link>

        {/* User info */}
        <div className="mt-4 flex items-center gap-3 px-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}
            aria-hidden
          >
            {user?.first_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav
        className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto"
        aria-label="Navigation principale"
      >
        {navItems.map((item, i) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
                transition-all duration-200 min-h-[44px] group overflow-hidden
                ${active
                  ? 'bg-[#1B3A6B] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
              `}
              style={{
                animationDelay: mounted ? `${i * 40}ms` : '0ms',
              }}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-300"
                  aria-hidden
                />
              )}

              {/* Hover shimmer on non-active */}
              {!active && (
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[10px]"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(27,58,107,0.04) 100%)',
                  }}
                  aria-hidden
                />
              )}

              <span
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  active ? 'text-white' : 'text-slate-400 group-hover:text-[#1B3A6B]'
                }`}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>

              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" aria-hidden />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
            text-red-500 hover:bg-red-50 hover:text-red-600
            transition-all duration-200 min-h-[44px] group"
        >
          <LogOut
            size={16}
            className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden
          />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar desktop ──────────────────────────────── */}
      <aside
        className="hidden md:flex w-64 lg:w-72 bg-white border-r border-slate-100 flex-col fixed h-screen z-30 shrink-0"
        style={{ boxShadow: '1px 0 0 0 #e2e8f0' }}
        aria-label="Barre latérale"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ─────────────────────────────── */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden transition-all duration-300
          ${sidebarOpen
            ? 'bg-slate-900/60 backdrop-blur-sm pointer-events-auto'
            : 'bg-transparent pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      {/* ── Mobile drawer ──────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-100
          flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          md:hidden shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu mobile"
        aria-hidden={!sidebarOpen}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
            rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          aria-label="Fermer le menu"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <main className="flex-1 md:ml-64 lg:ml-72 min-w-0 overflow-auto pb-20 md:pb-0">

        {/* Mobile topbar */}
        <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
              className="p-2 -ml-1 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2 flex-1">
              <img src="/logo-icon.png" alt="" className="w-7 h-7 object-contain" aria-hidden />
              <img src="/logo-nav-hori.png" alt="Safe Move" className="h-7 object-contain" />
            </Link>
            {/* Avatar mobile */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B3A6B, #3b82f6)' }}
              aria-label={`${user?.first_name} ${user?.last_name}`}
            >
              {user?.first_name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="w-full animate-[fadeIn_0.3s_ease_both]" style={{
          animation: 'sm-fade-in 0.3s ease both',
        }}>
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100"
        style={{ boxShadow: '0 -1px 0 0 #e2e8f0, 0 -4px 24px rgba(15,23,42,0.06)' }}
        aria-label="Navigation mobile"
      >
        <div className="flex">
          {navItems.slice(0, 4).map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`
                  flex-1 flex flex-col items-center justify-center py-2 gap-0.5
                  transition-all duration-200 min-h-[56px] relative
                  ${active ? 'text-[#1B3A6B]' : 'text-slate-400 hover:text-slate-600'}
                `}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#1B3A6B] transition-all duration-300"
                    aria-hidden
                  />
                )}
                <span
                  className={`
                    h-5 w-5 transition-transform duration-200
                    ${active ? 'scale-110' : 'scale-100'}
                  `}
                  aria-hidden
                >
                  {item.icon}
                </span>
                <span className={`text-[10px] font-medium ${active ? 'text-[#1B3A6B]' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            aria-label="Déconnexion"
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5
              text-red-400 min-h-[56px] transition-colors hover:text-red-500 hover:bg-red-50/50"
          >
            <LogOut size={20} aria-hidden />
            <span className="text-[10px] font-medium">Quitter</span>
          </button>
        </div>
      </nav>
    </div>
  )
}