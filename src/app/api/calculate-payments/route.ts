import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { month } = await request.json();
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return Response.json({ error: "Format bulan: YYYY-MM" }, { status: 400 });
    }

    // 1. Ambil semua guru aktif
    const { data: teachers } = await supabase
      .from("teachers")
      .select("id, name");

    if (!teachers || teachers.length === 0) {
      return Response.json({ message: "Tidak ada guru", data: [] });
    }

    const year = parseInt(month.split("-")[0]);
    const monthNum = parseInt(month.split("-")[1]);
    const startDate = `${month}-01`;
    const endDate = new Date(year, monthNum, 0).toISOString().slice(0, 10);

    const results: any[] = [];

    for (const teacher of teachers) {
      // 2. Ambil kursus guru ini
      const { data: courses } = await supabase
        .from("courses")
        .select("id, name")
        .eq("teacher_id", teacher.id);

      const courseIds = (courses || []).map((c: any) => c.id);
      if (courseIds.length === 0) continue;

      // 3. Ambil semua sesi hadir bulan ini untuk kursus guru
      const { data: sessions } = await supabase
        .from("sessions")
        .select(`
          id, status, date, created_at, notes, schedule_id,
          schedules!inner(
            id, student_id, day, time,
            courses!inner(id, name)
          )
        `)
        .in("schedules.course_id", courseIds)
        .eq("status", "hadir")
        .gte("date", startDate)
        .lte("date", endDate);

      const sessionList = sessions || [];

      // 4. Hitung per-sesi dan ambil SPP masing-masing murid
      let totalTeacherShare = 0;
      let regularCount = 0;
      let addOnCount = 0;

      if (sessionList.length > 0) {
        // Ambil SPP untuk semua murid yang terlibat di bulan ini
        const studentIds = [...new Set(sessionList.map((s: any) => s.schedules?.student_id))].filter(Boolean);
        const sppMap: Record<string, number> = {};

        if (studentIds.length > 0) {
          const { data: sppData } = await supabase
            .from("spp")
            .select("student_id, amount")
            .eq("month", month)
            .in("student_id", studentIds);

          for (const s of (sppData || [])) {
            sppMap[s.student_id] = s.amount;
          }
        }

        // 5. Cek override type='add' untuk sessions ini
        const { data: overrides } = await supabase
          .from("schedule_overrides")
          .select("schedule_id, type, temp_date")
          .eq("status", "confirmed")
          .in("schedule_id", sessionList.map(s => s.schedule_id));
        
        const overrideAddSet = new Set(
          (overrides || []).filter((o: any) => o.type === "add").map((o: any) => `${o.schedule_id}-${o.temp_date}`)
        );

        for (const ses of sessionList) {
          const sched = ses.schedules as any;
          const studentId = sched?.student_id;
          const sppAmount = sppMap[studentId] || 0;
          const perSessionValue = sppAmount > 0 ? Math.round((sppAmount / 4) * 0.6) : 0;
          totalTeacherShare += perSessionValue;
          const sesDate = ses.date;
          const key = `${ses.schedule_id}-${sesDate}`;
          if (overrideAddSet.has(key as string)) {
            addOnCount++;
          } else {
            regularCount++;
          }
        }
      }

      results.push({
          teacher_id: teacher.id,
          teacher_name: teacher.name,
          regular_sessions: regularCount,
          add_on_sessions: addOnCount,
          total_sessions: regularCount + addOnCount,
          total_teacher_share: totalTeacherShare,
          status: "pending",
        });
    }

    // Simpan ke database
    for (const r of results) {
      // Upsert: kalau sudah ada record untuk teacher+bulan ini, update
      const { data: existing } = await supabase
        .from("teacher_payments")
        .select("id")
        .eq("teacher_id", r.teacher_id)
        .eq("month", month);

      if (existing && existing.length > 0) {
        await supabase
          .from("teacher_payments")
          .update({
            regular_sessions: r.regular_sessions,
            add_on_sessions: r.add_on_sessions,
            total_sessions: r.total_sessions,
            total_teacher_share: r.total_teacher_share,
          })
          .eq("id", existing[0].id);
        r.id = existing[0].id;
      } else {
        const { data: inserted } = await supabase
          .from("teacher_payments")
          .insert({
            teacher_id: r.teacher_id,
            month,
            regular_sessions: r.regular_sessions,
            add_on_sessions: r.add_on_sessions,
            total_sessions: r.total_sessions,
            total_teacher_share: r.total_teacher_share,
          })
          .select("id");
        if (inserted && inserted[0]) r.id = inserted[0].id;
      }
    }

    return Response.json({ data: results });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}