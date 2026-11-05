import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Ticket, PlusCircle, Inbox, BarChart2,
  Settings, Bell, X, Users, BookOpen
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const navItem = (to, icon, label) => ({ to, icon, label })

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const rol = user?.rol

  const userLinks = [
    navItem('/', LayoutDashboard, 'Dashboard'),
    navItem('/tickets/nuevo', PlusCircle, 'Nuevo ticket'),
    navItem('/tickets/mis-tickets', Ticket, 'Mis tickets'),
    navItem('/notificaciones', Bell, 'Notificaciones'),
  ]

  const supportLinks = [
    navItem('/soporte/bandeja', Inbox, 'Bandeja de soporte'),
    navItem('/soporte/dashboard', BarChart2, 'Dashboard soporte'),
  ]

  const adminLinks = [
    navItem('/admin', Settings, 'Administración'),
    navItem('/admin/catalogos', BookOpen, 'Catálogos'),
    navItem('/admin/usuarios', Users, 'Usuarios'),
  ]

  const isSupport = ['AGENTE', 'SUPERVISOR', 'ADMINISTRADOR'].includes(rol)
  const isAdmin = rol === 'ADMINISTRADOR'

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col',
        'transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:z-auto'
      )}>
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Menú</span>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div>
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <img src="https://cdn.prod.website-files.com/66de2022d72eb33f2727d561/66ff03b5d8b8e65fc2f9fb4c_b76b4e4e-ae18-4847-9519-88dba873d57a-p-2000.jpg" alt="Logo" /> 
            </p> 
          </div>
          <Section label="">
            {userLinks.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
          </Section>

          {isSupport && (
            <Section label="Soporte">
              {supportLinks.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
            </Section>
          )}

          {isAdmin && (
            <Section label="Administración">
              {adminLinks.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
            </Section>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-primary-700">
          <p className="text-xs text-primary-200 text-center">
            Sistema de Soporte TI v1.0
          </p>
        </div>
      </aside>
    </>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  )
}

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}
