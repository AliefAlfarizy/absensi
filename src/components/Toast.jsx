import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const TOAST_STYLES = {
  success: {
    container: 'bg-white border-l-4 border-green-500',
    icon: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
  },
  error: {
    container: 'bg-white border-l-4 border-red-500',
    icon: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  },
  warning: {
    container: 'bg-white border-l-4 border-yellow-500',
    icon: <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
  },
  info: {
    container: 'bg-white border-l-4 border-blue-500',
    icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  },
}

function Toast({ id, message, type = 'success', onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const style = TOAST_STYLES[type] || TOAST_STYLES.success

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm w-full
        ${style.container}
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {style.icon}
      <p className="text-sm text-gray-800 flex-1">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}

export default Toast
