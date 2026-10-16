-- Tambah kolom kode_akses ke tabel students
ALTER TABLE students ADD COLUMN IF NOT EXISTS kode_akses TEXT UNIQUE;

-- Generate kode unik 6 digit untuk murid yang belum punya
DO $$
DECLARE
  rec RECORD;
  kode TEXT;
  unique_kode BOOLEAN;
BEGIN
  FOR rec IN SELECT id FROM students WHERE kode_akses IS NULL LOOP
    unique_kode := false;
    WHILE unique_kode = false LOOP
      kode := LPAD(floor(random() * 1000000)::text, 6, '0');
      SELECT NOT EXISTS (SELECT 1 FROM students WHERE kode_akses = kode) INTO unique_kode;
    END LOOP;
    UPDATE students SET kode_akses = kode WHERE id = rec.id;
  END LOOP;
END $$;