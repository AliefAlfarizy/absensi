import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Edit2, Trash2, Phone, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { useGlobalToast } from '../components/Layout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import StudentForm from '../components/StudentForm'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/SkeletonLoader'
import { CLASS_OPTIONS } from '../utils/constants'
import { formatDateShort } from '../utils/formatDate'
import { getWhatsAppUrl, formatPhoneDisplay } from '../utils/formatPhone'

const PAGE_SIZE = 10

export default function Students() {
  const navigate = useNavigate()
  const toast = useGlobalToast()

  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filters = useMemo(() => ({
    search,
    class: filterClass,
    status: filterStatus,
  }), [search, filterClass, filterStatus])

  const { students, loading, error, addStudent, updateStudent, deleteStudent } = useStudents(filters)

  // Client-side pagination
  const totalPages = Math.ceil(students.length / PAGE_SIZE)
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleOpenAdd = () => {
    setEditStudent(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (student) => {
    setEditStudent(student)
    setModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    setSaving(true)
    if (editStudent) {
      const { error } = await updateStudent(editStudent.id, formData)
      if (error) {
        toast.error(error)
      } else {
        toast.success('Data murid berhasil diperbarui')
        setModalOpen(false)
      }
    } else {
      const { error } = await addStudent(formData)
      if (error) {
        toast.error(error)
      } else {
        toast.success('Murid berhasil ditambahkan')
        setModalOpen(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await deleteStudent(deleteTarget.id)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Murid berhasil dihapus')
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Data Murid</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? '...' : `${students.length} murid terdaftar`}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          Tambah Murid
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, orang tua, WhatsApp, kelas..."
              value={search}
              onChange={handleSearchChange}
              className="input-field pl-9"
            />
          </div>

          {/* Filter Kelas */}
          <select
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); setPage(1) }}
            className="input-field w-full sm:w-48"
          >
            <option value="">Semua Kelas</option>
            {CLASS_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            className="input-field w-full sm:w-40"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Murid</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Orang Tua</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Kelas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Terdaftar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={5} cols={7} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Belum ada data murid"
                      description="Tambahkan murid pertama untuk mulai menggunakan sistem."
                      action={handleOpenAdd}
                      actionLabel="+ Tambah Murid"
                    />
                  </td>
                </tr>
              ) : (
                paginated.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt={student.name} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-blue-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{student.parent_name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <a
                        href={getWhatsAppUrl(student.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {formatPhoneDisplay(student.whatsapp)}
                      </a>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                      {formatDateShort(student.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, students.length)} dari {students.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded font-medium transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editStudent ? 'Edit Murid' : 'Tambah Murid'}
      >
        <StudentForm
          initial={editStudent}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Murid?"
        message={`Apakah Anda yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        loading={deleting}
      />
    </div>
  )
}
