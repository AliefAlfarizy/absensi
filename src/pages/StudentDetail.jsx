import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, User, Phone, Users, School, Calendar, Edit2,
  BookOpen, TrendingUp, BarChart3, MessageCircle, FileText,
  Plus, Trash2, Edit
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useGlobalToast } from '../components/Layout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import StudentForm from '../components/StudentForm'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { SkeletonLine } from '../components/SkeletonLoader'
import { formatDate, formatDateShort, formatTimeRange } from '../utils/formatDate'
import { formatPhoneDisplay, getWhatsAppUrl } from '../utils/formatPhone'
import { SESSION_STATUS_LABELS, PROGRESS_CATEGORIES, CHART_COLORS } from '../utils/constants'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { useStudents } from '../hooks/useStudents'
import { exportStudentPDF } from '../lib/exportPDF'
import { exportStudentExcel } from '../lib/exportExcel'
import { exportStudentCSV } from '../lib/exportCSV'

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'attendance', label: 'Riwayat Absensi', icon: Calendar },
  { id: 'progress', label: 'Perkembangan', icon: TrendingUp },
  { id: 'stats', label: 'Statistik', icon: BarChart3 },
]

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useGlobalToast()
  const { updateStudent } = useStudents()

  const [student, setStudent] = useState(null)
  const [sessions, setSessions] = useState([])
  const [progressList, setProgressList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [studentRes, sessionsRes, progressRes] = await Promise.all([
        supabase.from('students').select('*').eq('id', id).single(),
        supabase.from('sessions')
          .select('*, learning_materials(*)')
          .eq('student_id', id)
          .order('session_date', { ascending: false }),
        supabase.from('student_progress')
          .select('*')
          .eq('student_id', id)
          .order('date', { ascending: false }),
      ])

      if (studentRes.error) throw studentRes.error
      setStudent(studentRes.data)
      setSessions(sessionsRes.data || [])
      setProgressList(progressRes.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data murid.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (formData) => {
    setSaving(true)
    const { error } = await updateStudent(id, formData)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Data murid berhasil diperbarui')
      setEditModalOpen(false)
      fetchAll()
    }
    setSaving(false)
  }

  // Hitung statistik
  const stats = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    acc.total = (acc.total || 0) + 1
    return acc
  }, { total: 0 })

  const attendanceRate = stats.total > 0
    ? Math.round(((stats.hadir || 0) + (stats.selesai || 0) + (stats.pengganti || 0)) / stats.total * 100)
    : 0

  const chartData = [
    { name: 'Hadir', value: (stats.hadir || 0) + (stats.selesai || 0) + (stats.pengganti || 0), color: CHART_COLORS.hadir },
    { name: 'Sakit', value: stats.sakit || 0, color: CHART_COLORS.sakit },
    { name: 'Izin', value: stats.izin || 0, color: CHART_COLORS.izin },
    { name: 'Alpa', value: stats.alpa || 0, color: CHART_COLORS.alpa },
    { name: 'Reschedule', value: stats.reschedule || 0, color: CHART_COLORS.reschedule },
  ].filter(d => d.value > 0)

  if (loading) {
    return (
      <div className="space-y-5">
        <SkeletonLine className="h-8 w-48" />
        <div className="card p-6 space-y-3">
          <SkeletonLine className="h-6 w-64" />
          <SkeletonLine className="h-4 w-48" />
          <SkeletonLine className="h-4 w-56" />
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <EmptyState
        title="Murid tidak ditemukan"
        description="Data murid yang Anda cari tidak tersedia."
        action={() => navigate('/students')}
        actionLabel="Kembali ke Data Murid"
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setExportModalOpen(true)}
            className="btn-secondary text-sm"
          >
            <FileText className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="btn-primary text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Student Card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {student.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-gray-400" />
                {student.class}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                {student.parent_name}
              </div>
              <a
                href={getWhatsAppUrl(student.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-700"
              >
                <MessageCircle className="w-4 h-4" />
                {formatPhoneDisplay(student.whatsapp)}
              </a>
            </div>
          </div>
          {/* Quick stats */}
          <div className="hidden md:flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-400">Total Sesi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{attendanceRate}%</p>
              <p className="text-xs text-gray-400">Kehadiran</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Tab: Profil */}
          {activeTab === 'profile' && (
            <div className="max-w-lg space-y-4">
              {[
                { label: 'Nama Lengkap', value: student.name },
                { label: 'Nama Orang Tua', value: student.parent_name },
                { label: 'Kelas', value: student.class },
                { label: 'Nomor WhatsApp', value: formatPhoneDisplay(student.whatsapp) },
                { label: 'Status', value: student.status === 'active' ? 'Aktif' : 'Nonaktif' },
                { label: 'Terdaftar Sejak', value: formatDate(student.created_at) },
                { label: 'Terakhir Diperbarui', value: formatDate(student.updated_at) },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <p className="text-sm text-gray-400 w-40 flex-shrink-0">{item.label}</p>
                  <p className="text-sm text-gray-800 font-medium">{item.value || '-'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Riwayat Absensi */}
          {activeTab === 'attendance' && (
            <div>
              {sessions.length === 0 ? (
                <EmptyState
                  title="Belum ada riwayat sesi"
                  description="Sesi pembelajaran akan muncul di sini."
                  action={() => navigate('/sessions')}
                  actionLabel="+ Tambah Sesi"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Tanggal</th>
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Waktu</th>
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Status</th>
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 hidden md:table-cell">Materi</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500 hidden lg:table-cell">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sessions.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 pr-4 text-gray-700">{formatDateShort(s.session_date)}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{formatTimeRange(s.start_time, s.end_time)}</td>
                          <td className="py-2.5 pr-4"><StatusBadge status={s.status} /></td>
                          <td className="py-2.5 pr-4 hidden md:table-cell">
                            {s.learning_materials?.length > 0 ? (
                              <ul className="space-y-0.5">
                                {s.learning_materials.map(m => (
                                  <li key={m.id} className="text-xs text-gray-600">{m.title}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 hidden lg:table-cell">
                            <span className="text-xs text-gray-500 line-clamp-2">{s.notes || '-'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Perkembangan */}
          {activeTab === 'progress' && (
            <div className="space-y-3">
              {progressList.length === 0 ? (
                <EmptyState
                  title="Belum ada catatan perkembangan"
                  description="Catatan perkembangan murid akan muncul di sini."
                  action={() => navigate('/progress')}
                  actionLabel="+ Tambah Perkembangan"
                />
              ) : (
                progressList.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            {PROGRESS_CATEGORIES.find(c => c.value === p.category)?.label || p.category}
                          </span>
                          <span className="text-xs text-gray-400">{formatDateShort(p.date)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{p.title}</p>
                        {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                        {p.progress_percentage != null && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${p.progress_percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-blue-600">{p.progress_percentage}%</span>
                            </div>
                          </div>
                        )}
                        {p.teacher_notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">Catatan: {p.teacher_notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Statistik */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Sesi', value: stats.total, color: 'text-gray-800' },
                  { label: 'Hadir', value: (stats.hadir || 0) + (stats.selesai || 0) + (stats.pengganti || 0), color: 'text-green-600' },
                  { label: 'Tidak Hadir', value: (stats.sakit || 0) + (stats.izin || 0) + (stats.alpa || 0), color: 'text-red-600' },
                  { label: 'Tingkat Kehadiran', value: `${attendanceRate}%`, color: attendanceRate >= 75 ? 'text-green-600' : 'text-red-600' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chartData.length > 0 ? (
                  <>
                    <div>
                      <p className="section-title mb-3">Rincian Status</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barSize={32}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="section-title mb-3">Proporsi Kehadiran</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >
                            {chartData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <EmptyState title="Belum ada data sesi" description="Statistik akan tampil setelah ada sesi." />
                  </div>
                )}
              </div>

              {/* Per-status detail */}
              <div>
                <p className="section-title mb-3">Detail Kehadiran</p>
                <div className="space-y-2">
                  {[
                    { label: 'Hadir / Selesai / Pengganti', value: (stats.hadir || 0) + (stats.selesai || 0) + (stats.pengganti || 0), color: 'bg-green-500' },
                    { label: 'Sakit', value: stats.sakit || 0, color: 'bg-yellow-500' },
                    { label: 'Izin', value: stats.izin || 0, color: 'bg-blue-400' },
                    { label: 'Alpa', value: stats.alpa || 0, color: 'bg-red-500' },
                    { label: 'Reschedule', value: stats.reschedule || 0, color: 'bg-orange-400' },
                  ].map(item => (
                    stats.total > 0 && (
                      <div key={item.label} className="flex items-center gap-3">
                        <p className="text-sm text-gray-600 w-48">{item.label}</p>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all`}
                            style={{ width: `${(item.value / stats.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs font-medium text-gray-700 w-16 text-right">
                          {item.value} ({Math.round(item.value / stats.total * 100)}%)
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Murid">
        <StudentForm initial={student} onSubmit={handleEdit} loading={saving} />
      </Modal>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        student={student}
        sessions={sessions}
        progressList={progressList}
        toast={toast}
      />
    </div>
  )
}

function ExportModal({ isOpen, onClose, student, sessions, progressList, toast }) {
  const [selected, setSelected] = useState({ profile: true, attendance: true, materials: true, progress: true })
  const [format, setFormat] = useState('excel')
  const [loading, setLoading] = useState(false)

  const toggle = (key) => setSelected(prev => ({ ...prev, [key]: !prev[key] }))

  const handleExport = async () => {
    setLoading(true)
    try {
      if (format === 'excel') {
        exportStudentExcel(student, sessions, progressList, selected)
        toast.success('Export Excel berhasil')
      } else if (format === 'pdf') {
        exportStudentPDF(student, sessions, progressList, selected)
        toast.success('Export PDF berhasil')
      } else {
        exportStudentCSV(student, sessions, progressList, selected)
        toast.success('Export CSV berhasil')
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Gagal mengexport data.')
    }
    setLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data Murid" size="sm">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Data yang diekspor:</p>
          <div className="space-y-2">
            {[
              { key: 'profile', label: 'Profil Murid' },
              { key: 'attendance', label: 'Riwayat Absensi' },
              { key: 'materials', label: 'Materi Pembelajaran' },
              { key: 'progress', label: 'Catatan Perkembangan' },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected[item.key]}
                  onChange={() => toggle(item.key)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Format:</p>
          <div className="space-y-2">
            {[
              { value: 'excel', label: 'Excel (.xlsx)' },
              { value: 'pdf', label: 'PDF (.pdf)' },
              { value: 'csv', label: 'CSV (.csv)' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={opt.value}
                  checked={format === opt.value}
                  onChange={() => setFormat(opt.value)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || !Object.values(selected).some(Boolean)}
          className="btn-primary w-full justify-center"
        >
          {loading ? 'Mengexport...' : 'Export'}
        </button>
      </div>
    </Modal>
  )
}
