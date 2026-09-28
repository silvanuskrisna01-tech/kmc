# Krisna Music Course (KMC)

Management system untuk kursus musik — mengelola guru, murid, jadwal, dan laporan.

## Fitur

- **Landing Page** — informasi kursus, fasilitas, fitur
- **Auth** — login sebagai Guru atau Murid
- **Guru** — jadwal mengajar, daftar murid, laporan kehadiran (per individu)
- **Murid** — jadwal kursus, progres belajar
- **Admin** — kelola guru, kursus, dan data (hidden, akses via URL langsung)

## Tech Stack

- **Framework:** Next.js 16.3.6 (App Router)
- **Styling:** Inline styles + CSS (Zero Tailwind)
- **Font:** Poppins (Google Fonts)
- **Database:** Mock / localStorage (rencana migrasi ke Supabase)

## Dev

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`

### Login Demo

| Role | Kredensial |
|------|-----------|
| Admin | `/admin/masuk` — admin / admin123 |
| Guru | `/guru/masuk` — pilih nama guru |
| Murid | `/masuk` — isi nama + no telepon |