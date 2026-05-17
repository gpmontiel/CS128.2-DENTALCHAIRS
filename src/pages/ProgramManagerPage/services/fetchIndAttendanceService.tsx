import { supabase } from "../../../utils/supabase";

export type AttendanceRow = {
  assignment_id: string;
  date: string;
  shift: string;

  profiles: {
    first_name: string;
    last_name: string;
    pfp: string | null;
  } | null; // Supabase relationships can return null if empty

  sections: {
    section_name: string;
    chair_count: number;
    rooms: {
      room_name: string;
    } | null; // Changed from array to match your actual 1:1 data structure if applicable
  } | null;
};

export type ClinicianInfo = {
  student_number: string;
  year_level: string;
  student_groups: {
    group_name: string;
  } | null;
};

export type AttendanceWithClinician = AttendanceRow & {
  clinician?: ClinicianInfo;
};

export const fetchStudentAttendanceService = async (
  studentId: string
): Promise<AttendanceWithClinician[]> => {
  // 1. Fetch assignments
  const { data: assignments, error: assignmentError } = await supabase
    .from("chair_manager_assignment")
    .select(`
      assignment_id,
      date,
      shift,
      profiles ( first_name, last_name, pfp ),
      sections (
        section_name,
        chair_count,
        rooms ( room_name )
      )
    `)
    .eq("student_id", studentId)
    .eq("status", "Confirmed");

  if (assignmentError) {
    console.error("Supabase error (assignments):", assignmentError);
    throw new Error(assignmentError.message);
  }

  // FIX: Map and safely cast the nested room array to an object if it's a 1:1 relationship
  const safeAssignments: AttendanceRow[] = (assignments ?? []).map((item: any) => ({
    ...item,
    sections: item.sections
      ? {
          ...item.sections,
          // Supabase returns nested relations as arrays. Grab the first element.
          rooms: Array.isArray(item.sections.rooms)
            ? item.sections.rooms[0] ?? null
            : item.sections.rooms ?? null,
        }
      : null,
  }));

  // 2. Fetch clinician separately
  const { data: clinician, error: clinicianError } = await supabase
    .from("clinician")
    .select(`
      student_number,
      year_level,
      student_groups ( group_name )
    `)
    .eq("clinician_id", studentId)
    .maybeSingle();

  if (clinicianError) {
    console.error("Supabase error (clinician):", clinicianError);
    throw new Error(clinicianError.message);
  }

  // 3. Merge manually
  const result: AttendanceWithClinician[] = safeAssignments.map((item) => ({
    ...item,
    clinician: clinician
      ? {
          student_number: clinician.student_number,
          year_level: clinician.year_level,
          student_groups: Array.isArray(clinician.student_groups)
            ? clinician.student_groups[0] ?? null
            : clinician.student_groups ?? null,
        }
      : undefined,
  }));

  return result;
};