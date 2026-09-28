"use client";

const STATS = [
  { num: "3", label: "Program Kursus" },
  { num: "4+", label: "Guru Profesional" },
  { num: "50+", label: "Murid Aktif" },
  { num: "2", label: "Tahun Berdiri" },
];

export default function Stats() {
  return (
    <section
      style={{
        borderTop: '1px solid #1f2937',
        backgroundColor: '#030712',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '56px 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px',
            textAlign: 'center',
            maxWidth: '768px',
            margin: '0 auto',
          }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#34d399',
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  marginTop: '4px',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}