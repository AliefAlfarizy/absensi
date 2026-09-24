import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, formatDateShort, formatTimeRange } from '../utils/formatDate'
import { SESSION_STATUS_LABELS, PROGRESS_CATEGORIES } from '../utils/constants'

const PRIMARY = [37, 99, 235]   // blue-600
const GRAY = [107, 114, 128]    // gray-500
const LIGHT = [249, 250, 251]   // gray-50

/**
 * Format materi lengkap: judul + deskripsi + file (jika ada)
 * Contoh output: "Matematika\n  Deskripsi: ...\n  File: soal.pdf"
 */
function formatMaterials(materials = []) {
  if (!materials.length) return '-'
  return materials.map(m => {
    let text = m.title
    if (m.description) text += `\n  ${m.description}`
    if (m.file_name) text += `\n  File: ${m.file_name}`
    return text
  }).join('\n\n')
}

function addHeader(doc, title, subtitle = '') {
  // Header bar
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, 210, 18, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BIMBEL MANAGEMENT SYSTEM', 14, 8)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 14, 14)

  if (subtitle) {
    doc.setFontSize(8)
    doc.text(subtitle, 140, 8, { align: 'right' })
  }

  // Reset color
  doc.setTextColor(0, 0, 0)
  return 24
}

function addSectionTitle(doc, title, y) {
  doc.setFillColor(239, 246, 255) // blue-50
  doc.rect(14, y - 4, 182, 8, 'F')
  doc.setTextColor(...PRIMARY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 16, y)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  return y + 8
}

/**
 * Export laporan absensi ke PDF
 */
export function exportReportPDF({ sessions, dateFrom, dateTo, filterLabel }) {
  const doc = new jsPDF()

  let y = addHeader(
    doc,
    'LAPORAN ABSENSI',
    new Date().toLocaleDateString('id-ID')
  )

  // Meta info
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(`Murid: ${filterLabel}`, 14, y)
  doc.text(`Periode: ${formatDateShort(dateFrom)} – ${formatDateShort(dateTo)}`, 14, y + 5)
  doc.text(`Total Sesi: ${sessions.length}`, 14, y + 10)
  y += 18

  // Summary boxes
  const statuses = {
    'Hadir': sessions.filter(s => ['hadir', 'selesai', 'pengganti'].includes(s.status)).length,
    'Sakit': sessions.filter(s => s.status === 'sakit').length,
    'Izin': sessions.filter(s => s.status === 'izin').length,
    'Alpa': sessions.filter(s => s.status === 'alpa').length,
    'Reschedule': sessions.filter(s => s.status === 'reschedule').length,
  }

  const boxW = 34
  const boxColors = {
    'Hadir': [220, 252, 231],
    'Sakit': [254, 249, 195],
    'Izin': [219, 234, 254],
    'Alpa': [254, 226, 226],
    'Reschedule': [255, 237, 213],
  }

  let bx = 14
  Object.entries(statuses).forEach(([label, val]) => {
    doc.setFillColor(...(boxColors[label] || LIGHT))
    doc.rect(bx, y, boxW, 14, 'F')
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(String(val), bx + boxW / 2, y + 6, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(label, bx + boxW / 2, y + 11, { align: 'center' })
    bx += boxW + 2
  })

  y += 20
  doc.setTextColor(0, 0, 0)

  // Table
  autoTable(doc, {
    startY: y,
    head: [['Murid', 'Kelas', 'Tanggal', 'Jam', 'Status', 'Materi Dipelajari', 'Catatan']],
    body: sessions.map(s => [
      s.students?.name || '-',
      s.students?.class || '-',
      formatDateShort(s.session_date),
      formatTimeRange(s.start_time, s.end_time),
      SESSION_STATUS_LABELS[s.status] || s.status,
      formatMaterials(s.learning_materials),
      s.notes || '-',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 42 },
      6: { cellWidth: 'auto' },
    },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    doc.text(
      `Halaman ${i} dari ${pageCount} • Dicetak: ${new Date().toLocaleString('id-ID')}`,
      105, 290, { align: 'center' }
    )
  }

  doc.save(`Laporan_Absensi_${dateFrom}_${dateTo}.pdf`)
}

/**
 * Export data murid individual ke PDF
 */
export function exportStudentPDF(student, sessions, progressList, selected = {}) {
  const doc = new jsPDF()

  let y = addHeader(
    doc,
    `DATA MURID: ${student.name.toUpperCase()}`,
    new Date().toLocaleDateString('id-ID')
  )

  // Profil
  if (selected.profile !== false) {
    y = addSectionTitle(doc, 'PROFIL MURID', y)
    const profileRows = [
      ['Nama Lengkap', student.name],
      ['Nama Orang Tua', student.parent_name],
      ['Kelas', student.class],
      ['No. WhatsApp', student.whatsapp],
      ['Status', student.status === 'active' ? 'Aktif' : 'Nonaktif'],
      ['Terdaftar Sejak', formatDate(student.created_at)],
    ]
    autoTable(doc, {
      startY: y,
      body: profileRows,
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: LIGHT } },
      showHead: false,
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Absensi
  if (selected.attendance !== false && sessions.length > 0) {
    y = addSectionTitle(doc, 'RIWAYAT ABSENSI', y)
    autoTable(doc, {
      startY: y,
      head: [['Tanggal', 'Waktu', 'Status', 'Materi Dipelajari', 'Catatan']],
      body: sessions.map(s => [
        formatDateShort(s.session_date),
        formatTimeRange(s.start_time, s.end_time),
        SESSION_STATUS_LABELS[s.status] || s.status,
        formatMaterials(s.learning_materials),
        s.notes || '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 22 },
        2: { cellWidth: 18 },
        3: { cellWidth: 65 },
        4: { cellWidth: 'auto' },
      },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Perkembangan
  if (selected.progress !== false && progressList.length > 0) {
    if (y > 220) { doc.addPage(); y = 20 }
    y = addSectionTitle(doc, 'CATATAN PERKEMBANGAN', y)
    autoTable(doc, {
      startY: y,
      head: [['Tanggal', 'Kategori', 'Judul', 'Progress', 'Catatan']],
      body: progressList.map(p => [
        formatDateShort(p.date),
        PROGRESS_CATEGORIES.find(c => c.value === p.category)?.label || p.category,
        p.title,
        p.progress_percentage != null ? `${p.progress_percentage}%` : '-',
        p.teacher_notes || '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      alternateRowStyles: { fillColor: LIGHT },
    })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    doc.text(
      `Halaman ${i} dari ${pageCount} • Dicetak: ${new Date().toLocaleString('id-ID')}`,
      105, 290, { align: 'center' }
    )
  }

  doc.save(`Murid_${student.name.replace(/\s+/g, '_')}.pdf`)
}
