export default function StatusBadge({ status, color }) {
  const colorMap = {
    '#3B82F6': 'bg-blue-100 text-blue-700',
    '#8B5CF6': 'bg-purple-100 text-purple-700',
    '#F59E0B': 'bg-amber-100 text-amber-700',
    '#F97316': 'bg-orange-100 text-orange-700',
    '#6B7280': 'bg-gray-100 text-gray-600',
    '#10B981': 'bg-emerald-100 text-emerald-700',
    '#EF4444': 'bg-red-100 text-red-700',
    '#DC2626': 'bg-red-100 text-red-800',
  }
  const cls = color && colorMap[color] ? colorMap[color] : 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
