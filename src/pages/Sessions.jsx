import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, RefreshCw, BookOpen } from 'lucide-react'
import { useSessions } from '../hooks/useSessions'
import { useStudents } from '../hooks/useStudents'
import { useMaterials } from '../hooks/useMaterials'
import { useGlobalToast } from '../components/Layout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import SessionForm from '../components/SessionForm'
import RescheduleForm from '../components/RescheduleForm'
import MaterialForm from '../components/MaterialForm'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/SkeletonLoader'
import { formatDateShort, formatTimeRange } from '../utils/formatDate'
import { CLASS_OPTIONS } from '../utils/constants'

const SESSION_STATUSES = [
  { value: '', label: 'Semua Status' },
  { value: 'hadir', label: 'Hadir' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'izin', label: 'Izin' },
  { value: 'alpa', label: 'Alpa' },
  { value: 'reschedule', label: 'Reschedule' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'pengganti', label: 'Pengganti' },
]

export default function Sessions() {
  const toast = useGlobalToast()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editSession, setEditSession] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)
  const [materialSession, setMaterialSession] = useState(null)
  const [expandedSession, setExpandedSession] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filters = useMemo(() => ({
    status: filterStatus,
    studentId: filterStudentId,
    dateFrom,
    dateTo,
  }), [filterStatus, filterStudentId, dateFrom, dateTo])

  const { sessions, loading, error, addSession, updateSession, deleteSession, rescheduleSession } = useSessions(filters)
  const { students } = useStudents()

  // Client-side search
  const filtered = useMemo(() => {
    if (!search) return sessions
    const s = search.toLowerCase()
    return sessions.filter(session =>
      session.students?.name?.toLowerCase().includes(s) ||
      session.notes?.toLowerCase().includes(s) ||
      session.session_date?.includes(s) ||
      session.learning_materials?.some(m => m.title.toLowerCase().includes(s))
    )
  }, [sessions, search])

  const handleAdd = async (formData) => {
    setSaving(true)
    const { error } = await addSession(formData)
    if (error) toast.error(error)
    else { toast.success('Sesi berhasil ditambahkan'); setAddModalOpen(false) }
    setSaving(false)
  }

  const handleEdit = async (formData) => {
    setSaving(true)
    const { error } = await updateSession(editSession.id, formData)
    if (error) toast.error(error)
    else { toast.success('Sesi berhasil diperbarui'); setEditSession(null) }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await deleteSession(deleteTarget.id)
    if (error) toast.error(error)
    else toast.success('Sesi berhasil dihapus')
    setDeleting(false)
    setDeleteTarget(null)
  }

  const handleReschedule = async (formData) => {
    setSaving(true)
    const { error } = await rescheduleSession(rescheduleTarget.id, formData)
    if (error) toast.error(error)
    else { toast.success('Sesi pengganti berhasil dijadwalkan'); setRescheduleTarget(null) }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Sesi Pembelajaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? '...' : `${filtered.length} sesi`}
          </p>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Tambah Sesi
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari murid, materi, catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="">Semua Murid</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-full sm:w-40"
          >
            {SESSION_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field w-full sm:w-40"
            title="Dari tanggal"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field w-full sm:w-40"
            title="Sampai tanggal"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Sessions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Murid</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal & Waktu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Materi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Catatan</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={6} cols={6} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="Belum ada sesi pembelajaran"
                      description="Tambahkan sesi untuk mulai mencatat kehadiran."
                      action={() => setAddModalOpen(true)}
                      actionLabel="+ Tambah Sesi"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(session => (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{session.students?.name || '-'}</p>
                        <p className="text-xs text-gray-400">{session.students?.class}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{formatDateShort(session.session_date)}</p>
                      <p className="text-xs text-gray-400">{formatTimeRange(session.start_time, session.end_time)}</p>
                      {session.session_type === 'replacement' && (
                        <span className="text-xs text-purple-500 font-medium">↩ Sesi Pengganti</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {session.learning_materials?.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{session.learning_materials.length} materi</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500 line-clamp-2">{session.notes || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button
                          onClick={() => setMaterialSession(session)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Kelola materi"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        {(session.status === 'sakit' || session.status === 'izin' || session.status === 'alpa') && (
                          <button
                            onClick={() => setRescheduleTarget(session)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Jadwalkan ulang"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditSession(session)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(session)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah Sesi">
        <SessionForm students={students} onSubmit={handleAdd} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editSession} onClose={() => setEditSession(null)} title="Edit Sesi">
        <SessionForm students={students} initial={editSession} onSubmit={handleEdit} loading={saving} />
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title="Jadwalkan Ulang Sesi">
        <RescheduleForm session={rescheduleTarget} onSubmit={handleReschedule} loading={saving} />
      </Modal>

      {/* Material Modal */}
      <Modal isOpen={!!materialSession} onClose={() => setMaterialSession(null)} title="Materi Pembelajaran" size="lg">
        {materialSession && (
          <MaterialManagerInline session={materialSession} toast={toast} />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Sesi?"
        message={`Hapus sesi ${deleteTarget?.students?.name} pada ${formatDateShort(deleteTarget?.session_date)}? Semua materi terkait juga akan dihapus.`}
        confirmText="Hapus"
        loading={deleting}
      />
    </div>
  )
}

// Inline material manager (digunakan dalam modal sesi)
function MaterialManagerInline({ session, toast }) {
  const { materials, loading, addMaterial, updateMaterial, deleteMaterial, deleteFile } = useMaterials(session.id)
  const [addForm, setAddForm] = useState(false)
  const [editMaterial, setEditMaterial] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const handleAdd = async (data, file) => {
    setSaving(true)
    const { error } = await addMaterial({ ...data, session_id: session.id }, file)
    if (error) toast.error(error)
    else { toast.success('Materi berhasil ditambahkan'); setAddForm(false) }
    setSaving(false)
  }

  const handleEdit = async (data, file) => {
    setSaving(true)
    const { error } = await updateMaterial(editMaterial.id, { ...data, session_id: session.id }, file)
    if (error) toast.error(error)
    else { toast.success('Materi berhasil diperbarui'); setEditMaterial(null) }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await deleteMaterial(deleteTarget.id)
    if (error) toast.error(error)
    else toast.success('Materi berhasil dihapus')
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="font-medium text-gray-700">{session.students?.name}</p>
        <p className="text-gray-500">{formatDateShort(session.session_date)} • {formatTimeRange(session.start_time, session.end_time)}</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-4">Memuat materi...</p>
      ) : materials.length === 0 && !addForm ? (
        <EmptyState
          title="Belum ada materi pembelajaran"
          description="Tambahkan materi untuk sesi ini."
        />
      ) : (
        <div className="space-y-2">
          {materials.map(m => (
            <MaterialCard
              key={m.id}
              material={m}
              onEdit={() => setEditMaterial(m)}
              onDelete={() => setDeleteTarget(m)}
              onDeleteFile={() => deleteFile(m.id)}
              toast={toast}
            />
          ))}
        </div>
      )}

      {addForm ? (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Tambah Materi</p>
          <MaterialForm onSubmit={handleAdd} loading={saving} onCancel={() => setAddForm(false)} />
        </div>
      ) : editMaterial ? (
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Edit Materi</p>
          <MaterialForm initial={editMaterial} onSubmit={handleEdit} loading={saving} onCancel={() => setEditMaterial(null)} />
        </div>
      ) : (
        <button onClick={() => setAddForm(true)} className="btn-secondary w-full justify-center">
          <Plus className="w-4 h-4" />
          Tambah Materi
        </button>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Materi?"
        message={`Hapus materi "${deleteTarget?.title}"? File terkait juga akan dihapus.`}
        confirmText="Hapus"
        loading={deleting}
      />
    </div>
  )
}

function MaterialCard({ material, onEdit, onDelete, onDeleteFile, toast }) {
  return (
    <div className="flex items-start justify-between gap-3 border border-gray-100 rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{material.title}</p>
        {material.description && (
          <p className="text-xs text-gray-500 mt-0.5">{material.description}</p>
        )}
        {material.file_url ? (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
              📄 {material.file_name || 'File'}
            </span>
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              Lihat
            </a>
            <a
              href={material.file_url}
              download={material.file_name}
              className="text-xs text-green-500 hover:underline"
            >
              Download
            </a>
            <button onClick={onDeleteFile} className="text-xs text-red-400 hover:text-red-600">
              Hapus File
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">Belum ada file materi.</p>
        )}
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="p-1 text-gray-400 hover:text-yellow-600 rounded"><Edit2 className="w-4 h-4" /></button>
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
