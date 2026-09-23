import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { SESSION_STATUS, SESSION_STATUS_LABELS } from '../utils/constants'

const INITIAL_FORM = {
  student_id: '',
  session_date: '',
  start_time: '',
  end_time: '',
  status: 'hadir',
  notes: '',
}

const STATUS_OPTIONS = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'izin', label: 'Izin' },
  { value: 'alpa', label: 'Alpa' },
  { value: 'reschedule', label: 'Reschedule' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'pengganti', label: 'Pengganti' },
]

export function SessionForm({ initial = null, students = [], onSubmit, loading = false, hideStudentSelect = false }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        student_id: initial.student_id || '',
        session_date: initial.session_date || '',
        start_time: initial.start_time?.substring(0, 5) || '',
        end_time: initial.end_time?.substring(0, 5) || '',
        status: initial.status || 'hadir',
        notes: initial.notes || '',
      })
    } else {
      setForm(INITIAL_FORM)
    }
    setErrors({})
  }, [initial])

  const validate = () => {
    const errs = {}
    if (!hideStudentSelect && !form.student_id) errs.student_id = 'Pilih murid.'
    if (!form.session_date) errs.session_date = 'Tanggal wajib diisi.'
    if (!form.start_time) errs.start_time = 'Jam mulai wajib diisi.'
    if (!form.end_time) errs.end_time = 'Jam selesai wajib diisi.'
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      errs.end_time = 'Jam selesai harus setelah jam mulai.'
    }
    if (!form.status) errs.status = 'Status wajib dipilih.'
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
      {/* Murid */}
      {!hideStudentSelect && (
        <div>
          <label className="label">Murid <span className="text-red-500">*</span></label>
          <select
            value={form.student_id}
            onChange={handleChange('student_id')}
            className={`input-field ${errors.student_id ? 'input-error' : ''}`}
          >
            <option value="">Pilih murid</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.class}</option>
            ))}
          </select>
          {errors.student_id && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.student_id}</p>}
        </div>
      )}

      {/* Tanggal */}
      <div>
        <label className="label">Tanggal <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={form.session_date}
          onChange={handleChange('session_date')}
          className={`input-field ${errors.session_date ? 'input-error' : ''}`}
        />
        {errors.session_date && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.session_date}</p>}
      </div>

      {/* Jam */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Jam Mulai <span className="text-red-500">*</span></label>
          <input
            type="time"
            value={form.start_time}
            onChange={handleChange('start_time')}
            className={`input-field ${errors.start_time ? 'input-error' : ''}`}
          />
          {errors.start_time && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.start_time}</p>}
        </div>
        <div>
          <label className="label">Jam Selesai <span className="text-red-500">*</span></label>
          <input
            type="time"
            value={form.end_time}
            onChange={handleChange('end_time')}
            className={`input-field ${errors.end_time ? 'input-error' : ''}`}
          />
          {errors.end_time && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.end_time}</p>}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="label">Status <span className="text-red-500">*</span></label>
        <select
          value={form.status}
          onChange={handleChange('status')}
          className={`input-field ${errors.status ? 'input-error' : ''}`}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
      </div>

      {/* Catatan */}
      <div>
        <label className="label">Catatan</label>
        <textarea
          value={form.notes}
          onChange={handleChange('notes')}
          placeholder="Catatan pembelajaran (opsional)"
          rows={3}
          className="input-field resize-none"
        />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (
            initial ? 'Simpan Perubahan' : 'Simpan Sesi'
          )}
        </button>
      </div>
    </form>
  )
}

export default SessionForm
