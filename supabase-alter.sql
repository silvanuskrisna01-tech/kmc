-- Tambah kolom availability (JSON) ke tabel teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::jsonb;