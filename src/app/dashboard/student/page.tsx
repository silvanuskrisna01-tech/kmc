"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type MyCourse = { course: string; teacher: string; day: string; time: string };
type ScheduleItem = { id: number; day: string; date: string; time: string; course: string; teacher: string; status: "akan datang" | "selesai" };
type SessionItem = { id: number; date: string; day: string; time: string; course: string; teacher: string; duration: string; rating: number };

const monthMap = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function getSessionStatus(dateStr: string): "selesai" | "akan datang" {
  const parts = dateStr.split(" ");
  if (parts.length < 2) return "akan datang";
  const [day, month] = parts;
  const monthIndex = monthMap.indexOf(month);
  if (monthIndex < 0) return "akan datang";
  const today = new Date();
  const sessionDate = new Date(today.getFullYear(), monthIndex, parseInt(day));
  sessionDate.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  return sessionDate < t ? "selesai" : "akan datang";
}

function parseDateId(dateStr: string): number {
  const parts = dateStr.split(" ");
  if (parts.length < 2) return 99;
  const monthIndex = monthMap.indexOf(parts[1]);
  return monthIndex >= 0 ? parseInt(parts[0]) + monthIndex * 100 : 99;
}

const MENU = [
  "Beranda",
  "Kursus Saya",
  "Jadwal",
  "SPP",
  "Progres",
  "Pengaturan",
];

