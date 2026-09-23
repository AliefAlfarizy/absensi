import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/students': 'Data Murid',
  '/sessions': 'Sesi Pembelajaran',
  '/materials': 'Materi Pembelajaran',
  '/progress': 'Perkembangan Murid',
  '/reports': 'Laporan',
  '/settings': 'Pengaturan',
}

export function Header({ onMenuClick }) {
  const location = useLocation()

  // Match exact or starts with (for nested routes like /students/:id)
  let title = 'Dashboard'
  for (const [path, label] of Object.entries(PAGE_TITLES)) {
    if (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)) {
      title = label
      // Check for detail page
      if (location.pathname.startsWith('/students/') && location.pathname !== '/students') {
        title = 'Detail Murid'
      }
      break
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">G</span>
        </div>
      </div>
    </header>
  )
}

export default Header
