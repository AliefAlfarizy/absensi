import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, TrendingUp, Filter } from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { useStudents } from '../hooks/useStudents'
import { useGlobalToast } from '../components/Layout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ProgressForm from '../components/ProgressForm'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/SkeletonLoader'
import { formatDateShort } from '../utils/formatDate'
import { PROGRESS_CATEGORIES } from '../utils/constants'

export default function Progress() {
  const toast = useGlobalToast()

  const [search, setSearch] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filters = useMemo(() => ({
    studentId: filterStudentId,
    category: filterCategory,
    dateFrom,
    dateTo,
  }), [filterStudentId, filterCategory, dateFrom, dateTo])

  const { progressList, loading, error, addProgress, updateProgress, deleteProgress } = useProgress(filters)
  const { students } = useStudents()

  const filtered = useMemo(() => {
    if (!search) return progressList
    const s = search.toLowerCase()
    return progressList.filter(p =>
      p.title?.toLowerCase().includes(s) ||
      p.description?.toLowerCase().includes(s) ||
      p.students?.name?.toLowerCase().includes(s)
    )
  }, [progressList, search])

  const handleAdd = async (data) => {
    setSaving(true)
    const { error } = await addProgress(data)
    if (error) toast.error(error)
    else { toast.success('Perkembangan berhasil ditambahkan'); setAddModalOpen(false) }
    setSaving(false)
  }

  const handleEdit = async (data) => {
    setSaving(true)
    const { error } = await updateProgress(editItem.id, data)
    if (error) toast.error(error)
    else { toast.success('Perkembangan berhasil diperbarui'); setEditItem(null) }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await deleteProgress(deleteTarget.id)
    if (error) toast.error(error)
    else toast.success('Perkembangan berhasil dihapus')
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Perkembangan Murid</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? '...' : `${filtered.length} catatan`}</p>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Tambah Perkembangan
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul, deskripsi, nama murid..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select value={filterStudentId} onChange={(e) => setFilterStudentId(e.target.value)} className="input-field w-full sm:w-48">
            <option value="">Semua Murid</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field w-full sm:w-40">
            <option value="">Semua Kategori</option>
            {PROGRESS_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field w-full sm:w-40" title="Dari" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field w-full sm:w-40" title="Sampai" />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Perkembangan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Murid</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Tanggal</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={5} cols={6} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState
                    title="Belum ada catatan perkembangan"
                    description="Tambahkan catatan untuk melacak perkembangan murid."
                    action={() => setAddModalOpen(true)}
                    actionLabel="+ Tambah Perkembangan"
                  />
                </td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-gray-700">{item.students?.name || '-'}</p>
                      <p className="text-xs text-gray-400">{item.students?.class}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                        {PROGRESS_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {item.progress_percentage != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.progress_percentage}%` }} />
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{item.progress_percentage}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                      {formatDateShort(item.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditItem(item)} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah Perkembangan">
        <ProgressForm students={students} onSubmit={handleAdd} loading={saving} />
      </Modal>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Perkembangan">
        <ProgressForm students={students} initial={editItem} onSubmit={handleEdit} loading={saving} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Perkembangan?"
        message={`Hapus catatan "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        loading={deleting}
      />
    </div>
  )
}
