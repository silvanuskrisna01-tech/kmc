"use client";

import React, { useState, useEffect } from "react";

const MENU = [
  "Beranda",
  "Murid",
  "Laporan",
];

// Map guru → kursus yang diajar
const teacherCourses: Record<string, string[]> = {
  "Pak Budi": ["Gitar Akustik", "Gitar Listrik", "Gitar Klasik"],
  "Bu Siti": ["Vokal"],
  "Bu Dewi": ["Piano"],
};

// ─── Mock Data ───
const scheduleToday = [
  { id: 1, day: "Senin", time: "09:00 WITA", student: "Andi", course: "Gitar Akustik" },
  { id: 2, day: "Senin", time: "11:00 WITA", student: "Siti", course: "Gitar Listrik" },
  { id: 3, day: "Senin", time: "14:00 WITA", student: "Budi", course: "Gitar Klasik" },
];

const students = [
  { name: "Andi", course: "Gitar Akustik", startDate: "1 Mar 2026", status: "Aktif", day: "Senin", time: "09:00 WITA" },
  { name: "Siti", course: "Gitar Listrik", startDate: "15 Jan 2026", status: "Aktif", day: "Selasa", time: "11:00 WITA" },
  { name: "Budi", course: "Gitar Klasik", startDate: "10 Okt 2025", status: "Aktif", day: "Rabu", time: "14:00 WITA" },
  { name: "Dian", course: "Gitar Akustik", startDate: "20 Feb 2026", status: "Aktif", day: "Kamis", time: "10:00 WITA" },
  { name: "Rizky", course: "Gitar Listrik", startDate: "5 Mar 2026", status: "Aktif", day: "Jumat", time: "13:00 WITA" },
  { name: "Maya", course: "Gitar Akustik", startDate: "12 Des 2025", status: "Aktif", day: "Sabtu", time: "15:00 WITA" },
  { name: "Fajar", course: "Gitar Klasik", startDate: "1 Apr 2026", status: "Baru", day: "Senin", time: "08:00 WITA" },
  { name: "Rina", course: "Gitar Akustik", startDate: "28 Mar 2026", status: "Baru", day: "Rabu", time: "16:00 WITA" },
];

const attendanceStats = [
  { label: "Total Sesi", value: "48" },
  { label: "Hadir", value: "43" },
  { label: "Alpha", value: "5" },
  { label: "Kehadiran", value: "89.6%" },
];

const attendanceData = [
  { name: "Andi", course: "Gitar Akustik", total: 12, hadir: 12, alpha: 0, pct: "100%" },
  { name: "Siti", course: "Gitar Listrik", total: 12, hadir: 10, alpha: 2, pct: "83%" },
  { name: "Budi", course: "Gitar Klasik", total: 12, hadir: 11, alpha: 1, pct: "92%" },
  { name: "Dian", course: "Gitar Akustik", total: 12, hadir: 10, alpha: 2, pct: "83%" },
  { name: "Rizky", course: "Gitar Listrik", total: 10, hadir: 8, alpha: 2, pct: "80%" },
  { name: "Maya", course: "Gitar Akustik", total: 12, hadir: 12, alpha: 0, pct: "100%" },
  { name: "Fajar", course: "Gitar Klasik", total: 6, hadir: 5, alpha: 1, pct: "83%" },
  { name: "Rina", course: "Gitar Akustik", total: 8, hadir: 7, alpha: 1, pct: "87.5%" },
];

const pastSessions = [
  { id: 101, date: "27 Sep", day: "Sabtu", student: "Maya", time: "15:00 WITA", duration: "60m" },
  { id: 102, date: "27 Sep", day: "Sabtu", student: "Rizky", time: "13:00 WITA", duration: "60m" },
  { id: 103, date: "26 Sep", day: "Jumat", student: "Fajar", time: "08:00 WITA", duration: "45m" },
  { id: 104, date: "26 Sep", day: "Jumat", student: "Dian", time: "10:00 WITA", duration: "60m" },
  { id: 105, date: "25 Sep", day: "Kamis", student: "Siti", time: "11:00 WITA", duration: "60m" },
  { id: 106, date: "25 Sep", day: "Kamis", student: "Budi", time: "14:00 WITA", duration: "90m" },
  { id: 107, date: "24 Sep", day: "Rabu", student: "Rina", time: "16:00 WITA", duration: "60m" },
  { id: 108, date: "24 Sep", day: "Rabu", student: "Andi", time: "09:00 WITA", duration: "60m" },
];

