import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, CalendarDays, CheckCircle, RefreshCw,
  Plus, ArrowRight, MessageCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useGlobalToast } from '../components/Layout'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import SessionForm from '../components/SessionForm'
import StudentForm from '../components/StudentForm'
import RescheduleForm from '../components/RescheduleForm'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/SkeletonLoader'
import { formatDateShort, formatTimeRange } from '../utils/formatDate'
import { getWhatsAppUrl } from '../utils/formatPhone'
import { CHART_COLORS } from '../utils/constants'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts'
import { useStudents } from '../hooks/useStudents'
import { useSessions } from '../hooks/useSessions'

export default function Dashboard() {
  const navigate = useNavigate()
  const toast = useGlobalToast()

  const [stats, setStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [needReschedule, setNeedReschedule] = useState([])
  const [attendanceByStudent, setAttendanceByStudent] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters for chart
  const [chartPeriod, setChartPeriod] = useState('all') // 'all','month','week'
  const [selectedStudentChart, setSelectedStudentChart] = useState('')

  // Modals
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const { students } = useStudents()
  const { addSession, rescheduleSession } = useSessions()
  const { addStudent } = useStudents()

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [studentsRes, sessionsRes, todaySessionsRes] = await Promise.all([
        supabase.from('students').select('id, status'),
        supabase.from('sessions')
          .select('id, student_id, status, session_date, students(id, name, class)')
          .order('session_date', { ascending: false }),
        supabase.from('sessions')
          .select('id, status, student_id')
          .eq('session_date', today),
      ])

      const allStudents = studentsRes.data || []
      const allSessions = sessionsRes.data || []
      const todaySessions = todaySessionsRes.data || []

      // Stats
      setStats({
        totalStudents: allStudents.filter(s => s.status === 'active').length,
        todaySessions: todaySessions.length,
        todayPresent: todaySessions.filter(s => ['hadir', 'selesai', 'pengganti'].includes(s.status)).length,
        needReschedule: allSessions.filter(s => ['sakit', 'izin', 'alpa'].includes(s.status)).length,
      })

      // Recent sessions (last 8)
      const recent = await supabase
        .from('sessions')
        .select('*, students(id, name, class), learning_materials(id, title)')
        .order('session_date', { ascending: false })
        .order('start_time', { ascending: false })
        .limit(8)
      setRecentSessions(recent.data || [])

      // Sessions needing reschedule
      const needRes = await supabase
        .from('sessions')
        .select('*, students(id, name, class, whatsapp)')
        .in('status', ['sakit', 'izin', 'alpa'])
        .order('session_date', { ascending: false })
        .limit(5)
      setNeedReschedule(needRes.data || [])

      // Attendance by student
      const byStudent = {}
      allSessions.forEach(s => {
        if (!s.students) return
        const name = s.students.name
        if (!byStudent[name]) byStudent[name] = { name, total: 0, hadir: 0 }
        byStudent[name].total++
        if (['hadir', 'selesai', 'pengganti'].includes(s.status)) byStudent[name].hadir++
      })
      const studentChartData = Object.values(byStudent)
        .map(d => ({ ...d, rate: d.total > 0 ? Math.round(d.hadir / d.total * 100) : 0 }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 10)
      setAttendanceByStudent(studentChartData)

    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (data) => {
    setSaving(true)
    const { error } = await addStudent(data)
    if (error) toast.error(error)
    else { toast.success('Murid berhasil ditambahkan'); setAddStudentOpen(false); fetchDashboardData() }
    setSaving(false)
  }

  const handleAddSession = async (data) => {
    setSaving(true)
    const { error } = await addSession(data)
    if (error) toast.error(error)
    else { toast.success('Sesi berhasil ditambahkan'); setAddSessionOpen(false); fetchDashboardData() }
    setSaving(false)
  }

  const handleReschedule = async (data) => {
    setSaving(true)
    const { error } = await rescheduleSession(rescheduleTarget.id, data)
    if (error) toast.error(error)
    else { toast.success('Sesi pengganti berhasil dijadwalkan'); setRescheduleTarget(null); fetchDashboardData() }
    setSaving(false)
  }

  // Global status distribution
  const statusData = [
    { name: 'Hadir', value: recentSessions.filter(s => ['hadir', 'selesai', 'pengganti'].includes(s.status)).length, color: CHART_COLORS.hadir },
    { name: 'Sakit', value: recentSessions.filter(s => s.status === 'sakit').length, color: CHART_COLORS.sakit },
    { name: 'Izin', value: recentSessions.filter(s => s.status === 'izin').length, color: CHART_COLORS.izin },
    { name: 'Alpa', value: recentSessions.filter(s => s.status === 'alpa').length, color: CHART_COLORS.alpa },
    { name: 'Reschedule', value: recentSessions.filter(s => s.status === 'reschedule').length, color: CHART_COLORS.reschedule },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setAddStudentOpen(true)} className="btn-secondary text-sm">
          <Plus className="w-3.5 h-3.5" />
          Tambah Murid
        </button>
        <button onClick={() => setAddSessionOpen(true)} className="btn-secondary text-sm">
          <Plus className="w-3.5 h-3.5" />
          Tambah Sesi
        </button>
        <button onClick={() => navigate('/progress')} className="btn-secondary text-sm">
          <Plus className="w-3.5 h-3.5" />
          Tambah Perkembangan
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Murid Aktif" value={stats?.totalStudents ?? 0} icon={GraduationCap} color="blue" />
            <StatCard title="Sesi Hari Ini" value={stats?.todaySessions ?? 0} icon={CalendarDays} color="purple" />
            <StatCard title="Hadir Hari Ini" value={stats?.todayPresent ?? 0} icon={CheckCircle} color="green" />
            <StatCard title="Perlu Reschedule" value={stats?.needReschedule ?? 0} icon={RefreshCw} color="orange" />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance per student */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Tingkat Kehadiran Murid</p>
            <select
              value={selectedStudentChart}
              onChange={(e) => setSelectedStudentChart(e.target.value)}
              className="input-field w-40 text-xs py-1.5"
            >
              <option value="">Semua Murid</option>
              {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          {attendanceByStudent.length === 0 ? (
            <EmptyState title="Belum ada data sesi" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={selectedStudentChart
                  ? attendanceByStudent.filter(d => d.name === selectedStudentChart)
                  : attendanceByStudent}
                barSize={28}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Kehadiran']} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card p-5">
          <p className="section-title mb-4">Status Kehadiran (8 Terakhir)</p>
          {statusData.length === 0 ? (
            <EmptyState title="Belum ada data" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sessions */}
        <div className="card">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="section-title">Sesi Terbaru</p>
            <button onClick={() => navigate('/sessions')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Memuat...</p>
            ) : recentSessions.length === 0 ? (
              <EmptyState title="Belum ada sesi" />
            ) : (
              recentSessions.slice(0, 5).map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.students?.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatDateShort(s.session_date)}
                      {s.learning_materials?.length > 0 && ` • ${s.learning_materials.length} materi`}
                    </p>
                  </div>
                  <StatusBadge status={s.status} size="xs" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Need Reschedule */}
        <div className="card">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="section-title">Perlu Dijadwalkan Ulang</p>
            <button onClick={() => navigate('/sessions')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Memuat...</p>
            ) : needReschedule.length === 0 ? (
              <EmptyState title="Tidak ada sesi yang perlu dijadwalkan ulang" />
            ) : (
              needReschedule.map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.students?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">{formatDateShort(s.session_date)}</p>
                      <StatusBadge status={s.status} size="xs" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.students?.whatsapp && (
                      <a
                        href={getWhatsAppUrl(s.students.whatsapp, `Halo, sesi belajar ${s.students.name} perlu dijadwalkan ulang.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setRescheduleTarget(s)}
                      className="text-xs btn-secondary py-1 px-3"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Jadwalkan Ulang
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={addStudentOpen} onClose={() => setAddStudentOpen(false)} title="Tambah Murid">
        <StudentForm onSubmit={handleAddStudent} loading={saving} />
      </Modal>
      <Modal isOpen={addSessionOpen} onClose={() => setAddSessionOpen(false)} title="Tambah Sesi">
        <SessionForm students={students} onSubmit={handleAddSession} loading={saving} />
      </Modal>
      <Modal isOpen={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title="Jadwalkan Ulang Sesi">
        <RescheduleForm session={rescheduleTarget} onSubmit={handleReschedule} loading={saving} />
      </Modal>
    </div>
  )
}
