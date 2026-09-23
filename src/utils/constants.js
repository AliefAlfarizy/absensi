// Status sesi
export const SESSION_STATUS = {
  HADIR: 'hadir',
  SAKIT: 'sakit',
  IZIN: 'izin',
  ALPA: 'alpa',
  RESCHEDULE: 'reschedule',
  SELESAI: 'selesai',
  PENGGANTI: 'pengganti',
}

export const SESSION_STATUS_LABELS = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  izin: 'Izin',
  alpa: 'Alpa',
  reschedule: 'Reschedule',
  selesai: 'Selesai',
  pengganti: 'Pengganti',
}

export const SESSION_STATUS_COLORS = {
  hadir: 'bg-green-100 text-green-700',
  sakit: 'bg-yellow-100 text-yellow-700',
  izin: 'bg-blue-100 text-blue-700',
  alpa: 'bg-red-100 text-red-700',
  reschedule: 'bg-orange-100 text-orange-700',
  selesai: 'bg-gray-100 text-gray-600',
  pengganti: 'bg-purple-100 text-purple-700',
}

// Kategori perkembangan
export const PROGRESS_CATEGORIES = [
  { value: 'akademik', label: 'Akademik' },
  { value: 'membaca', label: 'Membaca' },
  { value: 'menulis', label: 'Menulis' },
  { value: 'berhitung', label: 'Berhitung' },
  { value: 'hafalan', label: 'Hafalan' },
  { value: 'sikap', label: 'Sikap' },
  { value: 'kedisiplinan', label: 'Kedisiplinan' },
  { value: 'lainnya', label: 'Lainnya' },
]

// Status murid
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}

export const STUDENT_STATUS_LABELS = {
  active: 'Aktif',
  inactive: 'Nonaktif',
}

// Kelas yang tersedia
export const CLASS_OPTIONS = [
  'TK A', 'TK B',
  'SD Kelas 1', 'SD Kelas 2', 'SD Kelas 3',
  'SD Kelas 4', 'SD Kelas 5', 'SD Kelas 6',
  'SMP Kelas 7', 'SMP Kelas 8', 'SMP Kelas 9',
  'SMA Kelas 10', 'SMA Kelas 11', 'SMA Kelas 12',
  'Lainnya',
]

// Tipe file yang diizinkan untuk upload
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/jpg',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Warna chart untuk recharts
export const CHART_COLORS = {
  hadir: '#22c55e',
  sakit: '#eab308',
  izin: '#3b82f6',
  alpa: '#ef4444',
  reschedule: '#f97316',
  selesai: '#9ca3af',
  pengganti: '#a855f7',
}
