import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";
import { supabase } from "../../supabase/supabaseClient";
import { AuthContext } from "../../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const ROLE_TEXT = {
  owner: { vi: "Chủ nhóm", en: "Owner" },
  admin: { vi: "Quản trị viên", en: "Admin" },
  member: { vi: "Thành viên", en: "Member" },
};

// Hàm ghi log hoạt động vào group_activities
async function logActivity({
  groupId,
  activity_type,
  content,
  created_by,
}: {
  groupId: number;
  activity_type: string;
  content?: string;
  created_by: string;
}) {
  await supabase.from("group_activities").insert([
    {
      group_id: groupId,
      activity_type,
      content: content || "",
      created_by,
    },
  ]);
}

export default function GroupPermission({ navigation, route }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const { user } = useContext(AuthContext) || {};
  const groupId = route?.params?.groupId;

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<string>("");

  useEffect(() => {
    fetchMembers();
  }, [groupId, user?.id]);

  async function fetchMembers() {
    setLoading(true);
    // JOIN users để lấy tên, avatar
    const { data } = await supabase
      .from("group_members")
      .select(
        "id, role, user_id, joined_at, users: user_id (full_name, avatar_url)",
      )
      .eq("group_id", groupId)
      .order("role", { ascending: true })
      .order("joined_at", { ascending: true });
    setMembers(data || []);
    // Xác định vai trò của chính mình
    const myself = (data || []).find((m: any) => m.user_id === user?.id);
    setMyRole(myself?.role || "");
    setLoading(false);
  }

  // Chủ nhóm được phép thay đổi quyền, admin chỉ xem
  const canEdit = (targetRole: string) =>
    myRole === "owner" && targetRole !== "owner";
  // Không cho chủ nhóm xoá chính mình hoặc thay đổi quyền owner
  const canRemove = (targetId: string, targetRole: string) =>
    myRole === "owner" && targetRole !== "owner" && targetId !== user?.id;

  // Thăng/giáng quyền
  async function updateRole(item: any, newRole: string) {
    if (!canEdit(item.role)) return;
    if (item.role === newRole) return;
    await supabase
      .from("group_members")
      .update({ role: newRole })
      .eq("id", item.id);
    // GHI LOG HOẠT ĐỘNG
    await logActivity({
      groupId,
      activity_type: newRole === "admin" ? "promote" : "demote",
      content:
        newRole === "admin"
          ? `${item.users?.full_name || ""} được thăng lên admin`
          : `${item.users?.full_name || ""} bị giáng xuống member`,
      created_by: user.id,
    });
    fetchMembers();
  }

  // Xoá khỏi nhóm
  async function removeMember(item: any) {
    if (!canRemove(item.user_id, item.role)) return;
    Alert.alert(
      lang === "vi" ? "Xác nhận" : "Confirm",
      lang === "vi"
        ? `Xoá ${item.users?.full_name || ""} khỏi nhóm?`
        : `Remove ${item.users?.full_name || ""} from group?`,
      [
        { text: lang === "vi" ? "Huỷ" : "Cancel", style: "cancel" },
        {
          text: lang === "vi" ? "Xoá" : "Remove",
          style: "destructive",
          onPress: async () => {
            await supabase.from("group_members").delete().eq("id", item.id);
            // GHI LOG HOẠT ĐỘNG
            await logActivity({
              groupId,
              activity_type: "remove",
              content: `${item.users?.full_name || ""} đã bị xoá khỏi nhóm`,
              created_by: user.id,
            });
            fetchMembers();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.section, borderBottomColor: theme.card },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons
            name="chevron-back"
            size={scale(28)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {lang === "vi" ? "Quản lý quyền" : "Manage Permissions"}
        </Text>
        <View style={{ width: scale(28) }} />
      </View>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ paddingBottom: scale(32) }}
          renderItem={({ item }) => (
            <View style={[styles.memberCard, { backgroundColor: theme.card }]}>
              <Image
                source={
                  item.users?.avatar_url
                    ? { uri: item.users.avatar_url }
                    : require("../../assets/images/avatar.png")
                }
                style={styles.avatar}
              />
              <View style={{ flex: 1, marginLeft: scale(13) }}>
                <Text style={[styles.fullName, { color: theme.text }]}>
                  {item.users?.full_name}
                </Text>
                <Text style={[styles.role, { color: theme.subText }]}>
                  {ROLE_TEXT[item.role]?.[lang] || item.role}
                </Text>
              </View>
              {/* Chủ nhóm được phép gán/xoá quyền, trừ owner */}
              {canEdit(item.role) && (
                <View style={{ flexDirection: "row" }}>
                  {item.role !== "admin" && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => updateRole(item, "admin")}
                    >
                      <Ionicons
                        name="arrow-up-circle"
                        size={scale(20)}
                        color="#00C48C"
                      />
                      <Text style={styles.actionText}>Admin</Text>
                    </TouchableOpacity>
                  )}
                  {item.role !== "member" && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => updateRole(item, "member")}
                    >
                      <Ionicons
                        name="arrow-down-circle"
                        size={scale(20)}
                        color="#FFA940"
                      />
                      <Text style={styles.actionText}>Member</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {/* Xoá khỏi nhóm (trừ owner và bản thân) */}
              {canRemove(item.user_id, item.role) && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeMember(item)}
                >
                  <Ionicons
                    name="person-remove"
                    size={scale(20)}
                    color="#FF5252"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={{ color: theme.subText, fontStyle: "italic" }}>
                {lang === "vi" ? "Chưa có thành viên nào" : "No members"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingTop: scale(6),
    paddingBottom: scale(8),
    borderBottomWidth: 0.5,
  },
  backBtn: { width: scale(32), alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: scale(18),
    fontWeight: "bold",
    marginHorizontal: scale(2),
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(14),
    marginHorizontal: scale(14),
    marginTop: scale(12),
    padding: scale(12),
    elevation: 2,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(4),
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: "#eee",
  },
  fullName: {
    fontSize: scale(16),
    fontWeight: "bold",
  },
  role: {
    fontSize: scale(13),
    marginTop: scale(2),
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginLeft: scale(8),
  },
  actionText: {
    fontSize: scale(13),
    marginLeft: scale(3),
    color: "#444",
    fontWeight: "bold",
  },
  removeBtn: {
    marginLeft: scale(8),
    backgroundColor: "#FFD9D9",
    padding: scale(5),
    borderRadius: scale(8),
  },
  emptyBox: {
    alignItems: "center",
    marginTop: scale(40),
  },
});
