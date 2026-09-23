import { useState, useEffect, useMemo } from 'react'
import { Search, BookOpen, Download, Eye, Trash2, Edit2, FileText, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMaterials } from '../hooks/useMaterials'
import { useStudents } from '../hooks/useStudents'
import { useGlobalToast } from '../components/Layout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import MaterialForm from '../components/MaterialForm'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/SkeletonLoader'
import { formatDateShort, formatTimeRange } from '../utils/formatDate'

export default function Materials() {
  const toast = useGlobalToast()
  const [search, setSearch] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')
  const [allMaterials, setAllMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [addSessionId, setAddSessionId] = useState(null)
  const [editMaterial, setEditMaterial] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { students } = useStudents()

  const fetchAll = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('learning_materials')
        .select(`
          *,
          sessions (
            id, session_date, start_time, end_time, status, student_id,
            students (id, name, class)
          )
        `)
        .order('created_at', { ascending: false })

      if (filterStudentId) {
        query = query.eq('sessions.student_id', filterStudentId)
      }

      const { data, error } = await query
      if (error) throw error
      setAllMaterials(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data materi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [filterStudentId])

  const filtered = useMemo(() => {
    if (!search) return allMaterials
    const s = search.toLowerCase()
    return allMaterials.filter(m =>
      m.title?.toLowerCase().includes(s) ||
      m.description?.toLowerCase().includes(s) ||
      m.sessions?.students?.name?.toLowerCase().includes(s)
    )
  }, [allMaterials, search])

  const handleEditSubmit = async (data, file) => {
    setSaving(true)
    const { error } = await supabase
      .from('learning_materials')
      .update({ title: data.title, description: data.description })
      .eq('id', editMaterial.id)

    if (error) {
      toast.error('Gagal memperbarui materi.')
    } else {
      toast.success('Materi berhasil diperbarui')
      setEditMaterial(null)
      fetchAll()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    // Hapus file dari storage jika ada
    if (deleteTarget.file_url) {
      const urlParts = deleteTarget.file_url.split('/learning-materials/')
      if (urlParts.length > 1) {
        await supabase.storage.from('learning-materials').remove([urlParts[1]])
      }
    }
    const { error } = await supabase
      .from('learning_materials')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) toast.error('Gagal menghapus materi.')
    else { toast.success('Materi berhasil dihapus'); fetchAll() }
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Materi Pembelajaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? '...' : `${filtered.length} materi`}</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul, deskripsi, nama murid..."
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
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Materi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Murid</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Sesi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">File</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={5} cols={5} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5}>
                  <EmptyState title="Belum ada materi pembelajaran" description="Materi ditambahkan melalui halaman Sesi." />
                </td></tr>
              ) : (
                filtered.map(material => (
                  <tr key={material.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{material.title}</p>
                      {material.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{material.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700">{material.sessions?.students?.name || '-'}</p>
                      <p className="text-xs text-gray-400">{material.sessions?.students?.class}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-gray-600 text-xs">{formatDateShort(material.sessions?.session_date)}</p>
                      <p className="text-gray-400 text-xs">{formatTimeRange(material.sessions?.start_time, material.sessions?.end_time)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {material.file_url ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium truncate max-w-28">
                            {material.file_name || 'File'}
                          </span>
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer"
                            className="p-1 text-blue-400 hover:text-blue-600 rounded" title="Lihat">
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a href={material.file_url} download={material.file_name}
                            className="p-1 text-green-400 hover:text-green-600 rounded" title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Belum ada file materi.</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditMaterial(material)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(material)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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

      <Modal isOpen={!!editMaterial} onClose={() => setEditMaterial(null)} title="Edit Materi">
        <MaterialForm initial={editMaterial} onSubmit={handleEditSubmit} loading={saving} onCancel={() => setEditMaterial(null)} />
      </Modal>

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
