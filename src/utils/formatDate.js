/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }

  return d.toLocaleDateString('id-ID', defaultOptions)
}

/**
 * Format tanggal singkat: 23 Sep 2026
 */
export function formatDateShort(date) {
  return formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Format tanggal + waktu
 */
export function formatDateTime(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format waktu dari string TIME (HH:MM:SS) → HH:MM
 */
export function formatTime(time) {
  if (!time) return '-'
  return time.substring(0, 5)
}

/**
 * Format range waktu
 */
export function formatTimeRange(startTime, endTime) {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`
}

/**
 * Konversi date ke format YYYY-MM-DD untuk input[type=date]
 */
export function toInputDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

/**
 * Nama hari dalam bahasa Indonesia
 */
export function getDayName(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { weekday: 'long' })
}
