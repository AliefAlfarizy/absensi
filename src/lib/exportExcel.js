import * as XLSX from 'xlsx'
import { formatDate, formatDateShort, formatTimeRange } from '../utils/formatDate'
import { SESSION_STATUS_LABELS, PROGRESS_CATEGORIES } from '../utils/constants'

/**
 * Export data murid individual
 */
export function exportStudentExcel(student, sessions, progressList, selected = {}) {
  const wb = XLSX.utils.book_new()

  // Sheet: Profil
  if (selected.profile !== false) {
    const profileData = [
      ['PROFIL MURID'],
      [],
      ['Nama Lengkap', student.name],
      ['Nama Orang Tua', student.parent_name],
      ['Kelas', student.class],
      ['No. WhatsApp', student.whatsapp],
      ['Status', student.status === 'active' ? 'Aktif' : 'Nonaktif'],
      ['Terdaftar Sejak', formatDate(student.created_at)],
    ]
    const ws = XLSX.utils.aoa_to_sheet(profileData)
    ws['!cols'] = [{ wch: 20 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Profil')
  }

  // Sheet: Absensi
  if (selected.attendance !== false && sessions.length > 0) {
    const headers = ['Tanggal', 'Jam', 'Status', 'Materi Dipelajari', 'Deskripsi Materi', 'File Materi', 'Catatan']
    const rows = sessions.flatMap(s => {
      const materials = s.learning_materials || []
      if (materials.length === 0) {
        return [[
          formatDateShort(s.session_date),
          formatTimeRange(s.start_time, s.end_time),
          SESSION_STATUS_LABELS[s.status] || s.status,
          '-', '-', '-',
          s.notes || '',
        ]]
      }
      // Satu baris per materi, info tanggal/jam/status hanya di baris pertama
      return materials.map((m, i) => [
        i === 0 ? formatDateShort(s.session_date) : '',
        i === 0 ? formatTimeRange(s.start_time, s.end_time) : '',
        i === 0 ? (SESSION_STATUS_LABELS[s.status] || s.status) : '',
        m.title,
        m.description || '-',
        m.file_name || '-',
        i === 0 ? (s.notes || '') : '',
      ])
    })
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 25 }, { wch: 40 }, { wch: 25 }, { wch: 35 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Absensi')
  }

  // Sheet: Materi
  if (selected.materials !== false) {
    const materials = sessions.flatMap(s =>
      (s.learning_materials || []).map(m => [
        formatDateShort(s.session_date),
        m.title,
        m.description || '',
        m.file_name || '',
      ])
    )
    if (materials.length > 0) {
      const ws = XLSX.utils.aoa_to_sheet([
        ['Tanggal Sesi', 'Judul Materi', 'Deskripsi', 'File'],
        ...materials,
      ])
      ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 40 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, ws, 'Materi')
    }
  }

  // Sheet: Perkembangan
  if (selected.progress !== false && progressList.length > 0) {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Tanggal', 'Kategori', 'Judul', 'Deskripsi', 'Progress (%)', 'Catatan Guru'],
      ...progressList.map(p => [
        formatDateShort(p.date),
        PROGRESS_CATEGORIES.find(c => c.value === p.category)?.label || p.category,
        p.title,
        p.description || '',
        p.progress_percentage ?? '',
        p.teacher_notes || '',
      ]),
    ])
    ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 35 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Perkembangan')
  }

  XLSX.writeFile(wb, `Murid_${student.name.replace(/\s+/g, '_')}.xlsx`)
}

/**
 * Export laporan umum
 */
export function exportReportExcel({ sessions, dateFrom, dateTo, filterLabel }) {
  const wb = XLSX.utils.book_new()

  const headers = ['Murid', 'Kelas', 'Tanggal', 'Jam', 'Status', 'Materi', 'Deskripsi Materi', 'File Materi', 'Catatan']

  const rows = sessions.flatMap(s => {
    const materials = s.learning_materials || []
    if (materials.length === 0) {
      return [[
        s.students?.name || '-',
        s.students?.class || '-',
        formatDateShort(s.session_date),
        formatTimeRange(s.start_time, s.end_time),
        SESSION_STATUS_LABELS[s.status] || s.status,
        '-', '-', '-',
        s.notes || '-',
      ]]
    }
    return materials.map((m, i) => [
      i === 0 ? (s.students?.name || '-') : '',
      i === 0 ? (s.students?.class || '-') : '',
      i === 0 ? formatDateShort(s.session_date) : '',
      i === 0 ? formatTimeRange(s.start_time, s.end_time) : '',
      i === 0 ? (SESSION_STATUS_LABELS[s.status] || s.status) : '',
      m.title,
      m.description || '-',
      m.file_name || '-',
      i === 0 ? (s.notes || '-') : '',
    ])
  })

  const titleRows = [
    ['LAPORAN ABSENSI BIMBINGAN BELAJAR'],
    [`Murid: ${filterLabel}`],
    [`Periode: ${formatDateShort(dateFrom)} – ${formatDateShort(dateTo)}`],
    [`Total Sesi: ${sessions.length}`],
    [],
    headers,
    ...rows,
  ]

  const ws = XLSX.utils.aoa_to_sheet(titleRows)
  ws['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 25 }, { wch: 35 }, { wch: 25 }, { wch: 35 },
  ]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Absensi')

  XLSX.writeFile(wb, `Laporan_Absensi_${dateFrom}_${dateTo}.xlsx`)
}

/**
 * Export semua data murid
 */
export function exportAllStudentsExcel(students) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([
    ['No', 'Nama', 'Nama Orang Tua', 'Kelas', 'WhatsApp', 'Status', 'Terdaftar'],
    ...students.map((s, i) => [
      i + 1,
      s.name,
      s.parent_name,
      s.class,
      s.whatsapp,
      s.status === 'active' ? 'Aktif' : 'Nonaktif',
      formatDateShort(s.created_at),
    ]),
  ])
  ws['!cols'] = [{ wch: 4 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Data Murid')
  XLSX.writeFile(wb, 'Data_Murid.xlsx')
}
