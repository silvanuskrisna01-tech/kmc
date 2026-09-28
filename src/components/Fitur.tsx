"use client";

const FITUR = [
  { title: "Kursus Lengkap", desc: "Gitar, Piano, Drum, Bass, Vokal — semua alat musik bisa dipelajari di KMC" },
  { title: "Guru Profesional", desc: "Pengajar berpengalaman dan bersertifikat di bidang musik masing-masing" },
  { title: "Online & Offline", desc: "Bisa les via Zoom dari rumah atau datang langsung ke studio KMC" },
  { title: "Jadwal Fleksibel", desc: "Atur sendiri jadwal les sesuai waktu luang, ga perlu terikat jadwal kaku" },
  { title: "Sertifikat Kelulusan", desc: "Dapatkan sertifikat resmi setelah menyelesaikan program kursus" },
  { title: "Semua Usia", desc: "Dari anak-anak hingga dewasa, semua bisa belajar musik di KMC" },
];

export default function Fitur() {
  return (
    <section
      style={{
        borderTop: '1px solid #1f2937',
        padding: '80px 0',
        backgroundColor: '#111827',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 8px 0',
          }}
        >
          Kenapa Belajar di KMC?
        </h2>
        <p
          style={{
            color: '#9ca3af',
            maxWidth: '576px',
            margin: '0 auto 48px auto',
          }}
        >
          KMC hadir untuk membuat perjalanan belajar musikmu lebih menyenangkan
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {FITUR.map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '28px 24px',
                textAlign: 'left',
              }}
            >
              <h3
                style={{
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 8px 0',
                  fontSize: '17px',
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}