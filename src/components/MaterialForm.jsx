import { useState, useEffect, useRef } from 'react'
import { AlertCircle, Upload, X, FileText } from 'lucide-react'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants'

export function MaterialForm({ initial = null, onSubmit, loading = false, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '' })
  const [errors, setErrors] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    if (initial) {
      setForm({ title: initial.title || '', description: initial.description || '' })
    } else {
      setForm({ title: '', description: '' })
    }
    setErrors({})
    setSelectedFile(null)
    setFileError('')
  }, [initial])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError('Tipe file tidak didukung. Gunakan PDF, Word, PPT, Excel, atau gambar.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Ukuran file melebihi batas 10MB.')
      return
    }
    setSelectedFile(file)
    setFileError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Judul materi wajib diisi.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form, selectedFile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Judul Materi <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => {
            setForm(p => ({ ...p, title: e.target.value }))
            if (errors.title) setErrors(p => ({ ...p, title: null }))
          }}
          placeholder="Contoh: Matematika — Pecahan"
          className={`input-field ${errors.title ? 'input-error' : ''}`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
      </div>

      <div>
        <label className="label">Deskripsi</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Deskripsi singkat materi (opsional)"
          rows={2}
          className="input-field resize-none"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="label">File Materi (Opsional)</label>
        {selectedFile ? (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-blue-700 flex-1 truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => { setSelectedFile(null); fileRef.current.value = '' }}
              className="text-blue-400 hover:text-blue-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          >
            <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Klik untuk upload file</p>
            <p className="text-xs text-gray-300 mt-0.5">PDF, Word, PPT, Excel, JPG, PNG • Maks 10MB</p>
          </div>
        )}
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
          className="hidden"
        />
        {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
      </div>

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">
            Batal
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Menyimpan...' : initial ? 'Simpan' : 'Tambah Materi'}
        </button>
      </div>
    </form>
  )
}

export default MaterialForm
