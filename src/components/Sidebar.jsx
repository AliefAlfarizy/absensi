import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  BookOpen,
  TrendingUp,
  BarChart3,
  Settings,
  GraduationCap as BrandIcon,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Data Murid', icon: GraduationCap },
  { to: '/sessions', label: 'Sesi Pembelajaran', icon: CalendarDays },
  { to: '/materials', label: 'Materi Pembelajaran', icon: BookOpen },
  { to: '/progress', label: 'Perkembangan Murid', icon: TrendingUp },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
]

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon className="w-4.5 h-4.5 flex-shrink-0 w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BrandIcon className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Bimbel</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Management System</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.to}
              {...item}
              onClick={onMobileClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">v1.0.0 • Bimbel MS</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