export default function TeacherDashboard() {
  const [active, setActive] = useState("Beranda");
  const [teacherName, setTeacherName] = useState("");
  const [filterDay, setFilterDay] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<Record<number, string>>({});
  const [sessionStart, setSessionStart] = useState<Record<number, number>>({});
  const [timerDisplay, setTimerDisplay] = useState<Record<number, string>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Baca session guru
  useEffect(() => {
    const session = localStorage.getItem("kmc_teacher_session");
    if (!session) { window.location.href = "/guru/masuk"; return; }
    try {
      const data = JSON.parse(session);
      if (data.name && teacherCourses[data.name]) setTeacherName(data.name);
      else window.location.href = "/guru/masuk";
    } catch { window.location.href = "/guru/masuk"; }
  }, []);

  // Data yang difilter berdasarkan guru yang login
  const myCourses = teacherName ? teacherCourses[teacherName] || [] : [];
  const mySchedule = scheduleToday.filter(s => myCourses.includes(s.course));
  const myStudents = students.filter(s => myCourses.includes(s.course));
  const myAttendance = attendanceData.filter(s => myCourses.includes(s.course));
  const myPastSessions = pastSessions; // history semua — bisa difilter nanti

  // Stats personal
  const myStats = [
    { label: "Total Murid", value: myStudents.length },
    { label: "Kursus Aktif", value: myCourses.length },
    { label: "Jadwal Hari Ini", value: mySchedule.length },
    { label: "Murid Aktif", value: myStudents.filter(s => s.status === "Aktif").length },
  ];

  // Live timer untuk session yang sedang berlangsung
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerDisplay((prev) => {
        const next = { ...prev };
        for (const idStr in sessionStart) {
          const id = Number(idStr);
          if (sessionStatus[id] === "ongoing") {
            const elapsed = Math.floor((Date.now() - sessionStart[id]) / 1000);
            const m = Math.floor(elapsed / 60);
            const s = elapsed % 60;
            next[id] = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStatus, sessionStart]);

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
        {/* Toggle button */}
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

        {/* Logo */}
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
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '4px' }}>
                Krisna Music Course
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                {teacherName || "Panel Guru"}
              </div>
            </>
          )}
        </div>

        {/* Menu */}
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
                {/* Icon */}
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {item === "Beranda" && (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  )}
                  {item === "Murid" && (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                  {item === "Laporan" && (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                {/* Text */}
                {!isCollapsed && <span>{item}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          style={{
            marginTop: 'auto',
            padding: isCollapsed ? '0 8px' : '0 12px',
          }}
        >
          <button
            onClick={() => { localStorage.removeItem("kmc_teacher_session"); window.location.href = '/guru/masuk'; }}
            style={{
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: isCollapsed ? 'center' : 'center',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'center',
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
          padding: '40px',
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
        <p
          style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0 0 32px 0',
          }}
        >
          Halo {teacherName || "Guru"}
        </p>

        {/* ─── BERANDA ─── */}
        {active === "Beranda" && (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {myStats.map((s) => (
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

            {/* Jadwal Hari Ini */}
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
                Jadwal Hari Ini
              </h2>
              {mySchedule.map((s, i) => {
              const status = sessionStatus[s.id] || "scheduled";
              const isOngoing = status === "ongoing";
              const isDone = status === "completed";

              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    gap: isMobile ? '8px' : '16px',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    padding: '0 0 12px 0',
                    marginBottom: i < mySchedule.length - 1 ? '12px' : '0',
                    borderBottom: i < mySchedule.length - 1 ? '1px solid #1f2937' : 'none',
                    position: 'relative',
                    opacity: isDone ? 0.5 : 1,
                  }}
                >
                  {/* Time */}
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDone ? '#6b7280' : '#059669',
                      minWidth: '50px',
                      paddingTop: '2px',
                    }}
                  >
                    {s.time}
                  </div>

                  {/* Timeline dot + line */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '12px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#6b7280' : isOngoing ? '#fbbf24' : '#059669',
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                    {i < mySchedule.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          flex: 1,
                          backgroundColor: '#1f2937',
                          marginTop: '4px',
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: i < mySchedule.length - 1 ? '4px' : '0' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontWeight: 500,
                        marginBottom: '2px',
                      }}
                    >
                      {s.day}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#fff',
                      }}
                    >
                      {s.student}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: isOngoing ? '#fbbf24' : '#6b7280',
                      }}
                    >
                      {isDone ? `${s.course} — Selesai` : isOngoing ? <>{s.course} — Sedang berlangsung <span style={{ fontWeight: 600, color: '#34d399' }}>{timerDisplay[s.id] || "00:00"}</span></> : s.course}
                    </div>
                  </div>

                  {/* Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: isMobile ? '100%' : 'auto',
                    }}
                  >
                    {!isDone && (
                      <button
                        onClick={() => {
                          if (isOngoing) {
                            setSessionStatus((prev) => ({ ...prev, [s.id]: "completed" }));
                          } else {
                            setSessionStatus((prev) => ({ ...prev, [s.id]: "ongoing" }));
                            setSessionStart((prev) => ({ ...prev, [s.id]: Date.now() }));
                          }
                        }}
                        style={{
                          backgroundColor: isOngoing ? '#1e3a2f' : '#059669',
                          color: isOngoing ? '#34d399' : '#fff',
                          border: isOngoing ? '1px solid #34d399' : 'none',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          width: isMobile ? '100%' : 'auto',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isOngoing ? '#2a4a3f' : '#047857';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isOngoing ? '#1e3a2f' : '#059669';
                        }}
                      >
                        {isOngoing ? "Selesai" : "Mulai"}
                      </button>
                    )}
                    {isDone && (
                      <div
                        style={{
                          textAlign: 'right',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#6b7280',
                          }}
                        >
                          ✓ {Math.ceil((Date.now() - (sessionStart[s.id] || Date.now())) / 60000)}m
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}

        {/* ─── MURID ─── */}
        {active === "Murid" && (
          <>
            {/* Filter tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}
            >
              {["Semua Hari", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterDay(tab === "Semua Hari" ? null : tab)}
                  style={{
                    backgroundColor: filterDay === (tab === "Semua Hari" ? null : tab) ? '#1f2937' : 'transparent',
                    color: filterDay === (tab === "Semua Hari" ? null : tab) ? '#fff' : '#9ca3af',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    padding: isMobile ? '6px 12px' : '8px 16px',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: filterDay === (tab === "Semua Hari" ? null : tab) ? 600 : 400,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (filterDay !== (tab === "Semua Hari" ? null : tab)) e.currentTarget.style.backgroundColor = '#1a1a2e';
                  }}
                  onMouseLeave={(e) => {
                    if (filterDay !== (tab === "Semua Hari" ? null : tab)) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Single table */}
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  minWidth: isMobile ? '500px' : 'auto',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#1a1a2e' }}>
                    {["Hari", "Jam", "Nama", "Kursus", "Mulai", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: isMobile ? '8px 10px' : '10px 16px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => {
                    const filtered = myStudents.filter((s) => s.day === day && (!filterDay || s.day === filterDay));
                    if (filtered.length === 0) return null;

                    return (
                      <React.Fragment key={day}>
                        {filtered.map((s, si) => (
                          <tr
                            key={s.name}
                            style={{
                              borderTop: '1px solid #1f2937',
                              backgroundColor: si === 0 ? '#0f172a' : 'transparent',
                            }}
                          >
                            {si === 0 && (
                              <td
                                rowSpan={filtered.length}
                                style={{
                                  padding: isMobile ? '8px 10px' : '10px 16px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: '#059669',
                                  verticalAlign: 'top',
                                  paddingTop: '14px',
                                }}
                              >
                                {day}
                              </td>
                            )}
                            <td
                              style={{
                                padding: isMobile ? '8px 10px' : '10px 16px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#059669',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {s.time}
                            </td>
                            <td
                              style={{
                                padding: isMobile ? '8px 10px' : '10px 16px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#fff',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {s.name}
                            </td>
                            <td
                              style={{
                                padding: isMobile ? '8px 10px' : '10px 16px',
                                fontSize: '14px',
                                color: '#d1d5db',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {s.course}
                            </td>
                            <td
                              style={{
                                padding: isMobile ? '8px 10px' : '10px 16px',
                                fontSize: '14px',
                                color: '#6b7280',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {s.startDate}
                            </td>
                            <td
                              style={{
                                padding: isMobile ? '8px 10px' : '10px 16px',
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor: s.status === "Aktif" ? '#1e3a2f' : '#3a2a1e',
                                  color: s.status === "Aktif" ? '#34d399' : '#fbbf24',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: isMobile ? '11px' : '12px',
                                  fontWeight: 500,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ─── LAPORAN ─── */}
        {active === "Laporan" && (
          <>
            {/* Stat cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {attendanceStats.map((s) => (
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
                      color: s.label === "Alpha" ? '#ef4444' : s.label === "Kehadiran" ? '#34d399' : '#fff',
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

            {/* Rekap Kehadiran */}
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #1f2937',
                }}
              >
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Rekap Kehadiran — September 2026
                </h2>
              </div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#1a1a2e' }}>
                    {["Nama", "Kursus", "Total Sesi", "Hadir", "Alpha", "% Kehadiran"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '10px 20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map((s) => (
                    <tr
                      key={s.name}
                      style={{
                        borderTop: '1px solid #1f2937',
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#fff',
                        }}
                      >
                        {s.name}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: '#d1d5db',
                        }}
                      >
                        {s.course}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: '#d1d5db',
                        }}
                      >
                        {s.total}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: '#34d399',
                          fontWeight: 600,
                        }}
                      >
                        {s.hadir}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: s.alpha > 0 ? '#ef4444' : '#6b7280',
                          fontWeight: s.alpha > 0 ? 600 : 400,
                        }}
                      >
                        {s.alpha}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: 700,
                          color:
                            parseFloat(s.pct) >= 90
                              ? '#34d399'
                              : parseFloat(s.pct) >= 80
                              ? '#fbbf24'
                              : '#ef4444',
                        }}
                      >
                        {s.pct}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Log Sesi */}
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #1f2937',
                }}
              >
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Log Sesi Mengajar
                </h2>
              </div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#1a1a2e' }}>
                    {["Tanggal", "Hari", "Murid", "Jam", "Durasi", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '10px 20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
              // Gabung sesi lalu + sesi hari ini yang sudah selesai
              const todayDone = scheduleToday
                .filter((s) => sessionStatus[s.id] === "completed")
                .map((s) => ({
                  id: s.id,
                  date: "Hari ini",
                  day: s.day,
                  student: s.student,
                  time: s.time,
                  duration: `${Math.ceil((Date.now() - (sessionStart[s.id] || Date.now())) / 60000)}m`,
                }));
              const allLogs = [...todayDone, ...myPastSessions];
              return allLogs.map((s, i) => (
                    <tr
                      key={i}
                      style={{
                        borderTop: '1px solid #1f2937',
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: '#6b7280',
                        }}
                      >
                        {s.date}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: '#d1d5db',
                        }}
                      >
                        {s.day}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#fff',
                        }}
                      >
                        {s.student}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: '#d1d5db',
                        }}
                      >
                        {s.time}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          color: '#6b7280',
                        }}
                      >
                        {s.duration}
                      </td>
                      <td
                        style={{
                          padding: '10px 20px',
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: '#1e3a2f',
                            color: '#34d399',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          Selesai
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ─── Placeholder untuk menu lain ─── */}
        {active !== "Beranda" && active !== "Murid" && active !== "Laporan" && (
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0,
              }}
            >
              Halaman {active.toLowerCase()} akan segera tersedia
            </p>
          </div>
        )}
      </main>
    </div>
  );
}