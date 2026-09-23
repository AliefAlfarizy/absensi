import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { PROGRESS_CATEGORIES } from '../utils/constants'

const INITIAL = {
  student_id: '',
  date: '',
  category: 'akademik',
  title: '',
  description: '',
  progress_percentage: '',
  teacher_notes: '',
}

export function ProgressForm({ initial = null, students = [], onSubmit, loading = false }) {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        student_id: initial.student_id || '',
        date: initial.date || '',
        category: initial.category || 'akademik',
        title: initial.title || '',
        description: initial.description || '',
        progress_percentage: initial.progress_percentage ?? '',
        teacher_notes: initial.teacher_notes || '',
      })
    } else {
      setForm(INITIAL)
    }
    setErrors({})
  }, [initial])

  const validate = () => {
    const errs = {}
    if (!form.student_id) errs.student_id = 'Pilih murid.'
    if (!form.date) errs.date = 'Tanggal wajib diisi.'
    if (!form.title.trim()) errs.title = 'Judul wajib diisi.'
    if (form.progress_percentage !== '' && (isNaN(form.progress_percentage) || form.progress_percentage < 0 || form.progress_percentage > 100)) {
      errs.progress_percentage = 'Progress harus antara 0–100.'
    }
    return errs
  }

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSubmit({
      ...form,
      progress_percentage: form.progress_percentage !== '' ? parseInt(form.progress_percentage) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Murid <span className="text-red-500">*</span></label>
        <select value={form.student_id} onChange={set('student_id')} className={`input-field ${errors.student_id ? 'input-error' : ''}`}>
          <option value="">Pilih murid</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.class}</option>)}
        </select>
        {errors.student_id && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.student_id}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tanggal <span className="text-red-500">*</span></label>
          <input type="date" value={form.date} onChange={set('date')} className={`input-field ${errors.date ? 'input-error' : ''}`} />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>
        <div>
          <label className="label">Kategori</label>
          <select value={form.category} onChange={set('category')} className="input-field">
            {PROGRESS_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Judul <span className="text-red-500">*</span></label>
        <input type="text" value={form.title} onChange={set('title')} placeholder="Judul perkembangan" className={`input-field ${errors.title ? 'input-error' : ''}`} />
        {errors.title && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
      </div>

      <div>
        <label className="label">Deskripsi</label>
        <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Deskripsi perkembangan murid" className="input-field resize-none" />
      </div>

      <div>
        <label className="label">Progress (%)</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={100}
            value={form.progress_percentage}
            onChange={set('progress_percentage')}
            placeholder="0–100"
            className={`input-field w-32 ${errors.progress_percentage ? 'input-error' : ''}`}
          />
          {form.progress_percentage !== '' && !isNaN(form.progress_percentage) && (
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, form.progress_percentage))}%` }}
              />
            </div>
          )}
        </div>
        {errors.progress_percentage && <p className="mt-1 text-xs text-red-500">{errors.progress_percentage}</p>}
      </div>

      <div>
        <label className="label">Catatan Guru</label>
        <textarea value={form.teacher_notes} onChange={set('teacher_notes')} rows={2} placeholder="Catatan tambahan dari guru (opsional)" className="input-field resize-none" />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Simpan Perkembangan'}
        </button>
      </div>
    </form>
  )
}

export default ProgressForm
