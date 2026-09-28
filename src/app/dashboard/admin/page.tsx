"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Guru = { id: string; name: string; phone: string; courses: { id: string; name: string }[]; availability: { day: string; start: string; end: string }[]; status: string };
type Course = { id: string; name: string; teacher_id: string; teacher_name: string; status: string };

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const timeOptions = Array.from({ length: 13 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00 WITA`);

const MENU = ["Beranda", "Guru", "Kursus", "Murid", "Jadwal"];

export default function AdminDashboard() {
  const [active, setActive] = useState("Beranda");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [guru, setGuru] = useState<Guru[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalMurid, setTotalMurid] = useState(0);

  // Modal state — Guru
  const [showGuruModal, setShowGuruModal] = useState(false);
  const [editGuru, setEditGuru] = useState<Guru | null>(null);
  const [guruForm, setGuruForm] = useState({ name: "", phone: "", selectedCourseIds: [] as string[], availability: days.map(d => ({ day: d, active: false, start: "09:00 WITA", end: "17:00 WITA" })) });

  // Modal state — Course
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ name: "", teacher_id: "" });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ─── FETCH DATA ───
  const fetchData = async () => {
    setLoading(true);

    // Teachers
    const { data: teachers } = await supabase.from("teachers").select("*");
    // Courses with teacher name
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, name, teacher_id, teachers(name)");

    // Students count
    const { count } = await supabase.from("students").select("*", { count: "exact", head: true });

    const teacherList: Guru[] = (teachers || []).map((t: any) => {
      const availability = t.availability ? (typeof t.availability === "string" ? JSON.parse(t.availability) : t.availability) : [];
      const myCourses = (coursesData || []).filter((c: any) => c.teacher_id === t.id).map((c: any) => ({ id: c.id, name: c.name }));
      return {
        id: t.id,
        name: t.name,
        phone: t.phone || "",
        courses: myCourses,
        availability,
        status: "Aktif",
      };
    });

    const courseList: Course[] = (coursesData || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      teacher_id: c.teacher_id || "",
      teacher_name: c.teachers?.name || "",
      status: "Aktif",
    }));

    setGuru(teacherList);
    setCourses(courseList);
    setTotalMurid(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ─── GURU CRUD ───
  const openGuruModal = (g?: Guru) => {
    if (g) {
      setEditGuru(g);
      setGuruForm({
        name: g.name,
        phone: g.phone,
        selectedCourseIds: g.courses.map(c => c.id),
        availability: days.map(d => {
          const a = g.availability.find(av => av.day === d);
          return a ? { day: d, active: true, start: a.start, end: a.end } : { day: d, active: false, start: "09:00 WITA", end: "17:00 WITA" };
        }),
      });
    } else {
      setEditGuru(null);
      setGuruForm({ name: "", phone: "", selectedCourseIds: [], availability: days.map(d => ({ day: d, active: false, start: "09:00 WITA", end: "17:00 WITA" })) });
    }
    setShowGuruModal(true);
  };

  const saveGuru = async () => {
    if (!guruForm.name.trim() || !guruForm.phone.trim()) return;
    const availability = guruForm.availability.filter(a => a.active).map(a => ({ day: a.day, start: a.start, end: a.end }));
    const availabilityJson = JSON.stringify(availability);

    if (editGuru) {
      await supabase.from("teachers").update({ name: guruForm.name.trim(), phone: guruForm.phone.trim(), availability: availabilityJson }).eq("id", editGuru.id);

      // Hapus course assignments lama, set baru
      await supabase.from("courses").update({ teacher_id: null }).eq("teacher_id", editGuru.id);
      if (guruForm.selectedCourseIds.length > 0) {
        await supabase.from("courses").update({ teacher_id: editGuru.id }).in("id", guruForm.selectedCourseIds);
      }
    } else {
      const { data } = await supabase.from("teachers").insert({ name: guruForm.name.trim(), phone: guruForm.phone.trim(), password: "guru123", availability: availabilityJson }).select().single();
      if (data && guruForm.selectedCourseIds.length > 0) {
        await supabase.from("courses").update({ teacher_id: data.id }).in("id", guruForm.selectedCourseIds);
      }
    }

    setShowGuruModal(false);
    fetchData();
  };

  const deleteGuru = async (id: string) => {
    if (!confirm("Yakin hapus guru ini?")) return;
    await supabase.from("courses").update({ teacher_id: null }).eq("teacher_id", id);
    await supabase.from("teachers").delete().eq("id", id);
    fetchData();
  };

  // ─── COURSE CRUD ───
  const openCourseModal = (c?: Course) => {
    if (c) { setEditCourse(c); setCourseForm({ name: c.name, teacher_id: c.teacher_id }); }
    else { setEditCourse(null); setCourseForm({ name: "", teacher_id: "" }); }
    setShowCourseModal(true);
  };

  const saveCourse = async () => {
    if (!courseForm.name.trim()) return;

    if (editCourse) {
      await supabase.from("courses").update({ name: courseForm.name.trim(), teacher_id: courseForm.teacher_id || null }).eq("id", editCourse.id);
    } else {
      await supabase.from("courses").insert({ name: courseForm.name.trim(), teacher_id: courseForm.teacher_id || null });
    }

    setShowCourseModal(false);
    fetchData();
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Yakin hapus kursus ini?")) return;
    await supabase.from("courses").delete().eq("id", id);
    fetchData();
  };

  // ─── STATS ───
  const totalGuru = guru.length;
  const totalKursus = courses.length;

  const MENU_ICONS: Record<string, React.ReactNode> = {
    Beranda: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Guru: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    Kursus: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
    Murid: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>,
    Jadwal: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" /></svg>,
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#030712", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: "16px" }}>Memuat data...</p>
      </div>
    );
  }

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

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '0 0 16px 0' }}>Guru Aktif</h2>
                {guru.filter(g => g.status === "Aktif").slice(0, 5).map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#1f2937', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#9ca3af', flexShrink: 0 }}>{i + 1}</span>
                      {g.name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{g.courses.length} kursus</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '0 0 16px 0' }}>Kursus Aktif</h2>
                {courses.filter(c => c.status === "Aktif").map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                    <span>{c.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{c.teacher_name}</span>
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
                style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
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
                    <th style={{ padding: '14px 16px' }}>Kursus</th>
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
                      <td style={{ padding: '14px 16px' }}>{g.courses.length > 0 ? g.courses.map(c => c.name).join(", ") : "—"}</td>
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

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Nama Lengkap</label>
                    <input type="text" value={guruForm.name} onChange={(e) => setGuruForm({ ...guruForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>No Telepon / WA</label>
                    <input type="tel" value={guruForm.phone} onChange={(e) => setGuruForm({ ...guruForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '8px' }}>Kursus yang diajarkan</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {courses.map(c => (
                        <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: guruForm.selectedCourseIds.includes(c.id) ? '#065f46' : '#1f2937', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: guruForm.selectedCourseIds.includes(c.id) ? '#34d399' : '#d1d5db', border: guruForm.selectedCourseIds.includes(c.id) ? '1px solid #059669' : '1px solid #374151' }}>
                          <input type="checkbox" checked={guruForm.selectedCourseIds.includes(c.id)} onChange={(e) => { if (e.target.checked) setGuruForm({ ...guruForm, selectedCourseIds: [...guruForm.selectedCourseIds, c.id] }); else setGuruForm({ ...guruForm, selectedCourseIds: guruForm.selectedCourseIds.filter(s => s !== c.id) }); }} style={{ accentColor: '#059669' }} />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>

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
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Kelola kursus yang tersedia</p>
              <button onClick={() => openCourseModal()}
                style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >+ Tambah Kursus</button>
            </div>
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '13px', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px' }}>No</th>
                    <th style={{ padding: '14px 16px' }}>Kursus</th>
                    <th style={{ padding: '14px 16px' }}>Guru</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                      <td style={{ padding: '14px 16px', color: '#9ca3af' }}>{i + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#fff' }}>{c.name}</td>
                      <td style={{ padding: '14px 16px' }}>{c.teacher_name || "—"}</td>
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
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Nama Kursus</label>
                    <input type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Guru Pengajar</label>
                    <select value={courseForm.teacher_id} onChange={(e) => setCourseForm({ ...courseForm, teacher_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Pilih guru</option>
                      {guru.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
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
          <StudentManager />
        )}

        {/* ─── JADWAL ─── */}
        {active === "Jadwal" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Input jadwal sesi per murid</p>
            </div>
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <ScheduleAdmin />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Komponen Manajemen Murid ───
function StudentManager() {
  const [students, setStudents] = useState<{ id: string; name: string; phone: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<{ id: string; name: string; phone: string; status: string } | null>(null);
  const [scheduleModal, setScheduleModal] = useState<{ studentId: string; studentName: string } | null>(null);
  const [schedForm, setSchedForm] = useState({ course_id: "", day: "Senin", time: "09:00 WITA" });
  const [courses, setCourses] = useState<{ id: string; name: string; teacher_name: string }[]>([]);
  const [schedMsg, setSchedMsg] = useState("");

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      aktif: { bg: '#065f46', text: '#34d399' },
      cuti: { bg: '#1e3a5f', text: '#60a5fa' },
      berhenti: { bg: '#3f1f1f', text: '#f87171' },
      pending: { bg: '#3f2f1f', text: '#fbbf24' },
    };
    const c = colors[status] || { bg: '#374151', text: '#9ca3af' };
    return <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, backgroundColor: c.bg, color: c.text }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from("students").select("id, name, phone, status").order("name");
    setStudents(data || []);
    setLoading(false);
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("id, name, teachers(name)").order("name");
    setCourses((data || []).map((c: any) => ({ id: c.id, name: c.name, teacher_name: c.teachers?.name || "" })));
  };

  useEffect(() => { fetchStudents(); fetchCourses(); }, []);

  // Filter & search
  const filtered = students.filter(s => {
    if (filter !== "semua" && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Save edit
  const saveEdit = async () => {
    if (!editModal) return;
    await supabase.from("students").update({ name: editModal.name, phone: editModal.phone, status: editModal.status }).eq("id", editModal.id);
    setEditModal(null);
    fetchStudents();
  };

  // Delete student
  const deleteStudent = async (id: string) => {
    if (!confirm("Yakin hapus murid ini? Semua jadwalnya juga akan terhapus.")) return;
    await supabase.from("schedules").delete().eq("student_id", id);
    await supabase.from("students").delete().eq("id", id);
    fetchStudents();
  };

  // Add schedule
  const addSchedule = async () => {
    if (!scheduleModal || !schedForm.course_id) { setSchedMsg("Pilih kursus"); return; }
    setSchedMsg("");
    const { error } = await supabase.from("schedules").insert({
      student_id: scheduleModal.studentId,
      course_id: schedForm.course_id,
      day: schedForm.day,
      time: schedForm.time,
    });
    if (error) { setSchedMsg("Gagal: " + error.message); return; }
    setSchedMsg("✓ Jadwal ditambahkan");
    setScheduleModal(null);
  };

  // Schedule info component
  function SchedInfo({ studentId }: { studentId: string }) {
    const [info, setInfo] = useState<string>("—");
    useEffect(() => {
      supabase.from("schedules")
        .select("day, time, courses!inner(name)")
        .eq("student_id", studentId)
        .limit(3)
        .then(({ data }) => {
          if (data && data.length > 0) setInfo(data.map((s: any) => `${s.courses?.name || ""} ${s.day} ${s.time}`).join("; "));
        });
    }, [studentId]);
    return <span style={{ fontSize: '13px', color: '#6b7280' }}>{info}</span>;
  }

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '14px' }}>Memuat...</p>;

  return (
    <div>
      {/* Header + Search + Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Total: {students.length} murid</p>
        <input
          type="text" placeholder="Cari nama..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', width: '200px' }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {["semua", "aktif", "cuti", "berhenti", "pending"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              backgroundColor: filter === f ? '#059669' : 'transparent',
              borderColor: filter === f ? '#059669' : '#374151',
              color: filter === f ? '#fff' : '#9ca3af',
            }}
          >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '13px', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px' }}>No</th>
              <th style={{ padding: '12px 16px' }}>Nama</th>
              <th style={{ padding: '12px 16px' }}>Telepon</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Jadwal</th>
              <th style={{ padding: '12px 16px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Tidak ada murid.</td></tr>
            ) : (
              filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#fff' }}>{s.name}</td>
                  <td style={{ padding: '12px 16px' }}>{s.phone}</td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(s.status || "aktif")}</td>
                  <td style={{ padding: '12px 16px' }}><SchedInfo studentId={s.id} /></td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditModal({ id: s.id, name: s.name, phone: s.phone, status: s.status || "aktif" })}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                    <button onClick={() => { setScheduleModal({ studentId: s.id, studentName: s.name }); setSchedForm({ course_id: "", day: "Senin", time: "09:00 WITA" }); }}
                      style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '13px' }}>+Jadwal</button>
                    <button onClick={() => deleteStudent(s.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL EDIT ─── */}
      {editModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '420px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px 0' }}>Edit Murid</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Nama</label>
              <input type="text" value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Telepon</label>
              <input type="text" value={editModal.phone} onChange={(e) => setEditModal({ ...editModal, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Status</label>
              <select value={editModal.status} onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                {["aktif", "cuti", "berhenti", "pending"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditModal(null)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#1f2937', color: '#9ca3af', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Batal</button>
              <button onClick={saveEdit}
                style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ASSIGN JADWAL ─── */}
      {scheduleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '420px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>Buat Jadwal</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px 0' }}>Murid: <span style={{ color: '#fff', fontWeight: 600 }}>{scheduleModal.studentName}</span></p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Kursus</label>
              <select value={schedForm.course_id} onChange={(e) => setSchedForm({ ...schedForm, course_id: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                <option value="">Pilih kursus</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} — {c.teacher_name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Hari</label>
                <select value={schedForm.day} onChange={(e) => setSchedForm({ ...schedForm, day: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                  {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Jam</label>
                <select value={schedForm.time} onChange={(e) => setSchedForm({ ...schedForm, time: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {schedMsg && <p style={{ color: schedMsg.startsWith("✓") ? '#34d399' : '#ef4444', fontSize: '14px', margin: '0 0 16px 0' }}>{schedMsg}</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setScheduleModal(null); setSchedMsg(""); }}
                style={{ flex: 1, padding: '12px', backgroundColor: '#1f2937', color: '#9ca3af', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Batal</button>
              <button onClick={addSchedule}
                style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Komponen Input Jadwal ───
function ScheduleAdmin() {
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string; teacher_name: string }[]>([]);
  const [form, setForm] = useState({ student_id: "", course_id: "", day: "Senin", time: "09:00 WITA" });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const [sRes, cRes] = await Promise.all([
        supabase.from("students").select("id, name").order("name"),
        supabase.from("courses").select("id, name, teachers(name)").order("name"),
      ]);
      setStudents(sRes.data || []);
      setCourses((cRes.data || []).map((c: any) => ({ id: c.id, name: c.name, teacher_name: c.teachers?.name || "" })));
      refreshSchedules();
    };
    fetch();
  }, []);

  const refreshSchedules = async () => {
    const { data } = await supabase
      .from("schedules")
      .select("id, day, time, courses!inner(name), students!inner(name)")
      .order("day")
      .limit(50);
    setSchedules(data || []);
  };

  const addSchedule = async () => {
    if (!form.student_id || !form.course_id) { setMsg("Pilih murid dan kursus"); return; }
    setMsg("");
    const { error } = await supabase.from("schedules").insert({
      student_id: form.student_id,
      course_id: form.course_id,
      day: form.day,
      time: form.time,
    });
    if (error) { setMsg("Gagal: " + error.message); return; }
    setMsg("✓ Jadwal ditambahkan");
    refreshSchedules();
  };

  const deleteSchedule = async (id: number) => {
    if (!confirm("Hapus jadwal ini?")) return;
    await supabase.from("schedules").delete().eq("id", id);
    refreshSchedules();
  };

  return (
    <div>
      {/* Form Input */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Murid</label>
          <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}>
            <option value="">Pilih murid</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Kursus</label>
          <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}>
            <option value="">Pilih kursus</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name} — {c.teacher_name}</option>)}
          </select>
        </div>
        <div style={{ minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Hari</label>
          <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
            style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}>
            {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Jam</label>
          <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
            style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}>
            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={addSchedule}
          style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', height: '38px' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
        >+ Tambah</button>
      </div>

      {msg && <p style={{ color: msg.startsWith("✓") ? '#34d399' : '#ef4444', fontSize: '14px', margin: '0 0 16px 0' }}>{msg}</p>}

      {/* Daftar Jadwal */}
      <div>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>Jadwal tersimpan ({schedules.length})</p>
        {schedules.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada jadwal.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '13px', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Murid</th>
                <th style={{ padding: '10px 12px' }}>Kursus</th>
                <th style={{ padding: '10px 12px' }}>Hari</th>
                <th style={{ padding: '10px 12px' }}>Jam</th>
                <th style={{ padding: '10px 12px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1f2937', color: '#d1d5db', fontSize: '14px' }}>
                  <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 500 }}>{s.students?.name || ""}</td>
                  <td style={{ padding: '10px 12px' }}>{s.courses?.name || ""}</td>
                  <td style={{ padding: '10px 12px' }}>{s.day}</td>
                  <td style={{ padding: '10px 12px' }}>{s.time}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => deleteSchedule(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}