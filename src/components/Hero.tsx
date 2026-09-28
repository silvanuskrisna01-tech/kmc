"use client";

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/images/hero-studio.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Overlay gelap */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <h1 className="glow-text">
          Krisna Music Course
        </h1>
        <div style={{ marginTop: '40px' }}>
          <a
            href="/daftar"
            className="daftar-btn"
            style={{
              display: 'inline-block',
              backgroundColor: '#059669',
              color: '#fff',
              fontWeight: 700,
              fontSize: '20px',
              padding: '18px 56px',
              textDecoration: 'none',
              letterSpacing: '1px',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          >
            Daftar Sekarang
          </a>
        </div>
      </div>

      <style>{`
        .glow-text {
          display: inline-block;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 900;
          color: #fff;
          margin: 0;
          letter-spacing: -2px;
          line-height: 1.05;
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 10px rgba(52, 211, 153, 0.3),
                         0 0 30px rgba(52, 211, 153, 0.1);
          }
          50% {
            text-shadow: 0 0 20px rgba(52, 211, 153, 0.6),
                         0 0 60px rgba(52, 211, 153, 0.3),
                         0 0 100px rgba(52, 211, 153, 0.1);
          }
        }

        .daftar-btn {
          animation: btnPulse 2s ease-in-out infinite;
        }

        @keyframes btnPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </section>
  );
}