"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MasukPage() {
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama.trim() || !noHp.trim()) {
      setError("Harap isi semua field");
      return;
    }

    setLoading(true);

    const cleanPhone = noHp.trim().replace(/\D/g, '');

    const { data, error: err } = await supabase
      .from("students")
      .select("id, name, phone, status")
      .eq("name", nama.trim())
      .eq("phone", cleanPhone)
      .single();

    setLoading(false);

    if (err || !data) {
      setError("Akun tidak ditemukan. Silakan daftar dulu.");
      return;
    }

    if (data.status !== "aktif") {
      setError("Akun kamu masih menunggu persetujuan admin.");
      return;
    }

    // Login berhasil
    const session = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      role: "student",
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem("kmc_student_session", JSON.stringify(session));
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
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "4px",
            }}
          >
            Krisna Music Course
          </div>
          <div
            style={{ fontSize: "14px", color: "#059669", fontWeight: 600 }}
          >
            Murid — Masuk
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
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama kamu"
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
              No. Telepon
            </label>
            <input
              type="text"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="08xxxxxxxx"
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
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: loading ? "#065f46" : "#059669",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#047857")
            }
            onMouseLeave={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#059669")
            }
          >
            {loading ? "Memproses..." : "Masuk"}
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
            style={{ color: "#059669", textDecoration: "none", fontWeight: 600 }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}