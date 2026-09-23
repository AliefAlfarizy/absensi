import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function StatCard({ title, value, icon: Icon, color = 'blue', trend, trendLabel, subtitle }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      value: 'text-blue-700',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      value: 'text-green-700',
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      value: 'text-yellow-700',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      value: 'text-red-700',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      value: 'text-purple-700',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      value: 'text-orange-700',
    },
  }

  const c = colorClasses[color] || colorClasses.blue

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className={`text-3xl font-bold ${c.value} mt-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trendLabel && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{trendLabel}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0 ml-3`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
