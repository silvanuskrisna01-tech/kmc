"use client";

import { useState } from "react";

const teacherAccounts = [
  { name: "Pak Budi", password: "budi123" },
  { name: "Bu Siti", password: "siti123" },
  { name: "Bu Dewi", password: "dewi123" },
];

export default function GuruMasukPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !password.trim()) {
      setError("Harap isi semua field");
      return;
    }

    const found = teacherAccounts.find(
      (t) => t.name.toLowerCase() === name.trim().toLowerCase() && t.password === password
    );

    if (!found) {
      setError("Nama atau password salah");
      return;
    }

    const session = {
      name: found.name,
      role: "teacher",
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem("kmc_teacher_session", JSON.stringify(session));
    window.location.href = "/dashboard/teacher";
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
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
            Krisna Music Course
          </div>
          <div style={{ fontSize: "14px", color: "#059669", fontWeight: 600 }}>
            Guru — Masuk
          </div>
        </div>

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
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            >
              <option value="">Pilih nama guru</option>
              {teacherAccounts.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
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
          <span style={{ color: "#9ca3af" }}>
            Demo: Pak Budi / budi123, Bu Siti / siti123, Bu Dewi / dewi123
          </span>
        </p>
      </div>
    </div>
  );
}