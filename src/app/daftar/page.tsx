"use client";

import { useState } from "react";

const INSTRUMEN = [
  "Gitar Akustik",
  "Gitar Listrik",
  "Gitar Klasik",
  "Piano",
  "Drum",
  "Vokal",
  "Bass",
  "Biola",
  "Saxophone",
  "Lainnya",
];

export default function DaftarPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    telepon: "",
    instrumen: "",
    catatan: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.telepon || !form.instrumen) return;

    // Simpan ke localStorage (sementara, nanti ganti ke DB)
    const existing = JSON.parse(localStorage.getItem("kmc_pendaftar") || "[]");
    existing.push({ ...form, tanggal: new Date().toISOString(), status: "pending" });
    localStorage.setItem("kmc_pendaftar", JSON.stringify(existing));

    setSubmitted(true);
  };

  if (submitted) {
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
        }}
      >
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#1e3a2f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 20 20" fill="#34d399">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 12px 0',
            }}
          >
            Pendaftaran Berhasil
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#9ca3af',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            Pendaftaran berhasil, kami akan segera menghubungi anda. Terima Kasih.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#059669',
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '440px',
          width: '100%',
        }}
      >
        {/* Tombol Kembali */}
        <a
          href="/"
          style={{
            color: '#9ca3af',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            display: 'inline-block',
            marginBottom: '24px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
        >
          ← Kembali
        </a>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 8px 0',
          }}
        >
          Daftar Kursus
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#6b7280',
            margin: '0 0 28px 0',
          }}
        >
          Silahkan mengisi data
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nama */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#d1d5db',
                marginBottom: '6px',
              }}
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
              placeholder="Masukkan nama kamu"
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#374151'}
            />
          </div>

          {/* Telepon */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#d1d5db',
                marginBottom: '6px',
              }}
            >
              No Telepon / WA
            </label>
            <input
              type="tel"
              value={form.telepon}
              onChange={(e) => setForm({ ...form, telepon: e.target.value })}
              required
              placeholder="08xxxxxxx"
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#374151'}
            />
          </div>

          {/* Instrumen */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#d1d5db',
                marginBottom: '6px',
              }}
            >
              Instrumen yang diminati
            </label>
            <select
              value={form.instrumen}
              onChange={(e) => setForm({ ...form, instrumen: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#374151'}
            >
              <option value="" style={{ backgroundColor: '#1f2937' }}>Pilih instrumen</option>
              {INSTRUMEN.map((ins) => (
                <option key={ins} value={ins} style={{ backgroundColor: '#1f2937' }}>
                  {ins}
                </option>
              ))}
            </select>
          </div>

          {/* Catatan */}
          <div style={{ marginBottom: '28px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#d1d5db',
                marginBottom: '6px',
              }}
            >
              Catatan <span style={{ color: '#6b7280', fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Ada yang ingin disampaikan?"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#374151'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 0',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          >
            Daftar Sekarang
          </button>
        </form>
      </div>
    </div>
  );
}