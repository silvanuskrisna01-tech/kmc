"use client";

export default function AuthPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        position: 'relative',
      }}
    >
      {/* Tombol Kembali */}
      <a
        href="/"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          color: '#9ca3af',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
      >
        ← Kembali
      </a>
      <div
        style={{
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Card Teacher */}
        <a
          href="/guru/masuk"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '280px',
            height: '320px',
            backgroundColor: '#1f2937',
            border: '2px solid #374151',
            borderRadius: '16px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#059669';
            e.currentTarget.style.backgroundColor = '#1a2a1a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#374151';
            e.currentTarget.style.backgroundColor = '#1f2937';
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '24px',
            }}
          >            👨‍🏫
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
            }}
          >
            Guru
          </h2>
        </a>

        {/* Card Student */}
        <a
          href="/masuk"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '280px',
            height: '320px',
            backgroundColor: '#1f2937',
            border: '2px solid #374151',
            borderRadius: '16px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#059669';
            e.currentTarget.style.backgroundColor = '#1a2a1a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#374151';
            e.currentTarget.style.backgroundColor = '#1f2937';
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '24px',
            }}
          >            👩‍🎓
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
            }}
          >
            Murid
          </h2>
        </a>
      </div>
    </div>
  );
}