export default function StudentDashboard() {
  const [active, setActive] = useState("Beranda");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studentName, setStudentName] = useState("Murid");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data dari Supabase
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionItem[]>([]);
  const [sppData, setSppData] = useState<{month:string; amount:number; status:string; paid_at:string|null}[]>([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Baca session + fetch data
  useEffect(() => {
    const raw = localStorage.getItem("kmc_student_session");
    if (!raw) { window.location.href = "/auth"; return; }

    let session: { id: string; name: string; phone: string };
    try {
      session = JSON.parse(raw);
      if (!session.id) throw new Error();
    } catch {
      window.location.href = "/auth";
      return;
    }

    setStudentName(session.name);
    setStudentId(session.id);

    const fetchData = async () => {
      setLoading(true);

      // 1. Ambil jadwal murid ini
      const { data: schedules } = await supabase
        .from("schedules")
        .select("id, day, time, date, courses!inner(id, name, teachers!inner(name))")
        .eq("student_id", session.id);

      const schedList: ScheduleItem[] = [];
      const courseSet = new Set<string>();
      const courses: MyCourse[] = [];

      for (const s of (schedules as any[] || [])) {
        const courseName = s.courses?.name || "";
        const teacherName = s.courses?.teachers?.name || "";

        // Kumpulkan kursus unik
        if (!courseSet.has(courseName)) {
          courseSet.add(courseName);
          courses.push({
            course: courseName,
            teacher: teacherName,
            day: s.day,
            time: s.time,
          });
        }

        // Buat jadwal per sesi (jika ada date, bikin satu baris; kalo ga ada, generate dummy)
        if (s.date) {
          schedList.push({
            id: s.id,
            day: s.day,
            date: s.date,
            time: s.time,
            course: courseName,
            teacher: teacherName,
            status: getSessionStatus(s.date),
          });
        } else {
          // Jadwal mingguan — generate hanya untuk bulan ini
          const currentMonth = new Date().getMonth();
          for (let w = 0; w < 4; w++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + (w * 7));
            if (futureDate.getMonth() !== currentMonth) break;
            const dayStr = `${futureDate.getDate()} ${monthMap[futureDate.getMonth()]}`;
            schedList.push({
              id: s.id * 100 + w,
              day: s.day,
              date: dayStr,
              time: s.time,
              course: courseName,
              teacher: teacherName,
              status: getSessionStatus(dayStr),
            });
          }
        }
      }

      setMyCourses(courses);
      setScheduleItems(schedList);

      // 2. Ambil sesi history
      const scheduleIds = (schedules as any[] || []).map((s: any) => s.id);
      if (scheduleIds.length > 0) {
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id, status, date, schedules!inner(id, day, time, courses!inner(name, teachers!inner(name)))")
          .in("schedule_id", scheduleIds);

        const hist: SessionItem[] = (sessions as any[] || []).map((s: any) => ({
          id: s.id,
          date: s.date,
          day: s.schedules?.day || "",
          time: s.schedules?.time || "",
          course: s.schedules?.courses?.name || "",
          teacher: s.schedules?.courses?.teachers?.name || "",
          duration: "60m",
          rating: s.status === "hadir" || s.status === "selesai" ? 5 : 3,
        }));
        setSessionHistory(hist.reverse());
      }

      // 3. Ambil SPP
      const { data: spp } = await supabase
        .from("spp")
        .select("month, amount, status, paid_at")
        .eq("student_id", session.id)
        .order("month", { ascending: false })
        .limit(12);
      setSppData(spp || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  // Turunan data
  const currentMonthLabel = monthMap[new Date().getMonth()];
  const scheduleThisMonth = scheduleItems
    .filter(s => s.date.includes(currentMonthLabel))
    .sort((a, b) => parseDateId(a.date) - parseDateId(b.date));

  const nearestPerCourse = scheduleThisMonth.reduce((acc: Record<string, ScheduleItem>, s) => {
    if (s.status !== "selesai" && !acc[s.course]) acc[s.course] = s;
    return acc;
  }, {});
  const nearestSchedule = Object.values(nearestPerCourse);

  const totalSessions = sessionHistory.length;
  const totalHadir = sessionHistory.length;

  const MENU_ICONS: Record<string, React.ReactNode> = {
    Beranda: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    "Kursus Saya": (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    Jadwal: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" />
      </svg>
    ),
    SPP: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      </svg>
    ),
    Progres: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    ),
    Pengaturan: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  };

  const renderStars = (n: number) => {
    return "★".repeat(n) + "☆".repeat(5 - n);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#030712", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: "16px" }}>Memuat data...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#030712',
      }}
    >
      {/* ─── Sidebar ─── */}
      <aside
        style={{
          width: isCollapsed ? '60px' : '220px',
          backgroundColor: '#111827',
          borderRight: '1px solid #1f2937',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0',
          flexShrink: 0,
          transition: 'width 0.2s',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            backgroundColor: '#1f2937',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: isCollapsed ? '8px 0' : '8px 20px',
            margin: isCollapsed ? '0 10px 24px 10px' : '0 12px 24px 12px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#374151'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1f2937'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            {isCollapsed ? (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            )}
          </svg>
        </button>

        <div
          style={{
            padding: isCollapsed ? '0' : '0 20px',
            marginBottom: '32px',
            textAlign: isCollapsed ? 'center' : 'left',
          }}
        >
          {isCollapsed ? (
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>KMC</div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '2px' }}>
                Krisna Music Course
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>
                Music Makes Better Days
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                Panel Murid
              </div>
            </>
          )}
        </div>

        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: isCollapsed ? '0 8px' : '0 12px',
          }}
        >
          {MENU.map((item) => {
            const isActive = active === item;
            return (
              <button
                key={item}
                onClick={() => setActive(item)}
                style={{
                  backgroundColor: isActive ? '#1f2937' : 'transparent',
                  color: isActive ? '#fff' : '#9ca3af',
                  border: 'none',
                  borderRadius: '8px',
                  padding: isCollapsed ? '10px 0' : '10px 14px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: isCollapsed ? 'center' : 'left',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#1a1a2e';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {MENU_ICONS[item]}
                </span>
                {!isCollapsed && <span>{item}</span>}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: 'auto',
            padding: isCollapsed ? '0 8px' : '0 12px',
          }}
        >
          <button
            onClick={() => { localStorage.removeItem("kmc_student_session"); window.location.href = '/'; }}
            style={{
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'center',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {!isCollapsed && "Keluar"}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        style={{
          flex: 1,
          padding: isMobile ? '24px' : '40px',
          backgroundColor: '#030712',
          overflowY: 'auto',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 8px 0',
          }}
        >
          {active}
        </h1>
        {active !== "Beranda" && (
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 32px 0' }}>
            Panel Murid — {studentName}
          </p>
        )}

        {/* ─── BERANDA ─── */}
        {active === "Beranda" && (
          <>
            <div
              style={{
                background: 'linear-gradient(135deg, #065f46 0%, #111827 100%)',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0',
                }}
              >
                Halo {studentName}
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {[
                { label: "Kursus Aktif", value: myCourses.length },
                { label: "Total Sesi", value: totalSessions },
                { label: "Hadir", value: totalHadir },
                { label: "Kehadiran", value: totalSessions > 0 ? "100%" : "0%" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '8px',
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#9ca3af',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 16px 0',
                }}
              >
                Jadwal Berikutnya
              </h2>
              {nearestSchedule.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada jadwal.</p>
              ) : (
                nearestSchedule.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '0 0 16px 0',
                      marginBottom: i < Math.min(nearestSchedule.length, 3) - 1 ? '16px' : '0',
                      borderBottom: i < Math.min(nearestSchedule.length, 3) - 1 ? '1px solid #1f2937' : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#059669',
                          marginTop: '4px',
                        }}
                      />
                      {i < Math.min(nearestSchedule.length, 3) - 1 && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            backgroundColor: '#1f2937',
                            margin: '4px 0',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
                        Hari <span style={{ color: '#fff', fontWeight: 600 }}>{s.day}</span> Tanggal <span style={{ color: '#fff', fontWeight: 600 }}>{s.date}</span> jam <span style={{ color: '#059669', fontWeight: 600 }}>{s.time}</span> — <span style={{ color: '#fff' }}>{s.course}</span> — <span style={{ color: '#9ca3af' }}>{s.teacher}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 16px 0',
                }}
              >
                Aktivitas Terbaru
              </h2>
              {sessionHistory.slice(0, 4).map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '0 0 12px 0',
                    marginBottom: i < Math.min(sessionHistory.length, 4) - 1 ? '12px' : '0',
                    borderBottom: i < Math.min(sessionHistory.length, 4) - 1 ? '1px solid #1f2937' : 'none',
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      flexShrink: 0,
                      width: '40px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af' }}>{s.date}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{s.course}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.teacher} • {s.time} • {s.duration}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#f59e0b', flexShrink: 0 }}>
                    {renderStars(s.rating)}
                  </div>
                </div>
              ))}
              {sessionHistory.length === 0 && (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada sesi.</p>
              )}
            </div>

            {/* ─── SPP Ringkasan di Beranda ─── */}
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                padding: '24px',
                marginTop: '16px',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 16px 0',
                }}
              >
                Status SPP
              </h2>
              {sppData.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada data SPP.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sppData.slice(0, 3).map((s, i) => {
                    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
                    const [y, m] = s.month.split("-");
                    const label = months[parseInt(m) - 1] + " " + y;
                    const lunas = s.status === "lunas";
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          backgroundColor: '#1a1a2e',
                          borderRadius: '8px',
                        }}
                      >
                        <span style={{ fontSize: '14px', color: '#d1d5db', fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: '14px', color: '#9ca3af' }}>Rp {s.amount.toLocaleString('id-ID')}</span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: lunas ? '#059669' : '#f59e0b',
                          backgroundColor: lunas ? 'rgba(5,150,105,0.15)' : 'rgba(245,158,11,0.15)',
                          padding: '4px 12px',
                          borderRadius: '6px',
                        }}>
                          {lunas ? '✓ Lunas' : 'Belum'}
                        </span>
                      </div>
                    );
                  })}
                  {sppData.length > 3 && (
                    <button
                      onClick={() => setActive("SPP")}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#059669',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: '8px',
                        textAlign: 'center',
                      }}
                    >
                      Lihat semua →
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── KURSUS SAYA ─── */}
        {active === "Kursus Saya" && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            {myCourses.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada kursus.</p>
            ) : (
              myCourses.map((c, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '12px',
                    padding: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#1e3a2f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      {c.course === "Gitar Akustik" || c.course === "Gitar Elektrik" || c.course === "Gitar Klasik" ? "🎸" : c.course === "Vokal" ? "🎤" : "🎹"}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{c.course}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                    }}
                  >
                    {[
                      { label: "Guru", value: c.teacher },
                      { label: "Jadwal", value: `${c.day}, ${c.time}` },
                    ].map((d) => (
                      <div key={d.label}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>{d.label}</div>
                        <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── JADWAL ─── */}
        {active === "Jadwal" && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            {myCourses.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada jadwal.</p>
            ) : (
              myCourses.map((c, ci) => {
                const items = scheduleThisMonth.filter((s) => s.course === c.course);
                if (items.length === 0) return null;
                return (
                  <div
                    key={ci}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #1f2937',
                      borderRadius: '12px',
                      padding: '24px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: '#1e3a2f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          flexShrink: 0,
                        }}
                      >
                        {c.course === "Gitar Akustik" || c.course === "Gitar Elektrik" || c.course === "Gitar Klasik" ? "🎸" : c.course === "Vokal" ? "🎤" : "🎹"}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{c.course}</div>
                        <div style={{ fontSize: '13px', color: '#059669', fontWeight: 500 }}>{c.teacher}</div>
                      </div>
                    </div>
                    {items.map((s, i) => {
                      const isDone = s.status === "selesai";
                      return (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            gap: '16px',
                            padding: '0 0 16px 0',
                            marginBottom: i < items.length - 1 ? '16px' : '0',
                            borderBottom: i < items.length - 1 ? '1px solid #1f2937' : 'none',
                            opacity: isDone ? 0.5 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: isDone ? '#4b5563' : '#059669',
                                marginTop: '4px',
                              }}
                            />
                            {i < items.length - 1 && (
                              <div
                                style={{
                                  width: '2px',
                                  flex: 1,
                                  backgroundColor: '#1f2937',
                                  margin: '4px 0',
                                }}
                              />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: isDone ? '#6b7280' : '#fff', textDecoration: isDone ? 'line-through' : 'none' }}>
                                  {s.day}, {s.date}
                                </div>
                                <div style={{ fontSize: '13px', color: isDone ? '#4b5563' : '#9ca3af', marginTop: '2px' }}>
                                  {s.time}
                                </div>
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: isDone ? '#4b5563' : '#6b7280',
                                  textDecoration: isDone ? 'line-through' : 'none',
                                }}
                              >
                                {s.status === "selesai" ? "✓ Selesai" : "Akan datang"}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── SPP ─── */}
        {active === "SPP" && (
          <div
            style={{
              maxWidth: '700px',
            }}
          >
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#fff',
                    margin: '0',
                  }}
                >
                  Riwayat Pembayaran SPP
                </h2>
              </div>
              {sppData.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada data SPP.</p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {sppData.map((s, i) => {
                    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
                    const [y, m] = s.month.split("-");
                    const label = months[parseInt(m) - 1] + " " + y;
                    const lunas = s.status === "lunas";
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 16px',
                          backgroundColor: '#1a1a2e',
                          borderRadius: '10px',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{label}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>Rp {s.amount.toLocaleString('id-ID')}</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          {s.paid_at && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(s.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: lunas ? '#059669' : '#f59e0b',
                              backgroundColor: lunas ? 'rgba(5,150,105,0.15)' : 'rgba(245,158,11,0.15)',
                              padding: '4px 14px',
                              borderRadius: '6px',
                            }}
                          >
                            {lunas ? '✓ Lunas' : 'Belum'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PROGRES ─── */}
        {active === "Progres" && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              {myCourses.map((c, i) => {
                const sesiKursus = sessionHistory.filter((s) => s.course === c.course);
                const total = sesiKursus.length;
                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #1f2937',
                      borderRadius: '12px',
                      padding: '24px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '4px',
                      }}
                    >
                      {c.course}
                    </div>
                    <div
                      style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '4px',
                      }}
                    >
                      {total}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                      }}
                    >
                      Sesi selesai
                    </div>
                    <div
                      style={{
                        marginTop: '12px',
                        height: '6px',
                        backgroundColor: '#1f2937',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (total / 12) * 100)}%`,
                          backgroundColor: '#059669',
                          borderRadius: '3px',
                          transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 16px 0',
                }}
              >
                History Sesi
              </h2>
              {sessionHistory.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada sesi.</p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {sessionHistory.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#1a1a2e',
                        borderRadius: '8px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{s.course}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {s.date} • {s.day} • {s.time} • {s.duration}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{s.teacher}</span>
                        <span style={{ fontSize: '13px', color: '#f59e0b' }}>{renderStars(s.rating)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── PENGATURAN ─── */}
        {active === "Pengaturan" && (
          <div
            style={{
              maxWidth: '480px',
            }}
          >
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 20px 0',
                }}
              >
                Edit Profil
              </h2>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  defaultValue={studentName}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#374151'}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  No Telepon / WA
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxx"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#374151'}
                />
              </div>
              <button
                onClick={() => alert("Fitur simpan akan aktif setelah integrasi penuh.")}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                Simpan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}