import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'
import toast from 'react-hot-toast'
import { LogOut, User } from 'lucide-react'

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

  const handleLogout = async () => {
    try {
      await client.post('/logout')
    } catch {}
    logout()
    toast.success('Déconnecté')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">GP-Valise</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.first_name} {user?.last_name}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
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

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
            <User size={16} />
            <span className="truncate">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
              font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 overflow-auto">
        {children}
      </main>
    </div>
  )
}