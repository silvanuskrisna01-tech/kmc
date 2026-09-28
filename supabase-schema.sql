-- ============================================================
-- KMC (Krisna Music Course) — Database Schema
-- Jalankan di Supabase SQL Editor (urutan: tabel → seed)
-- ============================================================

-- 1. TABEL GURU
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  password TEXT NOT NULL DEFAULT 'guru123',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL MURID
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  password TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL KURSUS
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL JADWAL
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  day TEXT NOT NULL,           -- Senin, Selasa, ...
  time TEXT NOT NULL,          -- "15:00 WITA"
  date TEXT,                   -- "2026-10-01" (kosong = jadwal rutin mingguan)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL SESI / ABSENSI
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  date TEXT NOT NULL,           -- "2026-10-01"
  status TEXT DEFAULT 'hadir',  -- hadir / izin / alpha / selesai
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA (mock → real)
-- ============================================================

-- GURU
INSERT INTO teachers (name, phone, password) VALUES
  ('Pak Budi', '08123456701', 'guru123'),
  ('Bu Siti', '08123456702', 'guru123'),
  ('Bu Dewi', '08123456703', 'guru123');

-- MURID
INSERT INTO students (name, phone) VALUES
  ('Andi Pratama',   '0811111111'),
  ('Siti Nurhaliza', '0811111112'),
  ('Budi Santoso',   '0811111113'),
  ('Dian Permata',   '0811111114'),
  ('Rizky Hidayat',  '0811111115'),
  ('Maya Sari',      '0811111116'),
  ('Fajar Ramadhan', '0811111117'),
  ('Rina Amelia',    '0811111118');

-- KURSUS (dengan relasi teacher_id)
-- Asumsikan urutan insert teachers: Pak Budi=UUID1, Bu Siti=UUID2, Bu Dewi=UUID3
-- Pake subquery biar ga usah mikirin UUID
INSERT INTO courses (name, teacher_id) VALUES
  ('Gitar Akustik',  (SELECT id FROM teachers WHERE name='Pak Budi')),
  ('Gitar Elektrik', (SELECT id FROM teachers WHERE name='Pak Budi')),
  ('Gitar Klasik',   (SELECT id FROM teachers WHERE name='Pak Budi')),
  ('Vokal',          (SELECT id FROM teachers WHERE name='Bu Siti')),
  ('Piano',          (SELECT id FROM teachers WHERE name='Bu Dewi'));

-- JADWAL (schedules): murid → kursus → hari + jam
-- Relasi: student_id + course_id
-- Gitar Akustik — Pak Budi — Andi, Siti, Budi, Dian
INSERT INTO schedules (course_id, student_id, day, time) VALUES
  ((SELECT id FROM courses WHERE name='Gitar Akustik'), (SELECT id FROM students WHERE name='Andi Pratama'),   'Senin', '15:00 WITA'),
  ((SELECT id FROM courses WHERE name='Gitar Akustik'), (SELECT id FROM students WHERE name='Siti Nurhaliza'), 'Senin', '15:00 WITA'),
  ((SELECT id FROM courses WHERE name='Gitar Akustik'), (SELECT id FROM students WHERE name='Budi Santoso'),   'Senin', '15:00 WITA'),
  ((SELECT id FROM courses WHERE name='Gitar Akustik'), (SELECT id FROM students WHERE name='Dian Permata'),   'Senin', '15:00 WITA'),
  ((SELECT id FROM courses WHERE name='Gitar Elektrik'), (SELECT id FROM students WHERE name='Rizky Hidayat'),  'Rabu', '16:00 WITA'),
  ((SELECT id FROM courses WHERE name='Gitar Klasik'),   (SELECT id FROM students WHERE name='Maya Sari'),     'Jumat','14:00 WITA'),
  ((SELECT id FROM courses WHERE name='Gitar Klasik'),   (SELECT id FROM students WHERE name='Fajar Ramadhan'),'Jumat','14:00 WITA'),
  ((SELECT id FROM courses WHERE name='Gitar Klasik'),   (SELECT id FROM students WHERE name='Rina Amelia'),   'Jumat','14:00 WITA');