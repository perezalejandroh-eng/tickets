import { useEffect, useState } from 'react'
import { Ticket, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { ticketService } from '../../services/ticketService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#4a7c23', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#6B7280']

export default function SupportDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ticketService.dashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
    </div>
  )

  const statCards = [
    { label: 'Nuevos', value: stats?.nuevos || 0, icon: <Ticket className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'En atención', value: stats?.enAtencion || 0, icon: <Clock className="text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Resueltos', value: stats?.resueltos || 0, icon: <CheckCircle className="text-green-600" />, bg: 'bg-green-50' },
    { label: 'Cerrados', value: stats?.cerrados || 0, icon: <XCircle className="text-gray-600" />, bg: 'bg-gray-50' },
    { label: 'SLA vencidos', value: stats?.vencidos || 0, icon: <AlertTriangle className="text-red-600" />, bg: 'bg-red-50' },
  ]

  const chartData = [
    { name: 'Nuevos', value: stats?.nuevos || 0 },
    { name: 'En atención', value: stats?.enAtencion || 0 },
    { name: 'Resueltos', value: stats?.resueltos || 0 },
    { name: 'Cerrados', value: stats?.cerrados || 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard de soporte</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`card p-4 flex items-center gap-3 ${s.bg}`}>
            <div className="p-2 bg-white rounded-lg shadow-sm">{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Tickets por estatus</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#4a7c23" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Distribución</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
