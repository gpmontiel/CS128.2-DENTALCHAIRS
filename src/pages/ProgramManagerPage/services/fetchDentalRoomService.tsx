import { supabase } from "../../../utils/supabase.ts";

export const fetchDentalRoomService = async () => {
  const { data, error } = await supabase
    .from("sections")
    .select(`
      section_id,
      section_name,
      chair_count,
      rooms (
        room_id,
        room_name
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};