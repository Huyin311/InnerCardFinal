import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
  ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useLanguage } from "../LanguageContext";
import { lightTheme, darkTheme } from "../theme";
import { supabase } from "../../supabase/supabaseClient";
import { AuthContext } from "../../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const TEXT = {
  groupSettings: { vi: "Cài đặt nhóm", en: "Group Settings" },
  groupInfo: { vi: "Thông tin nhóm", en: "Group Info" },
  renameGroup: { vi: "Đổi tên nhóm", en: "Rename group" },
  renameSuccess: { vi: "Đã đổi tên nhóm!", en: "Group renamed!" },
  editDescription: { vi: "Đổi mô tả nhóm", en: "Edit group description" },
  editDescSuccess: { vi: "Đã đổi mô tả nhóm!", en: "Description updated!" },
  adminTools: { vi: "Quản trị nhóm", en: "Admin Tools" },
  invite: { vi: "Mời thành viên", en: "Invite members" },
  statistics: { vi: "Thống kê nhóm", en: "Group statistics" },
  permission: { vi: "Quản lý quyền", en: "Manage permissions" },
  dangerZone: { vi: "Nguy hiểm", en: "Danger zone" },
  leave: { vi: "Rời nhóm", en: "Leave group" },
  leaveConfirm: {
    vi: "Bạn chắc chắn muốn rời nhóm?",
    en: "Are you sure you want to leave the group?",
  },
  cancel: { vi: "Huỷ", en: "Cancel" },
  leaveSuccess: { vi: "Đã rời nhóm", en: "Left group" },
};

export default function GroupSettings({ navigation, route }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const { user } = useContext(AuthContext) || {};
  const groupId = route?.params?.groupId;

  const [group, setGroup] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [groupId, user?.id]);

  async function fetchData() {
    setLoading(true);
    const { data: groupData } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    setGroup(groupData);

    // Lấy member role
    if (user?.id) {
      const { data: memberData } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();
      setMember(memberData);
    }
    setLoading(false);
  }

  // Đổi tên nhóm (owner/admin)
  const handleRenameGroup = () => {
    if (!isAdmin()) return;
    Alert.prompt(
      TEXT.renameGroup[lang],
      TEXT.renameGroup[lang],
      async (newName) => {
        if (!newName) return;
        await supabase
          .from("groups")
          .update({ name: newName })
          .eq("id", groupId);
        fetchData();
        showMsg(TEXT.renameSuccess[lang]);
      },
      "plain-text",
      group?.name,
    );
  };

  // Đổi mô tả nhóm (owner/admin)
  const handleEditDescription = () => {
    if (!isAdmin()) return;
    Alert.prompt(
      TEXT.editDescription[lang],
      TEXT.editDescription[lang],
      async (desc) => {
        if (desc == null) return;
        await supabase
          .from("groups")
          .update({ description: desc })
          .eq("id", groupId);
        fetchData();
        showMsg(TEXT.editDescSuccess[lang]);
      },
      "plain-text",
      group?.description || "",
    );
  };

  // Rời nhóm (không cho chủ nhóm rời)
  const handleLeaveGroup = async () => {
    if (member?.role === "owner") {
      showMsg("Chủ nhóm không thể rời nhóm!");
      return;
    }
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);
    showMsg(TEXT.leaveSuccess[lang]);
    navigation.goBack();
  };

  // Kiểm tra quyền admin/owner
  const isAdmin = () => member?.role === "owner" || member?.role === "admin";

  // Show message
  function showMsg(msg: string) {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert(msg);
  }

  // Các chức năng quản trị nhóm bổ sung (chỉ cho admin)
  const adminOptions = [
    {
      key: "statistics",
      icon: "bar-chart-outline",
      label: TEXT.statistics[lang],
      color: "#FFB300",
      onPress: () => navigation.navigate("GroupStatistic", { groupId }),
    },
    {
      key: "permission",
      icon: "settings-outline",
      label: TEXT.permission[lang],
      color: "#8C54FF",
      onPress: () => navigation.navigate("GroupPermission", { groupId }),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.primary }}>Loading...</Text>
      </SafeAreaView>
    );
  }

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
            size={scale(28)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.groupSettings[lang]}
        </Text>
        <View style={{ width: scale(28) }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: scale(36) }}>
        {/* Section: General - CHỈ owner/admin được xem */}
        {isAdmin() && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>
              {TEXT.groupInfo[lang]}
            </Text>
            <TouchableOpacity
              style={[styles.item, { backgroundColor: theme.card }]}
              onPress={handleRenameGroup}
            >
              <Ionicons
                name="pencil"
                size={scale(22)}
                color={theme.primary}
                style={styles.itemIcon}
              />
              <Text style={[styles.itemText, { color: theme.text }]}>
                {TEXT.renameGroup[lang]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.item, { backgroundColor: theme.card }]}
              onPress={handleEditDescription}
            >
              <Ionicons
                name="document-text-outline"
                size={scale(22)}
                color={theme.primary}
                style={styles.itemIcon}
              />
              <Text style={[styles.itemText, { color: theme.text }]}>
                {TEXT.editDescription[lang]}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Các chức năng quản trị nhóm bổ sung */}
        {isAdmin() && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>
              {TEXT.adminTools[lang]}
            </Text>
            {adminOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.item, { backgroundColor: theme.card }]}
                activeOpacity={0.7}
                onPress={option.onPress}
              >
                <Ionicons
                  name={option.icon as any}
                  size={scale(22)}
                  color={option.color}
                  style={styles.itemIcon}
                />
                <Text style={[styles.itemText, { color: theme.text }]}>
                  {option.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={scale(18)}
                  color={theme.subText}
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Section: Danger zone */}
        <Text style={[styles.sectionTitle, { color: "#e74c3c" }]}>
          {TEXT.dangerZone[lang]}
        </Text>
        <TouchableOpacity
          style={[
            styles.item,
            { borderColor: "#e74c3c", backgroundColor: theme.card },
          ]}
          onPress={() =>
            Alert.alert(TEXT.leave[lang], TEXT.leaveConfirm[lang], [
              { text: TEXT.cancel[lang], style: "cancel" },
              {
                text: TEXT.leave[lang],
                style: "destructive",
                onPress: handleLeaveGroup,
              },
            ])
          }
        >
          <Ionicons
            name="log-out-outline"
            size={scale(22)}
            color="#e74c3c"
            style={styles.itemIcon}
          />
          <Text style={[styles.itemText, { color: "#e74c3c" }]}>
            {TEXT.leave[lang]}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  sectionTitle: {
    fontSize: scale(15),
    fontWeight: "bold",
    marginTop: scale(26),
    marginBottom: scale(8),
    marginLeft: scale(20),
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderColor: "#F2F2F2",
  },
  itemIcon: {
    marginRight: scale(13),
  },
  itemText: {
    fontSize: scale(16),
    fontWeight: "500",
  },
});
