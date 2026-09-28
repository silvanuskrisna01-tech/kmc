"use client";

import React, { useState, useEffect } from "react";

// ─── Mock Data ───
type Guru = { id: number; name: string; phone: string; courses: string[]; availability: { day: string; start: string; end: string }[]; status: string };

const initialGuru: Guru[] = [
  { id: 1, name: "Pak Budi", phone: "08123456781", courses: ["Gitar Akustik", "Gitar Listrik", "Gitar Klasik"], availability: [{ day: "Senin", start: "09:00 WITA", end: "17:00 WITA" }, { day: "Selasa", start: "09:00 WITA", end: "15:00 WITA" }, { day: "Rabu", start: "09:00 WITA", end: "17:00 WITA" }, { day: "Kamis", start: "09:00 WITA", end: "15:00 WITA" }, { day: "Jumat", start: "09:00 WITA", end: "17:00 WITA" }, { day: "Sabtu", start: "10:00 WITA", end: "14:00 WITA" }], status: "Aktif" },
  { id: 2, name: "Bu Siti", phone: "08123456782", courses: ["Vokal"], availability: [{ day: "Senin", start: "13:00 WITA", end: "21:00 WITA" }, { day: "Rabu", start: "13:00 WITA", end: "21:00 WITA" }, { day: "Jumat", start: "13:00 WITA", end: "21:00 WITA" }], status: "Aktif" },
  { id: 3, name: "Bu Dewi", phone: "08123456783", courses: ["Piano"], availability: [{ day: "Selasa", start: "09:00 WITA", end: "16:00 WITA" }, { day: "Kamis", start: "09:00 WITA", end: "16:00 WITA" }, { day: "Jumat", start: "09:00 WITA", end: "16:00 WITA" }, { day: "Sabtu", start: "09:00 WITA", end: "12:00 WITA" }], status: "Aktif" },
];

type Course = { id: number; name: string; teacher: string; status: string };

const initialCourses: Course[] = [
  { id: 1, name: "Gitar Akustik", teacher: "Pak Budi", status: "Aktif" },
  { id: 2, name: "Vokal", teacher: "Bu Siti", status: "Aktif" },
  { id: 3, name: "Piano", teacher: "Bu Dewi", status: "Aktif" },
  { id: 4, name: "Gitar Listrik", teacher: "Pak Budi", status: "Aktif" },
  { id: 5, name: "Gitar Klasik", teacher: "Pak Budi", status: "Aktif" },
];

const MENU = ["Beranda", "Guru", "Kursus", "Murid", "Jadwal"];

