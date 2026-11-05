export default function PriorityBadge({ priority }) {
  const map = {
    'Baja':    'bg-gray-100 text-gray-600',
    'Media':   'bg-amber-100 text-amber-700',
    'Alta':    'bg-red-100 text-red-700',
    'Crítica': 'bg-purple-100 text-purple-800',
  }
  if (!priority) return null
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[priority] || 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  )
}
