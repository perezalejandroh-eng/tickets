import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// Layout
import Layout from './components/layout/Layout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'

// User pages
import Dashboard from './pages/user/Dashboard'
import CreateTicket from './pages/user/CreateTicket'
import MyTickets from './pages/user/MyTickets'
import TicketDetail from './pages/user/TicketDetail'
import Profile from './pages/user/Profile'

// Support pages
import SupportInbox from './pages/support/SupportInbox'
import SupportDashboard from './pages/support/SupportDashboard'

// Admin pages
import AdminPanel from './pages/admin/AdminPanel'

// Notifications
import NotificationsPage from './pages/notifications/NotificationsPage'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
  </div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verificar" element={<VerifyEmail />} />

      {/* Protected */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="tickets/nuevo" element={<CreateTicket />} />
        <Route path="tickets/mis-tickets" element={<MyTickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="notificaciones" element={<NotificationsPage />} />
        <Route path="perfil" element={<Profile />} />

        {/* Soporte */}
        <Route path="soporte/bandeja" element={
          <PrivateRoute roles={['AGENTE', 'SUPERVISOR', 'ADMINISTRADOR']}>
            <SupportInbox />
          </PrivateRoute>
        } />
        <Route path="soporte/dashboard" element={
          <PrivateRoute roles={['SUPERVISOR', 'ADMINISTRADOR']}>
            <SupportDashboard />
          </PrivateRoute>
        } />

        {/* Admin */}
        <Route path="admin/*" element={
          <PrivateRoute roles={['ADMINISTRADOR']}>
            <AdminPanel />
          </PrivateRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  )
}
