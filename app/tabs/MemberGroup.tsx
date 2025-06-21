import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";
import { supabase } from "../../supabase/supabaseClient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { logGroupActivity } from "../../components/utils/groupActivities"; // <--- import here

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const TEXT = {
  groupMembers: { vi: "Thành viên nhóm", en: "Group Members" },
  owner: { vi: "Chủ nhóm", en: "Owner" },
  admin: { vi: "Quản trị viên", en: "Admin" },
  member: { vi: "Thành viên", en: "Member" },
  noMember: { vi: "Chưa có thành viên nào.", en: "No members yet." },
  view: { vi: "Xem thông tin", en: "View info" },
  promote: {
    vi: "Thăng quyền (Thành viên → Quản trị)",
    en: "Promote (Member → Admin)",
  },
  demote: {
    vi: "Giáng quyền (Quản trị → Thành viên)",
    en: "Demote (Admin → Member)",
  },
  remove: { vi: "Xóa khỏi nhóm", en: "Remove from group" },
  promoteTitle: { vi: "Thăng quyền", en: "Promote" },
  promoteMsg: {
    vi: "Bạn muốn thăng {name} thành quản trị viên?",
    en: "Promote {name} to admin?",
  },
  demoteTitle: { vi: "Giáng quyền", en: "Demote" },
  demoteMsg: {
    vi: "Bạn muốn giáng {name} xuống thành viên?",
    en: "Demote {name} to member?",
  },
  removeTitle: { vi: "Xóa thành viên", en: "Remove member" },
  removeMsg: {
    vi: "Bạn chắc chắn muốn xóa {name} khỏi nhóm?",
    en: "Are you sure to remove {name} from the group?",
  },
  cancel: { vi: "Huỷ", en: "Cancel" },
  removed: { vi: "Đã xóa", en: "Removed" },
  removedMsg: {
    vi: "{name} đã bị xóa khỏi nhóm",
    en: "{name} was removed from the group",
  },
  actionSuccess: { vi: "Thành công", en: "Success" },
  error: { vi: "Có lỗi xảy ra", en: "An error occurred" },
};

