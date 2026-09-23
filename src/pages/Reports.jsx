import { useState, useEffect, useMemo } from 'react'
import { Download, FileText, FileSpreadsheet, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStudents } from '../hooks/useStudents'
import { useGlobalToast } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { SkeletonTable } from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import { formatDateShort, formatTimeRange } from '../utils/formatDate'
import { CLASS_OPTIONS, SESSION_STATUS_LABELS } from '../utils/constants'
import { exportReportExcel } from '../lib/exportExcel'
import { exportReportCSV } from '../lib/exportCSV'
import { exportReportPDF } from '../lib/exportPDF'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STATUS_COLORS = {
  hadir: '#22c55e', sakit: '#eab308', izin: '#3b82f6',
  alpa: '#ef4444', reschedule: '#f97316', selesai: '#9ca3af', pengganti: '#a855f7',
}

export default function Reports() {
  const toast = useGlobalToast()
  const { students } = useStudents()

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(firstOfMonth)
  const [dateTo, setDateTo] = useState(todayStr)
  const [filterStudent, setFilterStudent] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterClass, setFilterClass] = useState('')

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          students (id, name, class, whatsapp, parent_name),
          learning_materials (id, title)
        `)
        .order('session_date', { ascending: false })

      if (dateFrom) query = query.gte('session_date', dateFrom)
      if (dateTo) query = query.lte('session_date', dateTo)
      if (filterStudent) query = query.eq('student_id', filterStudent)
      if (filterStatus) query = query.eq('status', filterStatus)

      const { data, error } = await query
      if (error) throw error

      let result = data || []
      if (filterClass) {
        result = result.filter(s => s.students?.class === filterClass)
      }
      setSessions(result)
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data laporan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport() }, [dateFrom, dateTo, filterStudent, filterStatus, filterClass])

  // Summary
  const summary = useMemo(() => {
    const s = { total: sessions.length, hadir: 0, sakit: 0, izin: 0, alpa: 0, reschedule: 0, selesai: 0, pengganti: 0 }
    sessions.forEach(session => { s[session.status] = (s[session.status] || 0) + 1 })
    return s
  }, [sessions])

  // Chart: per-student attendance
  const studentChart = useMemo(() => {
    const byStudent = {}
    sessions.forEach(s => {
      if (!s.students) return
      const name = s.students.name
      if (!byStudent[name]) byStudent[name] = { name, total: 0, hadir: 0 }
      byStudent[name].total++
      if (['hadir', 'selesai', 'pengganti'].includes(s.status)) byStudent[name].hadir++
    })
    return Object.values(byStudent)
      .map(d => ({ ...d, rate: d.total > 0 ? Math.round(d.hadir / d.total * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 12)
  }, [sessions])

  const handleExport = async (format) => {
    if (sessions.length === 0) { toast.error('Tidak ada data untuk diekspor.'); return }
    setExporting(format)
    try {
      const params = {
        sessions,
        dateFrom,
        dateTo,
        filterLabel: filterStudent ? students.find(s => s.id === filterStudent)?.name || 'Dipilih' : 'Semua Murid',
      }
      if (format === 'excel') exportReportExcel(params)
      else if (format === 'csv') exportReportCSV(params)
      else if (format === 'pdf') exportReportPDF(params)
      toast.success(`Export ${format.toUpperCase()} berhasil`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal mengexport data.')
    }
    setExporting('')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sessions.length} sesi ditemukan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('excel')} disabled={!!exporting} className="btn-secondary text-sm">
            <FileSpreadsheet className="w-4 h-4" />
            {exporting === 'excel' ? 'Mengexport...' : 'Excel'}
          </button>
          <button onClick={() => handleExport('csv')} disabled={!!exporting} className="btn-secondary text-sm">
            <FileText className="w-4 h-4" />
            {exporting === 'csv' ? 'Mengexport...' : 'CSV'}
          </button>
          <button onClick={() => handleExport('pdf')} disabled={!!exporting} className="btn-primary text-sm">
            <Download className="w-4 h-4" />
            {exporting === 'pdf' ? 'Mengexport...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Periode:</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field w-40" />
            <span className="text-gray-400">–</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field w-40" />
          </div>
          <select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} className="input-field w-full sm:w-48">
            <option value="">Semua Murid</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="input-field w-full sm:w-44">
            <option value="">Semua Kelas</option>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-full sm:w-40">
            <option value="">Semua Status</option>
            {Object.entries(SESSION_STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: summary.total, color: 'bg-gray-50 text-gray-800' },
          { label: 'Hadir', value: (summary.hadir || 0) + (summary.selesai || 0) + (summary.pengganti || 0), color: 'bg-green-50 text-green-700' },
          { label: 'Sakit', value: summary.sakit || 0, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Izin', value: summary.izin || 0, color: 'bg-blue-50 text-blue-700' },
          { label: 'Alpa', value: summary.alpa || 0, color: 'bg-red-50 text-red-700' },
          { label: 'Reschedule', value: summary.reschedule || 0, color: 'bg-orange-50 text-orange-700' },
          { label: 'Pengganti', value: summary.pengganti || 0, color: 'bg-purple-50 text-purple-700' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl p-3 text-center ${item.color}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs mt-0.5 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {studentChart.length > 0 && (
        <div className="card p-5">
          <p className="section-title mb-4">Tingkat Kehadiran per Murid (Periode Ini)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studentChart} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={40} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Kehadiran']} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="section-title">Tabel Laporan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Murid</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Kelas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Waktu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Materi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={6} cols={7} />
              ) : sessions.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState title="Tidak ada data pada periode ini" description="Ubah filter untuk melihat data lain." />
                </td></tr>
              ) : (
                sessions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{s.students?.name || '-'}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.students?.class}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDateShort(s.session_date)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {formatTimeRange(s.start_time, s.end_time)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {s.learning_materials?.length > 0
                        ? <span className="text-xs text-gray-600">{s.learning_materials.map(m => m.title).join(', ')}</span>
                        : <span className="text-xs text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{s.notes || '-'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
