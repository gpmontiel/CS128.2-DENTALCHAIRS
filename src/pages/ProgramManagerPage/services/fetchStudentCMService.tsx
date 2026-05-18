import { supabase } from "../../../utils/supabase.ts";

export interface ChairManagerStudent {
  student_id: number;
  first_name: string;
  last_name: string;
  pfp: string | null;
  student_number: string;
  group_name: string;
}

export const fetchStudentCMService = async (
  selectedGroup: string,
  search: string
): Promise<ChairManagerStudent[]> => {
  // -----------------------------
  // 1. FETCH ASSIGNMENTS + PROFILES
  // -----------------------------
  const { data: assignments, error: assignmentError } = await supabase
    .from("chair_manager_assignment")
    .select(`
      student_id,
      status,
      profiles (
        first_name,
        last_name,
        pfp
      )
    `)
    .eq("status", "Confirmed");

  if (assignmentError) {
    console.error("❌ ASSIGNMENT ERROR:", assignmentError);
    throw assignmentError;
  }

  // -----------------------------
  // 2. FETCH CLINICIAN + GROUP DATA
  // -----------------------------
  const { data: clinicians, error: clinicianError } = await supabase
    .from("clinician")
    .select(`
      clinician_id,
      student_number,
      group_id,
      student_groups (
        group_name
      )
    `);

  if (clinicianError) {
    console.error("❌ CLINICIAN ERROR:", clinicianError);
    throw clinicianError;
  }

  // -----------------------------
  // 3. CREATE LOOKUP MAPS
  // -----------------------------
  const clinicianMap = new Map<number, any>();

  clinicians?.forEach((c: any) => {
    clinicianMap.set(c.clinician_id, c);
  });

  const resultMap = new Map<number, ChairManagerStudent>();

  // -----------------------------
  // 4. MERGE DATA
  // -----------------------------
  assignments?.forEach((item: any) => {
    const clinician = clinicianMap.get(item.student_id);
    const firstName = item.profiles?.first_name || "";
    const lastName = item.profiles?.last_name || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();

    // SEARCH FILTER (client-side)
    if (
      search.trim() !== "" &&
      !fullName.includes(search.toLowerCase())
    ) {
      return;
    }

    // GROUP FILTER (client-side safe)
    const groupName =
      clinician?.student_groups?.group_name || "";

    if (
      selectedGroup !== "All Student Groups" &&
      groupName !== selectedGroup
    ) {
      return;
    }

    if (resultMap.has(item.student_id)) return;

    resultMap.set(item.student_id, {
      student_id: item.student_id,
      first_name: firstName,
      last_name: lastName,
      pfp: item.profiles?.pfp || null,
      student_number: clinician?.student_number || "",
      group_name: groupName,
    });
  });

  const finalResult = Array.from(resultMap.values());
  console.log("🟣 FINAL RESULT:", finalResult);
  return finalResult;
};