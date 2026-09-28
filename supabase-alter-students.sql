-- Tambah kolom status ke students
ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aktif';

-- Update kolom yang sudah ada jadi 'aktif'
UPDATE students SET status = 'aktif' WHERE status IS NULL;