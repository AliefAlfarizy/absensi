import { useState, useEffect } from 'react'
import { User, Phone, Users, School, AlertCircle } from 'lucide-react'
import { CLASS_OPTIONS } from '../utils/constants'
import { isValidWhatsApp } from '../utils/formatPhone'

const INITIAL_FORM = {
  name: '',
  parent_name: '',
  whatsapp: '',
  class: '',
  status: 'active',
}

export function StudentForm({ initial = null, onSubmit, loading = false }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        parent_name: initial.parent_name || '',
        whatsapp: initial.whatsapp || '',
        class: initial.class || '',
        status: initial.status || 'active',
      })
    } else {
      setForm(INITIAL_FORM)
    }
    setErrors({})
  }, [initial])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi.'
    if (!form.parent_name.trim()) errs.parent_name = 'Nama orang tua wajib diisi.'
    if (!form.whatsapp.trim()) {
      errs.whatsapp = 'Nomor WhatsApp wajib diisi.'
    } else if (!isValidWhatsApp(form.whatsapp)) {
      errs.whatsapp = 'Nomor WhatsApp tidak valid (10–13 digit).'
    }
    if (!form.class) errs.class = 'Kelas wajib dipilih.'
    return errs
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Lengkap */}
      <div>
        <label className="label">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Masukkan nama lengkap murid"
            className={`input-field pl-9 ${errors.name ? 'input-error' : ''}`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.name}
          </p>
        )}
      </div>

      {/* Nama Orang Tua */}
      <div>
        <label className="label">
          Nama Orang Tua <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={form.parent_name}
            onChange={handleChange('parent_name')}
            placeholder="Masukkan nama orang tua / wali"
            className={`input-field pl-9 ${errors.parent_name ? 'input-error' : ''}`}
          />
        </div>
        {errors.parent_name && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.parent_name}
          </p>
        )}
      </div>

      {/* No. WhatsApp */}
      <div>
        <label className="label">
          Nomor WhatsApp <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            value={form.whatsapp}
            onChange={handleChange('whatsapp')}
            placeholder="08xx-xxxx-xxxx"
            className={`input-field pl-9 ${errors.whatsapp ? 'input-error' : ''}`}
          />
        </div>
        {errors.whatsapp && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.whatsapp}
          </p>
        )}
      </div>

      {/* Kelas */}
      <div>
        <label className="label">
          Kelas <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <School className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <select
            value={form.class}
            onChange={handleChange('class')}
            className={`input-field pl-9 ${errors.class ? 'input-error' : ''}`}
          >
            <option value="">Pilih kelas</option>
            {CLASS_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {errors.class && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.class}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="label">Status</label>
        <div className="flex gap-3">
          {[
            { value: 'active', label: 'Aktif' },
            { value: 'inactive', label: 'Nonaktif' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={form.status === opt.value}
                onChange={handleChange('status')}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (
            initial ? 'Simpan Perubahan' : 'Simpan Murid'
          )}
        </button>
      </div>
    </form>
  )
}

export default StudentForm
