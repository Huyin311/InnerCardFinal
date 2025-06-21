import { supabase } from "../../supabase/supabaseClient";

export async function logGroupActivity({
  group_id,
  activity_type,
  content,
  created_by,
}: {
  group_id: number;
  activity_type: string;
  content: string;
  created_by?: string;
}) {
  await supabase
    .from("group_activities")
    .insert([{ group_id, activity_type, content, created_by }]);
}
