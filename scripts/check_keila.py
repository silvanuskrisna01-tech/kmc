from supabase import create_client
import os

# Baca .env.local
with open(os.path.join(os.path.dirname(__file__), '..', '.env.local')) as f:
    env = {}
    for line in f:
        if '=' in line:
            k, v = line.strip().split('=', 1)
            env[k] = v

url = env['NEXT_PUBLIC_SUPABASE_URL']
key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
supabase = create_client(url, key)

# Cari murid Keila
r = supabase.from_('students').select('*').ilike('name', '%keila%').execute()
print('=== STUDENTS ===')
for s in r.data:
    print(s)

if r.data:
    sid = r.data[0]['id']
    # Cari jadwal
    r2 = supabase.from_('schedules').select('*, courses!inner(name, teacher_id)').eq('student_id', sid).execute()
    print('\n=== SCHEDULES ===')
    for s in r2.data:
        print(s)
    
    # Cek session tanggal 2026-10-15
    if r2.data:
        sched_ids = [s['id'] for s in r2.data]
        r3 = supabase.from_('sessions').select('*').in_('schedule_id', sched_ids).eq('date', '2026-10-15').execute()
        print('\n=== SESSIONS ON 2026-10-15 ===')
        print(r3.data if r3.data else '(kosong)')