"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const MENU = [
  "Beranda",
  "Murid",
  "Laporan",
];

type AttendanceStat = { student: string; course: string; total: number; hadir: number; alpha: number; pct: string };
type ScheduleItem = { id: number; day: string; time: string; student: string; course: string; isOverride?: boolean };
type StudentItem = { name: string; course: string; day: string; time: string };

export default function TeacherDashboard() {
  const [active, setActive] = useState("Beranda");
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [filterDay, setFilterDay] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<Record<number, string>>({});
  const [sessionStart, setSessionStart] = useState<Record<number, number>>({});
  const [timerDisplay, setTimerDisplay] = useState<Record<number, string>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Data dari Supabase
  const [myCourses, setMyCourses] = useState<string[]>([]);
  const [mySchedule, setMySchedule] = useState<ScheduleItem[]>([]);
  const [myStudents, setMyStudents] = useState<StudentItem[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [scheduleOverrides, setScheduleOverrides] = useState<Record<string, any>>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Baca session + fetch data dari Supabase
  useEffect(() => {
    const raw = localStorage.getItem("kmc_teacher_session");
    if (!raw) { window.location.href = "/guru/masuk"; return; }

    let session: { id: string; name: string };
    try {
      session = JSON.parse(raw);
      if (!session.id || !session.name) throw new Error();
    } catch {
      window.location.href = "/guru/masuk";
      return;
    }

    setTeacherName(session.name);
    setTeacherId(session.id);

    const fetchData = async () => {
      setLoading(true);

      // 1. Ambil kursus guru ini
      const { data: courses } = await supabase
        .from("courses")
        .select("id, name")
        .eq("teacher_id", session.id);

      const courseList = courses || [];
      const courseNames = courseList.map((c) => c.name);
      const courseIds = courseList.map((c) => c.id);
      setMyCourses(courseNames);

      if (courseIds.length === 0) {
        setMySchedule([]);
        setMyStudents([]);
        setMyAttendance([]);
        setLoading(false);
        return;
      }

      // 2. Ambil jadwal (schedules) untuk kursus-kursus ini
      const { data: schedules } = await supabase
        .from("schedules")
        .select("id, day, time, courses!inner(name), students!inner(name)")
        .in("course_id", courseIds);

      const schedList: ScheduleItem[] = (schedules || []).map((s: any) => ({
        id: s.id,
        day: s.day,
        time: s.time,
        student: s.students?.name || "",
        course: s.courses?.name || "",
      }));
      setMySchedule(schedList);

      // 3. Daftar murid unik per kursus
      const seen = new Set<string>();
      const uniqueStudents: StudentItem[] = [];
      for (const s of schedList) {
        const key = `${s.student}-${s.course}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueStudents.push({ name: s.student, course: s.course, day: s.day, time: s.time });
        }
      }
      setMyStudents(uniqueStudents);

      // 4. Ambil sesi/absensi untuk semua jadwal guru ini
      const { data: sessions } = await supabase
        .from("sessions")
        .select("status, date, schedules!inner(id, course_id, courses!inner(name), students!inner(name))")
        .in("schedules.course_id", courseIds);

      // Hitung statistik per murid & tandai jadwal yg sdh ada sesinya
            const statsMap: Record<string, { total: number; hadir: number; alpha: number; course: string }> = {};
            const completedStatus: Record<number, string> = {};
            const todayDate = new Date().toISOString().slice(0, 10);
            for (const ses of (sessions as any[] || [])) {
              const schedule = ses.schedules;
              const studentName = schedule?.students?.name || "";
              const courseName = schedule?.courses?.name || "";
              const key = `${studentName}||${courseName}`;
              if (!statsMap[key]) {
                statsMap[key] = { total: 0, hadir: 0, alpha: 0, course: courseName };
              }
              statsMap[key].total += 1;
              if (ses.status === "hadir" || ses.status === "selesai") statsMap[key].hadir += 1;
              else if (ses.status === "alpha") statsMap[key].alpha += 1;
              // Tandai jadwal yg sdh ada sesi hari ini sebagai completed
              if (ses.date === todayDate && schedule?.id) {
                completedStatus[schedule.id] = "completed";
              }
            }
            setSessionStatus(completedStatus);

      // 5. Ambil jadwal sementara (overrides) untuk hari ini
      const todayDateStr = new Date().toISOString().slice(0, 10);
      const { data: overrides } = await supabase
        .from("schedule_overrides")
        .select("schedule_id, temp_date, temp_day, temp_time, reason, status")
        .eq("status", "confirmed")
        .gte("temp_date", todayDateStr);
      const overrideMap: Record<string, any> = {};
      for (const ov of (overrides as any[] || [])) {
        overrideMap[ov.schedule_id] = ov;
      }
      setScheduleOverrides(overrideMap);

      const attData: AttendanceStat[] = Object.entries(statsMap).map(([key, val]) => {
        const studentName = key.split("||")[0];
        const pct = val.total > 0 ? ((val.hadir / val.total) * 100).toFixed(1) + "%" : "0%";
        return { student: studentName, course: val.course, total: val.total, hadir: val.hadir, alpha: val.alpha, pct };
      });
      setMyAttendance(attData);

      setLoading(false);
    };

    fetchData();
  }, []);

  // Stats personal
  const dayMap: Record<string, string> = { "Sunday":"Minggu","Monday":"Senin","Tuesday":"Selasa","Wednesday":"Rabu","Thursday":"Kamis","Friday":"Jumat","Saturday":"Sabtu" };
  const todayName = dayMap[new Date().toLocaleDateString("en-US", { weekday: "long" })] || "Senin";

  const todaySchedule = mySchedule
      .filter(s => s.day === todayName)
      .sort((a, b) => a.time.localeCompare(b.time))
      .filter((s, i, arr) => i === 0 || s.id !== arr[i-1].id || s.time !== arr[i-1].time);

    // Tambah jadwal override untuk hari ini
    const todayDateStr = new Date().toISOString().slice(0, 10);
    const overrideToday = Object.entries(scheduleOverrides)
      .filter(([_, ov]) => (ov as any).temp_date === todayDateStr)
      .map(([schedId, ov]) => {
        const orig = mySchedule.find(s => String(s.id) === schedId);
        return orig ? { ...orig, time: (ov as any).temp_time, isOverride: true } : null;
      })
      .filter(Boolean) as ScheduleItem[];
  
    const todayScheduleFinal = [...todaySchedule, ...overrideToday]
      .sort((a, b) => a.time.localeCompare(b.time));

  const myStats = [
    { label: "Total Murid", value: myStudents.length },
    { label: "Kursus Aktif", value: myCourses.length },
    { label: "Jadwal Hari Ini", value: todayScheduleFinal.filter(s => !scheduleOverrides[s.id] || scheduleOverrides[s.id].temp_date === new Date().toISOString().slice(0, 10) || s.isOverride).length },
    { label: "Total Sesi", value: myAttendance.reduce((sum, a) => sum + a.total, 0) },
  ];

  // Live timer
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
                {teacherName || "Panel Guru"}
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
              {todayScheduleFinal.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Tidak ada jadwal hari ini.</p>
              ) : (
                todayScheduleFinal.map((s, i) => {
                  const status = sessionStatus[s.id] || "scheduled";
                  const isOngoing = status === "ongoing";
                  const isDone = status === "completed";
                  const ov = scheduleOverrides[s.id];
                  const isRescheduled = ov && ov.temp_date !== todayDateStr && !s.isOverride;
                  const isOverrideItem = s.isOverride || false;

                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        gap: isMobile ? '8px' : '16px',
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        padding: '0 0 12px 0',
                        marginBottom: i < todayScheduleFinal.length - 1 ? '12px' : '0',
                        borderBottom: i < todayScheduleFinal.length - 1 ? '1px solid #1f2937' : 'none',
                        position: 'relative',
                        opacity: isDone || isRescheduled ? 0.5 : 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isDone || isRescheduled ? '#6b7280' : '#059669',
                          minWidth: '50px',
                          paddingTop: '2px',
                        }}
                      >
                        {s.time}
                      </div>

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
                            backgroundColor: isDone || isRescheduled ? '#6b7280' : isOngoing ? '#fbbf24' : isOverrideItem ? '#f59e0b' : '#059669',
                            marginTop: '6px',
                            flexShrink: 0,
                          }}
                        />
                        {i < todayScheduleFinal.length - 1 && (
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

                      <div style={{ flex: 1, paddingBottom: i < todayScheduleFinal.length - 1 ? '4px' : '0' }}>
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
                                                  {isRescheduled ? <>{s.course} — <span style={{ color: '#fbbf24', fontWeight: 600 }}>Ganti → {ov.temp_day} {ov.temp_time}</span></> : isDone ? `${s.course} — Selesai` : isOngoing ? <>{s.course} — Sedang berlangsung <span style={{ fontWeight: 600, color: '#34d399' }}>{timerDisplay[s.id] || "00:00"}</span></> : isOverrideItem ? <><span style={{ color: '#f59e0b', fontWeight: 600 }}>🟡 Jadwal Sementara</span> — {s.course}</> : s.course}
                                                                          </div>
                                                                          {/* Badge info untuk rescheduled / override */}
                                                                          {!isRescheduled && ov && !isOverrideItem && (
                                                                            <div style={{ marginTop: '4px' }}>
                                                    <span style={{
                                                      display: 'inline-block', padding: '2px 8px', borderRadius: '6px',
                                                      fontSize: '11px', fontWeight: 600, backgroundColor: '#3f2f1f', color: '#fbbf24',
                                                    }}>
                                                      🟡 Ganti → {scheduleOverrides[s.id].temp_day} {scheduleOverrides[s.id].temp_time}
                                                      {scheduleOverrides[s.id].reason ? ` (${scheduleOverrides[s.id].reason})` : ''}
                                                    </span>
                                                  </div>
                                                )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: isMobile ? '100%' : 'auto',
                        }}
                      >
                        {!isDone && !isRescheduled && (
                                                  <button
                                                    onClick={() => {
                                                      if (isOngoing) {
                                                        setSessionStatus((prev) => ({ ...prev, [s.id]: "completed" }));
                                                        // Simpan sesi ke database
                                                        supabase.from("sessions").insert({
                                                          schedule_id: s.id,
                                                          date: new Date().toISOString().slice(0, 10),
                                                          status: "hadir",
                                                          notes: `${Math.ceil((Date.now() - (sessionStart[s.id] || Date.now())) / 60000)}m`,
                                                        }).then();
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
                        {isDone && !isRescheduled && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              ✓ {Math.ceil((Date.now() - (sessionStart[s.id] || Date.now())) / 60000)}m
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ─── MURID ─── */}
        {active === "Murid" && (
          <>
            {/* Group by day */}
            {(() => {
              const dayOrder = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
              const grouped: Record<string, typeof myStudents> = {};
              for (const s of myStudents) {
                if (!grouped[s.day]) grouped[s.day] = [];
                grouped[s.day].push(s);
              }

              return dayOrder.map(day => {
                const items = grouped[day];
                if (!items || items.length === 0) return null;
                return (
                  <div key={day}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #1f2937',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#059669',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span>{day}</span>
                      <span style={{ fontSize: '12px', fontWeight: 400, color: '#6b7280' }}>
                        {items.length} murid
                      </span>
                    </div>
                    {items.map((s, i) => (
                      <div key={`${s.name}-${s.course}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: i < items.length - 1 ? '1px solid #1f2937' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: '#fff', fontWeight: 500, fontSize: '14px' }}>{s.name}</span>
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>{s.course}</span>
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>{s.time}</span>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
            {myStudents.length === 0 && (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada murid.</p>
            )}
          </>
        )}

        {/* ─── LAPORAN ─── */}
        {active === "Laporan" && (
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
              Laporan Kehadiran
            </h2>
            {myAttendance.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Belum ada data kehadiran.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1f2937' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9ca3af', fontWeight: 500 }}>Nama</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9ca3af', fontWeight: 500 }}>Kursus</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: '#9ca3af', fontWeight: 500 }}>Total</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: '#34d399', fontWeight: 500 }}>Hadir</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444', fontWeight: 500 }}>Alpha</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: '#9ca3af', fontWeight: 500 }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendance.map((a, i) => (
                      <tr
                        key={a.student}
                        style={{ borderBottom: i < myAttendance.length - 1 ? '1px solid #1f2937' : 'none' }}
                      >
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{a.student}</td>
                        <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{a.course}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#9ca3af' }}>{a.total}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#34d399', fontWeight: 600 }}>{a.hadir}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444' }}>{a.alpha}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#fff', fontWeight: 600 }}>{a.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}