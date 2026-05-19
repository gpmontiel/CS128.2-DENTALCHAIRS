import { supabase } from "../../../utils/supabase";

export const fetchChairUsageService = async (roomName?: string) => {
  let query = supabase
    .from("attendance")
    .select(`
      attendance_id,
      status,
      request_id,
      dental_chairs_request_assignment!inner (
        request_id,
        status,
        date,
        shift,
        section_id,
        sections!inner (
          section_id,
          section_name,
          room_id,
          rooms!inner (
            room_name
          )
        )
      )
    `)
    .eq("status", "Present")
    .eq("dental_chairs_request_assignment.status", "Accepted");

  if (roomName) {
    query = query.eq(
      "dental_chairs_request_assignment.sections.rooms.room_name",
      roomName
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    attendance_id: row.attendance_id,
    status: row.status,
    request_id: row.request_id,

    dental_chairs_request_assignment:
      Array.isArray(row.dental_chairs_request_assignment)
        ? row.dental_chairs_request_assignment[0]
        : row.dental_chairs_request_assignment,
  }));
};