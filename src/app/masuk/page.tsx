"use client";

import { useState } from "react";

export default function MasukPage() {
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama.trim() || !noHp.trim()) {
      setError("Harap isi semua field");
      return;
    }

    // Simpan sesi login ke localStorage
    const session = {
      name: nama.trim(),
      phone: noHp.trim(),
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem("kmc_student_session", JSON.stringify(session));

    // Redirect ke dashboard student
    window.location.href = "/dashboard/student";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#030712",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      {/* Tombol Kembali */}
      <a
        href="/auth"
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          color: "#9ca3af",
          textDecoration: "none",
          fontSize: "16px",
          fontWeight: 500,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        ← Kembali
      </a>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "16px",
          padding: "40px 32px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 8px 0",
            textAlign: "center",
          }}
        >
          Masuk Student
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: "0 0 32px 0",
            textAlign: "center",
          }}
        >
          Masuk ke akun student kamu
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama kamu"
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) => (e.target.style.borderColor = "#374151")}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              No Telepon / WA
            </label>
            <input
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="Masukkan nomor telepon"
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) => (e.target.style.borderColor = "#374151")}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "14px",
                margin: "0 0 16px 0",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#047857")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#059669")
            }
          >
            Masuk
          </button>
        </form>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: "24px 0 0 0",
            textAlign: "center",
          }}
        >
          Belum punya akun?{" "}
          <a
            href="/daftar"
            style={{
              color: "#34d399",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}