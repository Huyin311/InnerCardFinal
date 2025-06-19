import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Đa ngữ động
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
    vi: "Bạn muốn thăng {name} thành quản trị viên? (chức năng mẫu)",
    en: "Promote {name} to admin? (demo)",
  },
  demoteTitle: { vi: "Giáng quyền", en: "Demote" },
  demoteMsg: {
    vi: "Bạn muốn giáng {name} xuống thành viên? (chức năng mẫu)",
    en: "Demote {name} to member? (demo)",
  },
  removeTitle: { vi: "Xóa thành viên", en: "Remove member" },
  removeMsg: {
    vi: "Bạn chắc chắn muốn xóa {name} khỏi nhóm?",
    en: "Are you sure to remove {name} from the group?",
  },
  cancel: { vi: "Huỷ", en: "Cancel" },
  removed: { vi: "Đã xóa", en: "Removed" },
  removedMsg: {
    vi: "{name} đã bị xóa khỏi nhóm (mẫu)",
    en: "{name} was removed from the group (demo)",
  },
};

// Giả lập dữ liệu thành viên (role lưu key, tag sẽ tự động vi/en)
const DUMMY_MEMBERS = [
  {
    id: "u1",
    name: "Huy Nguyen",
    avatar: require("../../assets/images/avatar.png"),
    role: "owner",
  },
  {
    id: "u2",
    name: "Lan Pham",
    avatar: require("../../assets/images/avatar.png"),
    role: "member",
  },
  {
    id: "u3",
    name: "Minh Tran",
    avatar: require("../../assets/images/avatar.png"),
    role: "member",
  },
];

// Đề xuất các chức năng quản lý thành viên
function getMemberOptions(lang: "vi" | "en") {
  return [
    {
      key: "view",
      icon: "person-circle-outline",
      label: TEXT.view[lang],
      color: "#4F8CFF",
      onPress: (member: any, navigation: any) =>
        navigation.navigate("MemberInfo", { member }),
    },
    {
      key: "promote",
      icon: "arrow-up-circle-outline",
      label: TEXT.promote[lang],
      color: "#00C48C",
      onPress: (
        member: any,
        navigation: any, // để đồng nhất kiểu hàm
      ) =>
        Alert.alert(
          TEXT.promoteTitle[lang],
          TEXT.promoteMsg[lang].replace("{name}", member.name),
        ),
      onlyForMember: true,
    },
    {
      key: "demote",
      icon: "arrow-down-circle-outline",
      label: TEXT.demote[lang],
      color: "#FFB300",
      onPress: (
        member: any,
        navigation: any, // để đồng nhất kiểu hàm
      ) =>
        Alert.alert(
          TEXT.demoteTitle[lang],
          TEXT.demoteMsg[lang].replace("{name}", member.name),
        ),
      onlyForAdmin: true,
    },
    {
      key: "remove",
      icon: "person-remove-outline",
      label: TEXT.remove[lang],
      color: "#e74c3c",
      onPress: (
        member: any,
        navigation: any, // để đồng nhất kiểu hàm
      ) =>
        Alert.alert(
          TEXT.removeTitle[lang],
          TEXT.removeMsg[lang].replace("{name}", member.name),
          [
            { text: TEXT.cancel[lang], style: "cancel" },
            {
              text: TEXT.remove[lang],
              style: "destructive",
              onPress: () =>
                Alert.alert(
                  TEXT.removed[lang],
                  TEXT.removedMsg[lang].replace("{name}", member.name),
                ),
            },
          ],
        ),
      onlyForOthers: true,
    },
  ];
}

export default function MemberGroup({ navigation }: any) {
  const { darkMode } = useDarkMode();
  const { lang } = useLanguage();
  const theme = darkMode ? darkTheme : lightTheme;
  const memberOptions = getMemberOptions(lang as "vi" | "en");

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);

  // Mở menu tùy chọn cho 1 thành viên
  const handleOpenOptions = (member: any) => {
    setSelectedMember(member);
    setShowOptions(true);
  };

  // Đóng menu
  const handleCloseOptions = () => {
    setShowOptions(false);
    setSelectedMember(null);
  };

  // Lấy danh sách chức năng phù hợp với từng loại thành viên
  const getOptionsForMember = (member: any) => {
    const role = member?.role || "";
    const isOwner = role === "owner";
    const isAdmin = role === "admin";
    const isMember = role === "member";
    return memberOptions.filter((opt) => {
      if (opt.onlyForOthers && isOwner) return false;
      if (opt.onlyForMember && !isMember) return false;
      if (opt.onlyForAdmin && !isAdmin) return false;
      return true;
    });
  };

  // Đổi key thành text đa ngữ
  const getRoleLabel = (role: string) => {
    if (role === "owner") return TEXT.owner[lang as "vi" | "en"];
    if (role === "admin") return TEXT.admin[lang as "vi" | "en"];
    return TEXT.member[lang as "vi" | "en"];
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
          {TEXT.groupMembers[lang as "vi" | "en"]}
        </Text>
        <View style={{ width: scale(26) }} />
      </View>
      {/* Danh sách thành viên */}
      <FlatList
        data={DUMMY_MEMBERS}
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
              style={[styles.optionBtn, { backgroundColor: theme.background }]}
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
              {TEXT.noMember[lang as "vi" | "en"]}
            </Text>
          </View>
        }
      />

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
                    // Luôn truyền đủ 2 tham số: member, navigation
                    opt.onPress(selectedMember, navigation);
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
