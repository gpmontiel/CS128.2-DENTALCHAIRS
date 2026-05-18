import { supabase } from "../../../utils/supabase";

export type StudentProfileRow = {
  student_id: string;

  profiles: {
    first_name: string;
    last_name: string;
    pfp: string | null;
  };

  clinician: {
    student_number: string;
    year_level: string;
    student_groups: {
      group_name: string;
    } | null;
  } | null;
};

export const fetchStudentProfilesService = async (
  selectedGroup?: string,
  search?: string
): Promise<StudentProfileRow[]> => {
  // =========================
  // STEP 1: FETCH ALL PROFILES
  // =========================
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select(`
      profile_id,
      first_name,
      last_name,
      pfp,
      role_id
    `).eq("role_id", 3);;

  if (profileError) throw profileError;

  const profileIds = (profiles || []).map((p) => p.profile_id);

  // =========================
  // STEP 2: FETCH CLINICIANS
  // =========================
  const { data: clinicians } = await supabase
    .from("clinician")
    .select(`
      clinician_id,
      student_number,
      year_level,
      group_id
    `)
    .in("clinician_id", profileIds);

  const clinicianMap = new Map<string, any>();
  (clinicians || []).forEach((c: any) => {
    clinicianMap.set(c.clinician_id, c);
  });

  // =========================
  // STEP 3: FETCH GROUPS
  // =========================
  const groupIds = [
    ...new Set((clinicians || []).map((c: any) => c.group_id)),
  ];

  const { data: groups } = await supabase
    .from("student_groups")
    .select(`
      group_id,
      group_name
    `)
    .in("group_id", groupIds);

  const groupMap = new Map<string, any>();
  (groups || []).forEach((g: any) => {
    groupMap.set(g.group_id, g);
  });

  // =========================
  // STEP 4: MERGE INTO UNIQUE STUDENTS
  // =========================
  const result: StudentProfileRow[] = (profiles || []).map((p: any) => {
    const clinician = clinicianMap.get(p.profile_id);
    const group = groupMap.get(clinician?.group_id);

    return {
      student_id: p.profile_id,

      profiles: {
        first_name: p.first_name,
        last_name: p.last_name,
        pfp: p.pfp,
      },

      clinician: clinician
        ? {
            student_number: clinician.student_number,
            year_level: clinician.year_level,
            student_groups: group
              ? { group_name: group.group_name }
              : null,
          }
        : null,
    };
  });

  // =========================
  // STEP 5: FILTERING
  // =========================
  return result.filter((item) => {
    const fullName =
      `${item.profiles.first_name} ${item.profiles.last_name}`.toLowerCase();

    if (search && !fullName.includes(search.toLowerCase())) return false;

    if (
      selectedGroup &&
      selectedGroup !== "All Student Groups" &&
      item.clinician?.student_groups?.group_name !== selectedGroup
    ) {
      return false;
    }

    return true;
  });
};