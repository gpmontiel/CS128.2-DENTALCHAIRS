import { supabase } from "../../../utils/supabase.ts";

export const fetchGroupAttendanceService = async ({
  group,
  startDate,
  endDate,
}: {
  group: string;
  startDate: string;
  endDate: string;
}) => {
  // =========================
  // 1. FETCH ASSIGNMENTS
  // =========================

  console.log("📅 FILTER INPUTS:");
  console.log("startDate (raw):", startDate);
  console.log("endDate (raw):", endDate);
  const { data: assignments, error } = await supabase
    .from("dental_chairs_request_assignment")
    .select(`
      request_id,
      date,
      status,
      student_id,
      section_id,

      attendance!inner (
        status
      ),

      sections (
        section_id,
        rooms (
          room_name
        )
      )
    `)
    .eq("status", "Accepted")
    .eq("attendance.status", "Present")
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    console.error("Supabase assignment error:", error);
    return [];
  }

  if (!assignments?.length) return [];

  // =========================
  // 2. EXTRACT STUDENT IDS
  // =========================
  const studentIds = [...new Set(assignments.map((a) => a.student_id))];

  // =========================
  // 3. FETCH CLINICIANS + PROFILE (FIXED HERE)
  // =========================
  const { data: clinicians, error: clinicianError } = await supabase
    .from("clinician")
    .select(`
      clinician_id,
      group_id,

      student_groups (
        group_name
      ),

      profiles (
        first_name,
        last_name
      )
    `)
    .in("clinician_id", studentIds);

  if (clinicianError) {
    console.error("Supabase clinician error:", clinicianError);
    return [];
  }

  // =========================
  // 4. MAP CLINICIANS
  // =========================
  const clinicianMap: Record<string, any> = {};
  (clinicians || []).forEach((c) => {
    clinicianMap[c.clinician_id] = c;
  });

  // =========================
  // 5. MERGE DATA
  // =========================
  const merged = assignments.map((a: any) => {
    const clinician = clinicianMap[a.student_id] || null;

    return {
      ...a,
      clinician,
    };
  });

  // =========================
  // 6. FILTER BY GROUP
  // =========================
  const filtered = merged.filter((row: any) => {
    const groupName = row?.clinician?.student_groups?.group_name;

    return (
      group === "ALL" ||
      groupName?.toLowerCase?.() === group.toLowerCase()
    );
  });

  // =========================
  // 7. DEBUG (optional)
  // =========================
  console.log("📦 assignments:", assignments);
  console.log("🧑‍⚕️ clinicians:", clinicians);
  console.log("🔗 merged:", merged);
  console.log("🎯 filtered:", filtered);

  return filtered;
};