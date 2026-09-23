import { useState } from 'react'
import { AlertCircle, Calendar } from 'lucide-react'
import { formatDateShort, formatTimeRange } from '../utils/formatDate'
import StatusBadge from './StatusBadge'

export function RescheduleForm({ session, onSubmit, loading = false }) {
  const [form, setForm] = useState({
    session_date: '',
    start_time: '',
    end_time: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.session_date) errs.session_date = 'Tanggal pengganti wajib diisi.'
    if (!form.start_time) errs.start_time = 'Jam mulai wajib diisi.'
    if (!form.end_time) errs.end_time = 'Jam selesai wajib diisi.'
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      errs.end_time = 'Jam selesai harus setelah jam mulai.'
    }
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
    onSubmit({
      student_id: session.student_id,
      ...form,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info sesi asal */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Sesi Asal</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex gap-3">
            <span className="text-gray-500 w-28">Murid</span>
            <span className="font-medium text-gray-800">{session?.students?.name || '-'}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-28">Tanggal</span>
            <span className="text-gray-800">{formatDateShort(session?.session_date)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-28">Waktu</span>
            <span className="text-gray-800">{formatTimeRange(session?.start_time, session?.end_time)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-28">Status</span>
            <StatusBadge status={session?.status} />
          </div>
        </div>
      </div>

      {/* Form jadwal pengganti */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Jadwal Pengganti</p>

        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Jam Mulai <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={form.start_time}
                onChange={handleChange('start_time')}
                className={`input-field ${errors.start_time ? 'input-error' : ''}`}
              />
              {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>}
            </div>
            <div>
              <label className="label">Jam Selesai <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={form.end_time}
                onChange={handleChange('end_time')}
                className={`input-field ${errors.end_time ? 'input-error' : ''}`}
              />
              {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time}</p>}
            </div>
          </div>

          <div>
            <label className="label">Catatan</label>
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Catatan sesi pengganti (opsional)"
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? 'Menyimpan...' : 'Simpan Sesi Pengganti'}
      </button>
    </form>
  )
}

export default RescheduleForm
