-- Tambah kolom type untuk membedakan mode jadwal sementara:
-- 'replace' = ganti jadwal asli (perilaku lama)
-- 'add'     = tambah sesi baru / add-on (jadwal asli tetap jalan)
ALTER TABLE schedule_overrides ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'replace';

-- Data lama otomatis jadi 'replace' (aman, sesuai perilaku sebelumnya).