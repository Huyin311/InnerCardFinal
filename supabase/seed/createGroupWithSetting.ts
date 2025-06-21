import { supabase } from "../supabaseClient";

/**
 * Tạo group mới và tự động tạo record group_settings tương ứng
 */
export async function createGroupWithSettings({
  name,
  description,
  owner_id,
  join_code,
  qr_code,
}: {
  name: string;
  description?: string;
  owner_id: string;
  join_code: string;
  qr_code?: string;
}) {
  // Tạo nhóm
  const { data: group, error } = await supabase
    .from("groups")
    .insert([{ name, description, owner_id, join_code, qr_code }])
    .select()
    .single();

  if (error || !group) throw error || new Error("Cannot create group");

  // Tạo group_settings mặc định
  await supabase.from("group_settings").insert([{ group_id: group.id }]);
  return group;
}