export default function AdminDashboard() {
  const [active, setActive] = useState("Beranda");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [guru, setGuru] = useState<Guru[]>(initialGuru);
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // Modal state
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const timeOptions = Array.from({ length: 13 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00 WITA`);

  const [showGuruModal, setShowGuruModal] = useState(false);
  const [editGuru, setEditGuru] = useState<Guru | null>(null);
  const [guruForm, setGuruForm] = useState({ name: "", phone: "", selectedCourses: [] as string[], availability: days.map(d => ({ day: d, active: false, start: "09:00 WITA", end: "17:00 WITA" })) });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ name: "", teacher: "" });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Stats
  const totalGuru = guru.length;
  const totalKursus = courses.length;
  const totalMurid = 12;

  const MENU_ICONS: Record<string, React.ReactNode> = {
    Beranda: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Guru: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    Kursus: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
    Murid: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>,
    Jadwal: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" /></svg>,
  };

  // ─── Guru CRUD ───
  const openGuruModal = (g?: Guru) => {
    if (g) {
      setEditGuru(g);
      setGuruForm({
        name: g.name,
        phone: g.phone,
        selectedCourses: g.courses,
        availability: days.map(d => {
          const a = g.availability.find(av => av.day === d);
          return a ? { day: d, active: true, start: a.start, end: a.end } : { day: d, active: false, start: "09:00 WITA", end: "17:00 WITA" };
        }),
      });
    } else {
      setEditGuru(null);
      setGuruForm({ name: "", phone: "", selectedCourses: [], availability: days.map(d => ({ day: d, active: false, start: "09:00 WITA", end: "17:00 WITA" })) });
    }
    setShowGuruModal(true);
  };

  const saveGuru = () => {
    if (!guruForm.name.trim() || !guruForm.phone.trim()) return;
    const availability = guruForm.availability.filter(a => a.active).map(a => ({ day: a.day, start: a.start, end: a.end }));
    if (editGuru) {
      setGuru(guru.map(g => g.id === editGuru.id ? { ...g, name: guruForm.name.trim(), phone: guruForm.phone.trim(), courses: guruForm.selectedCourses, availability } : g));
    } else {
      const newId = Math.max(...guru.map(g => g.id), 0) + 1;
      setGuru([...guru, { id: newId, name: guruForm.name.trim(), phone: guruForm.phone.trim(), courses: guruForm.selectedCourses, availability, status: "Aktif" }]);
    }
    setShowGuruModal(false);
  };

  const deleteGuru = (id: number) => {
    if (confirm("Yakin hapus guru ini?")) setGuru(guru.filter(g => g.id !== id));
  };

  // ─── Course CRUD ───
  const openCourseModal = (c?: Course) => {
    if (c) { setEditCourse(c); setCourseForm({ name: c.name, teacher: c.teacher }); }
    else { setEditCourse(null); setCourseForm({ name: "", teacher: "" }); }
    setShowCourseModal(true);
  };

  const saveCourse = () => {
    if (!courseForm.name.trim() || !courseForm.teacher.trim()) return;
    if (editCourse) {
      const oldName = editCourse.name;
      const newName = courseForm.name.trim();
      setCourses(courses.map(c => c.id === editCourse.id ? { ...c, name: newName, teacher: courseForm.teacher.trim() } : c));
      // Update guru yg ngajar kursus ini — ganti nama kursus di daftar mereka
      if (oldName !== newName) {
        setGuru(guru.map(g => ({ ...g, courses: g.courses.map(cn => cn === oldName ? newName : cn) })));
      }
    } else {
      const newId = Math.max(...courses.map(c => c.id), 0) + 1;
      setCourses([...courses, { id: newId, name: courseForm.name.trim(), teacher: courseForm.teacher.trim(), status: "Aktif" }]);
    }
    setShowCourseModal(false);
  };

  const deleteCourse = (id: number) => {
    if (confirm("Yakin hapus kursus ini?")) setCourses(courses.filter(c => c.id !== id));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712' }}>
      {/* ─── Sidebar ─── */}
      <aside style={{
        width: isCollapsed ? '60px' : '220px', backgroundColor: '#111827',
        borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column',
        padding: '16px 0', flexShrink: 0, transition: 'width 0.2s', overflow: 'hidden',
      }}>
        <button onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            backgroundColor: '#1f2937', border: 'none', color: '#9ca3af', cursor: 'pointer',
            padding: isCollapsed ? '8px 0' : '8px 20px', margin: isCollapsed ? '0 10px 24px 10px' : '0 12px 24px 12px',
            borderRadius: '8px', display: 'flex', justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#374151'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1f2937'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            {isCollapsed ? <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />}
          </svg>
        </button>

        <div style={{ padding: isCollapsed ? '0' : '0 20px', marginBottom: '32px', textAlign: isCollapsed ? 'center' : 'left' }}>
          {isCollapsed ? (
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>KMC</div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '4px' }}>Krisna Music Course</div>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>Panel Admin</div>
            </>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: isCollapsed ? '0 8px' : '0 12px' }}>
          {MENU.map((item) => {
            const isActive = active === item;
            return (
              <button key={item} onClick={() => setActive(item)}
                style={{
                  backgroundColor: isActive ? '#1f2937' : 'transparent', color: isActive ? '#fff' : '#9ca3af',
                  border: 'none', borderRadius: '8px', padding: isCollapsed ? '10px 0' : '10px 14px',
                  fontSize: '14px', fontWeight: isActive ? 600 : 400, cursor: 'pointer',
                  textAlign: isCollapsed ? 'center' : 'left', width: '100%', display: 'flex',
                  alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '10px',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1a1a2e'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{MENU_ICONS[item]}</span>
                {!isCollapsed && <span>{item}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: isCollapsed ? '0 8px' : '0 12px' }}>
          <button onClick={() => { localStorage.removeItem("kmc_admin_session"); window.location.href = '/'; }}
            style={{
              backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #374151',
              borderRadius: '8px', padding: isCollapsed ? '10px 0' : '10px 14px', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer', textAlign: 'center', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            {!isCollapsed && "Keluar"}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main style={{ flex: 1, padding: isMobile ? '24px' : '40px', backgroundColor: '#030712', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 0 32px 0' }}>{active}</h1>

        {/* ─── BERANDA ─── */}
        {active === "Beranda" && (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: "Total Guru", value: totalGuru, color: "#8b5cf6" },
                { label: "Total Kursus", value: totalKursus, color: "#10b981" },
                { label: "Total Murid", value: totalMurid, color: "#3b82f6" },
                { label: "Kursus Aktif", value: courses.filter(c => c.status === "Aktif").length, color: "#f59e0b" },
              ].map((s) => (
                <div key={s.label} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: s.color, marginBottom: '8px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Daftar Cepat */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {/* Guru */}
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '0 0 16px 0' }}>Guru Aktif</h2>
                {guru.filter(g => g.status === "Aktif").map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#1f2937', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#9ca3af', flexShrink: 0 }}>{i + 1}</span>
                      {g.name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{g.courses.length} kursus</span>
                  </div>
                ))}
              </div>
              {/* Kursus */}
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '0 0 16px 0' }}>Kursus Aktif</h2>
                {courses.filter(c => c.status === "Aktif").map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                    <span>{c.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{c.teacher}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── GURU ─── */}
        {active === "Guru" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Kelola data guru pengajar</p>
              <button onClick={() => openGuruModal()}
                style={{
                  padding: '10px 20px', backgroundColor: '#059669', color: '#fff', border: 'none',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >+ Tambah Guru</button>
            </div>
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '13px', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px' }}>Nama</th>
                    <th style={{ padding: '14px 16px' }}>No Telepon</th>
                    <th style={{ padding: '14px 16px' }}>Instrumen</th>
                    <th style={{ padding: '14px 16px' }}>Available</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {guru.map(g => (
                    <tr key={g.id} style={{ borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#fff' }}>{g.name}</td>
                      <td style={{ padding: '14px 16px' }}>{g.phone}</td>
                      <td style={{ padding: '14px 16px' }}>{g.courses.length > 0 ? g.courses.join(", ") : "—"}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                        {g.availability.length > 0 ? g.availability.map(a => `${a.day} ${a.start}-${a.end}`).join("; ") : "—"}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, backgroundColor: g.status === "Aktif" ? '#065f46' : '#374151', color: g.status === "Aktif" ? '#34d399' : '#9ca3af' }}>{g.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => openGuruModal(g)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', marginRight: '12px' }}>Edit</button>
                        <button onClick={() => deleteGuru(g.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Guru */}
            {showGuruModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px 0' }}>{editGuru ? "Edit Guru" : "Tambah Guru"}</h2>

                  {/* Nama */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Nama Lengkap</label>
                    <input type="text" value={guruForm.name} onChange={(e) => setGuruForm({ ...guruForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* No WA */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>No Telepon / WA</label>
                    <input type="tel" value={guruForm.phone} onChange={(e) => setGuruForm({ ...guruForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Instrumen */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '8px' }}>Instrumen yang diajarkan</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {courses.filter(c => c.status === "Aktif").map(c => (
                        <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: guruForm.selectedCourses.includes(c.name) ? '#065f46' : '#1f2937', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: guruForm.selectedCourses.includes(c.name) ? '#34d399' : '#d1d5db', border: guruForm.selectedCourses.includes(c.name) ? '1px solid #059669' : '1px solid #374151' }}>
                          <input type="checkbox" checked={guruForm.selectedCourses.includes(c.name)} onChange={(e) => { if (e.target.checked) setGuruForm({ ...guruForm, selectedCourses: [...guruForm.selectedCourses, c.name] }); else setGuruForm({ ...guruForm, selectedCourses: guruForm.selectedCourses.filter(s => s !== c.name) }); }} style={{ accentColor: '#059669' }} />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability Grid */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '8px' }}>Ketersediaan Hari & Jam</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {guruForm.availability.map((a, i) => (
                        <div key={a.day} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: a.active ? '#1a2a1a' : '#1f2937', borderRadius: '8px' }}>
                          <input type="checkbox" checked={a.active} onChange={() => { const newAv = [...guruForm.availability]; newAv[i] = { ...newAv[i], active: !newAv[i].active }; setGuruForm({ ...guruForm, availability: newAv }); }} style={{ accentColor: '#059669' }} />
                          <span style={{ width: '60px', fontSize: '14px', fontWeight: 500, color: a.active ? '#fff' : '#6b7280', flexShrink: 0 }}>{a.day}</span>
                          <select value={a.start} onChange={(e) => { const newAv = [...guruForm.availability]; newAv[i] = { ...newAv[i], start: e.target.value }; setGuruForm({ ...guruForm, availability: newAv }); }} disabled={!a.active}
                            style={{ flex: 1, padding: '6px 10px', backgroundColor: a.active ? '#1f2937' : '#111827', border: '1px solid #374151', borderRadius: '6px', color: a.active ? '#fff' : '#4b5563', fontSize: '13px', outline: 'none', cursor: a.active ? 'pointer' : 'not-allowed' }}>
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>sd</span>
                          <select value={a.end} onChange={(e) => { const newAv = [...guruForm.availability]; newAv[i] = { ...newAv[i], end: e.target.value }; setGuruForm({ ...guruForm, availability: newAv }); }} disabled={!a.active}
                            style={{ flex: 1, padding: '6px 10px', backgroundColor: a.active ? '#1f2937' : '#111827', border: '1px solid #374151', borderRadius: '6px', color: a.active ? '#fff' : '#4b5563', fontSize: '13px', outline: 'none', cursor: a.active ? 'pointer' : 'not-allowed' }}>
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowGuruModal(false)}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#1f2937', color: '#9ca3af', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Batal</button>
                    <button onClick={saveGuru}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── KURSUS ─── */}
        {active === "Kursus" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Kelola instrumen kursus yang tersedia</p>
              <button onClick={() => openCourseModal()}
                style={{
                  padding: '10px 20px', backgroundColor: '#059669', color: '#fff', border: 'none',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >+ Tambah Kursus</button>
            </div>
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '13px', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px' }}>Instrumen</th>
                    <th style={{ padding: '14px 16px' }}>Guru</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#fff' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#1f2937', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#9ca3af', flexShrink: 0 }}>{c.id}</span>
                          {c.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>{c.teacher}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, backgroundColor: c.status === "Aktif" ? '#065f46' : '#374151', color: c.status === "Aktif" ? '#34d399' : '#9ca3af' }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => openCourseModal(c)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', marginRight: '12px' }}>Edit</button>
                        <button onClick={() => deleteCourse(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Kursus */}
            {showCourseModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '480px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px 0' }}>{editCourse ? "Edit Kursus" : "Tambah Kursus"}</h2>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Nama Instrumen</label>
                    <input type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Guru Pengajar</label>
                    <select value={courseForm.teacher} onChange={(e) => setCourseForm({ ...courseForm, teacher: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Pilih guru</option>
                      {guru.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowCourseModal(false)}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#1f2937', color: '#9ca3af', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Batal</button>
                    <button onClick={saveCourse}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── MURID ─── */}
        {active === "Murid" && (
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Halaman Murid akan diisi setelah Supabase terhubung. Di sini admin bisa lihat & kelola semua murid terdaftar.</p>
          </div>
        )}

        {/* ─── JADWAL ─── */}
        {active === "Jadwal" && (
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Halaman Input Jadwal akan diisi setelah Supabase terhubung. Di sini admin bisa input jadwal 1 bulan per murid.</p>
          </div>
        )}
      </main>
    </div>
  );
}