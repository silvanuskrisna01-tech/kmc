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

      // 3. Ambil semua jadwal untuk kursus guru ini (dengan data murid)
      const { data: schedules } = await supabase
        .from("schedules")
        .select("id, student_id, day, time, students!inner(id, name)")
        .in("course_id", courseIds);

      const schedList = schedules || [];
      if (schedList.length === 0) continue;

      // 4. Ambil SPP murid-murid ini untuk bulan ini
      const studentIds = [...new Set(schedList.map((s: any) => s.student_id))].filter(Boolean);
      const { data: sppData } = await supabase
        .from("spp")
        .select("student_id, amount")
        .eq("month", month)
        .in("student_id", studentIds);
      const sppMap: Record<string, number> = {};
      for (const s of (sppData || [])) sppMap[s.student_id] = s.amount;

      // 5. Ambil override type='add' untuk jadwal ini di bulan ini
      const schedIds = schedList.map((s: any) => s.id);
      const { data: overrides } = await supabase
        .from("schedule_overrides")
        .select("schedule_id, temp_date, type")
        .eq("status", "confirmed")
        .eq("type", "add")
        .in("schedule_id", schedIds)
        .gte("temp_date", startDate)
        .lte("temp_date", endDate);
      
      const addonCountBySched: Record<string, number> = {};
      for (const o of (overrides || [])) {
        addonCountBySched[o.schedule_id] = (addonCountBySched[o.schedule_id] || 0) + 1;
      }

      // 6. Hitung per murid
      // Pertama: hitung total jadwal per murid (sebulan) untuk tau per-session SPP
      let totalTeacherShare = 0;
      let regularCount = 0;
      let addOnCount = 0;

      // Kelompokkan jadwal per murid
      const schedByStudent: Record<string, typeof schedList> = {};
      for (const s of schedList) {
        if (!schedByStudent[s.student_id]) schedByStudent[s.student_id] = [];
        schedByStudent[s.student_id].push(s);
      }

      for (const [studentId, studentScheds] of Object.entries(schedByStudent)) {
        const sppAmount = sppMap[studentId] || 0;
        if (sppAmount <= 0) continue; // skip kalo SPP belum diinput

        // Total jadwal untuk murid ini (4 sesi per jadwal reguler)
        const totalRegular = studentScheds.length * 4;

        // Per-session SPP = SPP total dibagi total sesi reguler
        const perSessionValue = Math.round((sppAmount / totalRegular) * 0.6);

        // Guru MR DICKY ngajar semua jadwal ini
        totalTeacherShare += perSessionValue * totalRegular;
        regularCount += totalRegular;

        // Add-on untuk jadwal murid ini
        for (const sched of studentScheds) {
          const addons = addonCountBySched[sched.id] || 0;
          if (addons > 0) {
            totalTeacherShare += perSessionValue * addons;
            addOnCount += addons;
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