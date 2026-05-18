import { supabase } from "../../../utils/supabase";

export type AttendanceServiceRow = {
  attendance_id: string;

  student_id: string;
  request_id: string;

  date: string;
  shift: "AM" | "PM";

  profiles: {
    first_name: string;
    last_name: string;
    pfp: string | null;
  } | null;

  clinician: {
    student_number: string;
    year_level: string;
    student_groups: {
      group_name: string;
    } | null;
  } | null;

  sections: {
    section_name: string;
    rooms: {
      room_name: string;
    } | null;
  } | null;
};

// =====================================
// OPTIMIZED: SINGLE STUDENT ATTENDANCE
// =====================================
export const fetchStudentAttendanceService = async (
  studentId: string
): Promise<AttendanceServiceRow[]> => {
  if (!studentId) return [];

  // =========================
  // STEP 1: GET APPROVED REQUESTS (ONLY THIS STUDENT)
  // =========================
  const { data: schedules, error: scheduleError } = await supabase
    .from("dental_chairs_request_assignment")
    .select(`
      request_id,
      student_id,
      date,
      shift,
      section_id
    `)
    .eq("status", "Accepted")
    .eq("student_id", studentId);

  if (scheduleError) throw scheduleError;

  if (!schedules || schedules.length === 0) return [];

  const requestIds = schedules.map((s) => s.request_id);

  // =========================
  // STEP 2: GET ATTENDANCE (ONLY MATCHING REQUESTS)
  // =========================
  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select(`
      attendance_id,
      request_id
    `)
    .eq("status", "Present")
    .in("request_id", requestIds);

  if (attendanceError) throw attendanceError;

  const attendanceMap = new Map(
    (attendance || []).map((a: any) => [a.request_id, a])
  );

  const activeSchedules = schedules.filter((s) =>
    attendanceMap.has(s.request_id)
  );

  if (activeSchedules.length === 0) return [];

  // =========================
  // STEP 3: PROFILE (ONLY ONE STUDENT)
  // =========================
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      profile_id,
      first_name,
      last_name,
      pfp
    `)
    .eq("profile_id", studentId)
    .single();

  // =========================
  // STEP 4: CLINICIAN (ONLY ONE STUDENT)
  // =========================
  const { data: clinician } = await supabase
    .from("clinician")
    .select(`
      clinician_id,
      student_number,
      year_level,
      group_id
    `)
    .eq("clinician_id", studentId)
    .single();

  // =========================
  // STEP 5: GROUP (ONLY IF EXISTS)
  // =========================
  let group = null;

  if (clinician?.group_id) {
    const { data: groupData } = await supabase
      .from("student_groups")
      .select(`group_name`)
      .eq("group_id", clinician.group_id)
      .single();

    group = groupData;
  }

  // =========================
  // STEP 6: SECTIONS (ONLY USED ON SCHEDULES)
  // =========================
  const sectionIds = [
    ...new Set(activeSchedules.map((s) => s.section_id)),
  ];

  const { data: sections } = await supabase
    .from("sections")
    .select(`
      section_id,
      section_name,
      rooms ( room_name )
    `)
    .in("section_id", sectionIds);

  const sectionMap = new Map(
    (sections || []).map((s: any) => [s.section_id, s])
  );

  // =========================
  // STEP 7: FINAL MERGE
  // =========================
  const result: AttendanceServiceRow[] = activeSchedules.map((s: any) => {
    const section = sectionMap.get(s.section_id);
    const att = attendanceMap.get(s.request_id);

    return {
      attendance_id: att.attendance_id,
      student_id: s.student_id,
      request_id: s.request_id,
      date: s.date,
      shift: s.shift,

      profiles: profile
        ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            pfp: profile.pfp,
          }
        : null,

      clinician: clinician
        ? {
            student_number: clinician.student_number,
            year_level: clinician.year_level,
            student_groups: group
              ? { group_name: group.group_name }
              : null,
          }
        : null,

      sections: section
        ? {
            section_name: section.section_name,
            rooms: Array.isArray(section.rooms)
              ? section.rooms[0] ?? null
              : section.rooms ?? null,
          }
        : null,
    };
  });

  return result;
};