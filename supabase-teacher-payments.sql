-- Tambah kolom type untuk jadwal sementara (replace / add)
ALTER TABLE schedule_overrides ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'replace';

-- Tabel pembayaran guru
CREATE TABLE IF NOT EXISTS teacher_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  month TEXT NOT NULL,
  regular_sessions INT DEFAULT 0,
  add_on_sessions INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  total_teacher_share NUMERIC(12,0) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Biar cepet query per teacher per month
CREATE INDEX IF NOT EXISTS idx_teacher_payments_teacher_month ON teacher_payments(teacher_id, month);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_teacher_payments_updated ON teacher_payments;
CREATE TRIGGER trigger_teacher_payments_updated
  BEFORE UPDATE ON teacher_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();