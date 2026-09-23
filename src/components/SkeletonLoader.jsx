export function SkeletonLine({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div className="w-11 h-11 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </>
  )
}

export function SkeletonForm({ fields = 4 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-3.5 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
      ))}
    </div>
  )
}

export default SkeletonCard
