import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}) {
  const confirmStyles = {
    danger: 'btn-danger',
    warning: 'inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors',
    primary: 'btn-primary',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
          {message && (
            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
          )}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 btn-secondary justify-center"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 justify-center ${confirmStyles[variant]}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
