import { formatDateShort, formatTimeRange } from '../utils/formatDate'
import { SESSION_STATUS_LABELS, PROGRESS_CATEGORIES } from '../utils/constants'

/**
 * Convert array of arrays to CSV string
 */
function arrayToCSV(rows) {
  return rows.map(row =>
    row.map(cell => {
      const str = String(cell ?? '')
      // Escape double quotes and wrap in quotes if contains comma, newline, or quote
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  ).join('\r\n')
}

/**
 * Trigger download of CSV file
 */
function downloadCSV(csv, filename) {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export laporan ke CSV
 */
export function exportReportCSV({ sessions, dateFrom, dateTo, filterLabel }) {
  const rows = [
    ['LAPORAN ABSENSI BIMBINGAN BELAJAR'],
    [`Murid: ${filterLabel}`],
    [`Periode: ${formatDateShort(dateFrom)} – ${formatDateShort(dateTo)}`],
    [`Total Sesi: ${sessions.length}`],
    [],
    ['Murid', 'Kelas', 'Tanggal', 'Jam', 'Status', 'Materi', 'Catatan'],
    ...sessions.map(s => [
      s.students?.name || '-',
      s.students?.class || '-',
      formatDateShort(s.session_date),
      formatTimeRange(s.start_time, s.end_time),
      SESSION_STATUS_LABELS[s.status] || s.status,
      (s.learning_materials || []).map(m => m.title).join('; ') || '-',
      s.notes || '-',
    ]),
  ]

  downloadCSV(arrayToCSV(rows), `Laporan_Absensi_${dateFrom}_${dateTo}.csv`)
}

/**
 * Export data murid ke CSV
 */
export function exportStudentCSV(student, sessions, progressList, selected = {}) {
  const rows = []

  if (selected.profile !== false) {
    rows.push(['=== PROFIL MURID ==='])
    rows.push(['Nama Lengkap', student.name])
    rows.push(['Nama Orang Tua', student.parent_name])
    rows.push(['Kelas', student.class])
    rows.push(['No. WhatsApp', student.whatsapp])
    rows.push(['Status', student.status === 'active' ? 'Aktif' : 'Nonaktif'])
    rows.push([])
  }

  if (selected.attendance !== false && sessions.length > 0) {
    rows.push(['=== RIWAYAT ABSENSI ==='])
    rows.push(['Tanggal', 'Jam', 'Status', 'Materi Dipelajari', 'Catatan'])
    sessions.forEach(s => {
      rows.push([
        formatDateShort(s.session_date),
        formatTimeRange(s.start_time, s.end_time),
        SESSION_STATUS_LABELS[s.status] || s.status,
        (s.learning_materials || []).map(m => m.title).join('; ') || '-',
        s.notes || '',
      ])
    })
    rows.push([])
  }

  if (selected.progress !== false && progressList.length > 0) {
    rows.push(['=== PERKEMBANGAN MURID ==='])
    rows.push(['Tanggal', 'Kategori', 'Judul', 'Deskripsi', 'Progress (%)', 'Catatan Guru'])
    progressList.forEach(p => {
      rows.push([
        formatDateShort(p.date),
        PROGRESS_CATEGORIES.find(c => c.value === p.category)?.label || p.category,
        p.title,
        p.description || '',
        p.progress_percentage ?? '',
        p.teacher_notes || '',
      ])
    })
  }

  downloadCSV(arrayToCSV(rows), `Murid_${student.name.replace(/\s+/g, '_')}.csv`)
}

/**
 * Export semua murid ke CSV
 */
export function exportAllStudentsCSV(students) {
  const rows = [
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
  ]
  downloadCSV(arrayToCSV(rows), 'Data_Murid.csv')
}
