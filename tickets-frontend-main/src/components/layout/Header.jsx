import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

export default function Header({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const { count } = useNotifications()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">Soporte TI</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications bell */}
          <Link
            to="/notificaciones"
            className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} />
            {count > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user?.nombre}</p>
              <p className="text-xs text-gray-500">{user?.rol}</p>
            </div>
            <Link
              to="/perfil"
              className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
              title="Mi perfil"
            >
              <User size={16} className="text-primary-700" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