export default function MemberGroup() {
  const { darkMode } = useDarkMode();
  const { lang } = useLanguage();
  const theme = darkMode ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useContext(AuthContext) || {};
  const { groupId } = route.params as { groupId: number };

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  // Lấy ownerId của nhóm
  useEffect(() => {
    supabase
      .from("groups")
      .select("owner_id")
      .eq("id", groupId)
      .single()
      .then(({ data }) => setOwnerId(data?.owner_id ?? null));
  }, [groupId]);

  // Lấy danh sách thành viên
  useEffect(() => {
    setLoading(true);
    supabase
      .from("group_members")
      .select(
        `user_id, role, users:users!group_members_user_id_fkey(full_name, avatar_url)`,
      )
      .eq("group_id", groupId)
      .then(({ data, error }) => {
        if (data) {
          const formatted = data.map((m: any) => ({
            id: m.user_id,
            name: m.users.full_name,
            avatar: m.users.avatar_url
              ? { uri: m.users.avatar_url }
              : require("../../assets/images/avatar.png"),
            role: m.role,
          }));
          setMembers(formatted);
        }
        setLoading(false);
      });
  }, [groupId]);

  // Xác định quyền là chủ nhóm
  const isSelfOwner = user?.id && ownerId && user.id === ownerId;

  // Modal option cho từng thành viên
  const handleOpenOptions = (member: any) => {
    setSelectedMember(member);
    setShowOptions(true);
  };

  const handleCloseOptions = () => {
    setShowOptions(false);
    setSelectedMember(null);
  };

  // Các tính năng cho mỗi thành viên
  const getOptionsForMember = (member: any) => {
    const role = member?.role || "";
    const isOwner = role === "owner";
    const isAdmin = role === "admin";
    const isMember = role === "member";
    // Chỉ chủ nhóm mới được thăng/xoá/giáng quyền
    return [
      {
        key: "view",
        icon: "person-circle-outline",
        label: TEXT.view[lang],
        color: "#4F8CFF",
        onPress: (member: any) => {
          navigation.navigate("MemberInfo", {
            userId: member.id,
            role: member.role,
            name: member.name,
            avatar: member.avatar,
            groupId,
          });
        },
        visible: true,
      },
      {
        key: "promote",
        icon: "arrow-up-circle-outline",
        label: TEXT.promote[lang],
        color: "#00C48C",
        onPress: async (member: any) => {
          Alert.alert(
            TEXT.promoteTitle[lang],
            TEXT.promoteMsg[lang].replace("{name}", member.name),
            [
              { text: TEXT.cancel[lang], style: "cancel" },
              {
                text: TEXT.promote[lang],
                style: "default",
                onPress: async () => {
                  const { error } = await supabase
                    .from("group_members")
                    .update({ role: "admin" })
                    .eq("group_id", groupId)
                    .eq("user_id", member.id);
                  if (!error) {
                    // Log activity promote
                    await logGroupActivity({
                      group_id: groupId,
                      activity_type: "promote",
                      content: `${user?.full_name || "Người dùng"} đã thăng ${member.name} thành quản trị viên.`,
                      created_by: user?.id,
                    });
                    Alert.alert(TEXT.actionSuccess[lang], "");
                    setMembers((prev) =>
                      prev.map((m) =>
                        m.id === member.id ? { ...m, role: "admin" } : m,
                      ),
                    );
                  } else {
                    Alert.alert(TEXT.error[lang], error.message);
                  }
                },
              },
            ],
          );
        },
        visible: isSelfOwner && isMember && !isOwner,
      },
      {
        key: "demote",
        icon: "arrow-down-circle-outline",
        label: TEXT.demote[lang],
        color: "#FFB300",
        onPress: async (member: any) => {
          Alert.alert(
            TEXT.demoteTitle[lang],
            TEXT.demoteMsg[lang].replace("{name}", member.name),
            [
              { text: TEXT.cancel[lang], style: "cancel" },
              {
                text: TEXT.demote[lang],
                style: "default",
                onPress: async () => {
                  const { error } = await supabase
                    .from("group_members")
                    .update({ role: "member" })
                    .eq("group_id", groupId)
                    .eq("user_id", member.id);
                  if (!error) {
                    // Log activity demote
                    await logGroupActivity({
                      group_id: groupId,
                      activity_type: "demote",
                      content: `${user?.full_name || "Người dùng"} đã giáng ${member.name} xuống thành viên.`,
                      created_by: user?.id,
                    });
                    Alert.alert(TEXT.actionSuccess[lang], "");
                    setMembers((prev) =>
                      prev.map((m) =>
                        m.id === member.id ? { ...m, role: "member" } : m,
                      ),
                    );
                  } else {
                    Alert.alert(TEXT.error[lang], error.message);
                  }
                },
              },
            ],
          );
        },
        visible: isSelfOwner && isAdmin && !isOwner,
      },
      {
        key: "remove",
        icon: "person-remove-outline",
        label: TEXT.remove[lang],
        color: "#e74c3c",
        onPress: async (member: any) => {
          Alert.alert(
            TEXT.removeTitle[lang],
            TEXT.removeMsg[lang].replace("{name}", member.name),
            [
              { text: TEXT.cancel[lang], style: "cancel" },
              {
                text: TEXT.remove[lang],
                style: "destructive",
                onPress: async () => {
                  const { error } = await supabase
                    .from("group_members")
                    .delete()
                    .eq("group_id", groupId)
                    .eq("user_id", member.id);
                  if (!error) {
                    // Log activity remove
                    await logGroupActivity({
                      group_id: groupId,
                      activity_type: "remove",
                      content: `${user?.full_name || "Người dùng"} đã xóa ${member.name} khỏi nhóm.`,
                      created_by: user?.id,
                    });
                    setMembers((prev) =>
                      prev.filter((m) => m.id !== member.id),
                    );
                    Alert.alert(
                      TEXT.removed[lang],
                      TEXT.removedMsg[lang].replace("{name}", member.name),
                    );
                  } else {
                    Alert.alert(TEXT.error[lang], error.message);
                  }
                },
              },
            ],
          );
        },
        visible: isSelfOwner && !isOwner,
      },
    ].filter((opt) => opt.visible);
  };

  const getRoleLabel = (role: string) => {
    if (role === "owner") return TEXT.owner[lang];
    if (role === "admin") return TEXT.admin[lang];
    return TEXT.member[lang];
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
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
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.groupMembers[lang]}
        </Text>
        <View style={{ width: scale(26) }} />
      </View>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: scale(16) }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.memberCard,
                { backgroundColor: theme.card, shadowColor: theme.primary },
              ]}
            >
              <Image source={item.avatar} style={styles.avatar} />
              <View style={{ marginLeft: scale(14), flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.role, { color: theme.primary }]}>
                  {getRoleLabel(item.role)}
                </Text>
              </View>
              {/* Nút tuỳ chọn */}
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  { backgroundColor: theme.background },
                ]}
                onPress={() => handleOpenOptions(item)}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={scale(20)}
                  color={theme.subText}
                />
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: scale(10) }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                {TEXT.noMember[lang]}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal chức năng thành viên */}
      <Modal
        visible={showOptions}
        animationType="fade"
        transparent
        onRequestClose={handleCloseOptions}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseOptions}>
          <View
            style={[
              styles.optionsContainer,
              { backgroundColor: theme.card, shadowColor: theme.primary },
            ]}
          >
            <Text style={[styles.optionsTitle, { color: theme.primary }]}>
              {selectedMember?.name} - {getRoleLabel(selectedMember?.role)}
            </Text>
            {getOptionsForMember(selectedMember || {}).map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={() => {
                  handleCloseOptions();
                  setTimeout(() => {
                    opt.onPress(selectedMember);
                  }, 150);
                }}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={scale(20)}
                  color={opt.color}
                  style={{ marginRight: scale(12) }}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    opt.key === "remove" && { color: "#e74c3c" },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(14),
    padding: scale(12),
    elevation: 2,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(10),
  },
  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    backgroundColor: "#eee",
  },
  name: {
    fontSize: scale(16),
    fontWeight: "bold",
  },
  role: {
    fontSize: scale(13),
    marginTop: scale(2),
  },
  optionBtn: {
    padding: scale(8),
    borderRadius: scale(14),
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: scale(40),
  },
  emptyText: {
    fontSize: scale(15),
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(44,75,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    borderRadius: scale(20),
    padding: scale(18),
    width: scale(290),
    elevation: 5,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: scale(6) },
    shadowRadius: scale(20),
  },
  optionsTitle: {
    fontWeight: "bold",
    fontSize: scale(16),
    marginBottom: scale(12),
    textAlign: "center",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(13),
    paddingHorizontal: scale(4),
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F3FA",
  },
  optionLabel: {
    fontSize: scale(15),
    fontWeight: "500",
  },
});
