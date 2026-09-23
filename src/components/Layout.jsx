import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from './Toast'
import { useToast } from '../hooks/useToast'

// Context untuk toast agar bisa diakses dari halaman manapun
import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

export function useGlobalToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useGlobalToast must be used inside Layout')
  return ctx
}

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts, toast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={toast}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ToastContext.Provider>
  )
}

export default Layout
