/**
 * Normalisasi nomor WA ke format internasional Indonesia (62xxx)
 * @param {string} phone
 * @returns {string}
 */
export function normalizeWhatsApp(phone) {
  if (!phone) return ''
  // Hapus semua non-digit kecuali +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // Jika mulai dengan +62
  if (cleaned.startsWith('+62')) {
    return cleaned.substring(1) // Hapus +, jadi 62xxx
  }

  // Jika mulai dengan 62
  if (cleaned.startsWith('62')) {
    return cleaned
  }

  // Jika mulai dengan 0
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.substring(1)
  }

  return '62' + cleaned
}

/**
 * Format nomor WA untuk tampilan: 0812-3456-7890
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return '-'
  let normalized = phone.replace(/[^\d]/g, '')

  // Konversi 62 → 0
  if (normalized.startsWith('62')) {
    normalized = '0' + normalized.substring(2)
  }

  // Format: 0812-3456-7890
  if (normalized.length === 12) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8)}`
  }
  if (normalized.length === 11) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8)}`
  }
  return normalized
}

/**
 * Buat URL WhatsApp
 * @param {string} phone
 * @param {string} message - optional pre-filled message
 */
export function getWhatsAppUrl(phone, message = '') {
  const normalized = normalizeWhatsApp(phone)
  const encodedMsg = encodeURIComponent(message)
  return `https://wa.me/${normalized}${message ? `?text=${encodedMsg}` : ''}`
}

/**
 * Validasi nomor WA Indonesia
 */
export function isValidWhatsApp(phone) {
  const cleaned = phone.replace(/[^\d]/g, '')
  // Minimal 10 digit, maksimal 13 digit
  return cleaned.length >= 10 && cleaned.length <= 13
}
