-- Perbaiki jadwal — tiap murid jam berbeda
UPDATE schedules SET time = '14:00 WITA' WHERE id = (SELECT s.id FROM schedules s JOIN students st ON s.student_id = st.id WHERE st.name = 'Andi Pratama' AND s.day = 'Senin' LIMIT 1);
UPDATE schedules SET time = '15:00 WITA' WHERE id = (SELECT s.id FROM schedules s JOIN students st ON s.student_id = st.id WHERE st.name = 'Siti Nurhaliza' AND s.day = 'Senin' LIMIT 1);
UPDATE schedules SET time = '16:00 WITA' WHERE id = (SELECT s.id FROM schedules s JOIN students st ON s.student_id = st.id WHERE st.name = 'Budi Santoso' AND s.day = 'Senin' LIMIT 1);
UPDATE schedules SET time = '17:00 WITA' WHERE id = (SELECT s.id FROM schedules s JOIN students st ON s.student_id = st.id WHERE st.name = 'Dian Permata' AND s.day = 'Senin' LIMIT 1);