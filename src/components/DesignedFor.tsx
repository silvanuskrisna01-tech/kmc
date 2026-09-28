"use client";

const ITEMS = [
  { title: "Alat Musik Lengkap", desc: "Gitar, Piano, Drum, Bass, dan berbagai alat musik lainnya siap pakai" },
  { title: "Studio Nyaman", desc: "Ruang les ber-AC, kedap suara, dan nyaman untuk belajar" },
  { title: "Pengajar Profesional", desc: "Berpengalaman dan bersertifikat di bidangnya masing-masing" },
];

export default function Fasilitas() {
  return (
    <section
      style={{
        borderTop: '1px solid #1f2937',
        padding: '80px 0',
        backgroundColor: '#030712',
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
          Fasilitas Kami
        </h2>
        <p
          style={{
            color: '#9ca3af',
            maxWidth: '576px',
            margin: '0 auto 48px auto',
          }}
        >
          Nikmati pengalaman belajar musik dengan fasilitas terbaik dari KMC
        </p>

        {/* 3 kartu */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {ITEMS.map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: 'rgba(31,41,55,0.5)',
                border: '1px solid #374151',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 6px 0',
                  fontSize: '16px',
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Online & Offline — tengah */}
        <div
          style={{
            marginTop: '32px',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          <div /> {/* kolom kiri kosong */}
          <div
            style={{
              backgroundColor: 'rgba(31,41,55,0.5)',
              border: '1px solid #374151',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h3
              style={{
                fontWeight: 600,
                color: '#fff',
                margin: '0 0 6px 0',
                fontSize: '16px',
              }}
            >
              Online & Offline
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#9ca3af',
                margin: 0,
              }}
            >
              Bisa les dari rumah secara online atau datang langsung ke studio
            </p>
          </div>
          <div /> {/* kolom kanan kosong */}
        </div>
      </div>
    </section>
  );
}