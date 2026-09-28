"use client";

export default function Navbar() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#111827',
        borderBottom: '1px solid #1f2937',
      }}
    >
      <div className="nav-inner">
        {/* Logo — kiri */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            KMC
          </div>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.025em',
            }}
          >
            Krisna Music Course
          </span>
        </a>

        {/* Masuk / Daftar — kanan */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: 'auto',
          }}
        >
          <a
            href="/auth"
            style={{
              fontWeight: 700,
              fontSize: '14px',
              color: '#fff',
              backgroundColor: 'teal',
              padding: '10px 20px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#006666'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'teal'}
          >
            Masuk / Daftar
          </a>
        </div>
      </div>

      <style>{`
        .nav-inner {
          display: flex;
          align-items: center;
          height: 72px;
          padding-left: 16px;
          padding-right: 16px;
        }
        @media (min-width: 640px) {
          .nav-inner {
            padding-left: 32px;
            padding-right: 32px;
          }
        }
        @media (min-width: 1024px) {
          .nav-inner {
            padding-left: 60px;
            padding-right: 60px;
          }
        }
        @media (min-width: 1440px) {
          .nav-inner {
            padding-left: 80px;
            padding-right: 80px;
          }
        }
      `}</style>
    </header>
  );
}