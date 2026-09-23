import { SESSION_STATUS_COLORS, SESSION_STATUS_LABELS } from '../utils/constants'

export function StatusBadge({ status, size = 'sm' }) {
  const colorClass = SESSION_STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
  const label = SESSION_STATUS_LABELS[status] || status

  const sizeClass = size === 'xs'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  )
}

export default StatusBadge
