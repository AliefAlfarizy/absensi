-- ============================================================
-- BIMBEL MANAGEMENT SYSTEM — DATABASE SCHEMA
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  parent_name   VARCHAR(255) NOT NULL,
  whatsapp      VARCHAR(20) NOT NULL,
  class         VARCHAR(100) NOT NULL,
  photo_url     TEXT,
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  session_date         DATE NOT NULL,
  start_time           TIME NOT NULL,
  end_time             TIME NOT NULL,
  status               VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa', 'reschedule', 'selesai', 'pengganti')),
  session_type         VARCHAR(20) DEFAULT 'regular' CHECK (session_type IN ('regular', 'replacement')),
  original_session_id  UUID REFERENCES sessions(id) ON DELETE SET NULL,
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: learning_materials
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_materials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  file_url     TEXT,
  file_name    VARCHAR(255),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: student_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS student_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  category            VARCHAR(50) NOT NULL CHECK (
    category IN (
      'akademik', 'membaca', 'menulis', 'berhitung',
      'hafalan', 'sikap', 'kedisiplinan', 'lainnya'
    )
  ),
  title               VARCHAR(255) NOT NULL,
  description         TEXT,
  progress_percentage INTEGER CHECK (progress_percentage BETWEEN 0 AND 100),
  teacher_notes       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_original ON sessions(original_session_id);
CREATE INDEX IF NOT EXISTS idx_materials_session_id ON learning_materials(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON student_progress(date);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON learning_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Aktifkan untuk production. Untuk development awal,
-- gunakan policy allow-all dengan anon key.
-- ============================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Allow all for anon (development). Ganti dengan auth policy saat production.
CREATE POLICY "allow_all_students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_materials" ON learning_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_progress" ON student_progress FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SUPABASE STORAGE: learning-materials bucket
-- Jalankan di Supabase Dashboard → Storage → New Bucket
-- Atau gunakan SQL berikut (Supabase >= v2):
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('learning-materials', 'learning-materials', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policy (jalankan setelah bucket dibuat):
-- CREATE POLICY "Public read learning materials"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'learning-materials');

-- CREATE POLICY "Allow upload learning materials"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'learning-materials');

-- CREATE POLICY "Allow delete learning materials"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'learning-materials');
