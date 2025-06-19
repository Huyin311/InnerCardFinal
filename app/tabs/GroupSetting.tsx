import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
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

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;
const clamp = (v: number, min: number, max: number) =>
  Math.max(Math.min(v, max), min);
const baseWidth = 375;
const maxScale = isTablet ? 1.22 : 1.07;
const minScale = 0.91;
const scale = (size: number) => {
  const ratio = SCREEN_WIDTH / baseWidth;
  return clamp(size * ratio, size * minScale, size * maxScale);
};

// Đa ngữ
const TEXT = {
  groupSettings: { vi: "Cài đặt nhóm", en: "Group Settings" },
  groupInfo: { vi: "Thông tin nhóm", en: "Group Info" },
  renameGroup: { vi: "Đổi tên nhóm", en: "Rename group" },
  renameGroupDev: {
    vi: "Tính năng này đang phát triển. Liên hệ Admin để đổi tên!",
    en: "This feature is under development. Contact Admin to rename!",
  },
  editDescription: { vi: "Đổi mô tả nhóm", en: "Edit group description" },
  editDescriptionDev: {
    vi: "Tính năng này đang phát triển. Liên hệ Admin để đổi mô tả!",
    en: "This feature is under development. Contact Admin to edit description!",
  },
  adminTools: { vi: "Quản trị nhóm", en: "Admin Tools" },
  edit: { vi: "Chỉnh sửa thông tin nhóm", en: "Edit group info" },
  invite: { vi: "Mời thành viên", en: "Invite members" },
  statistics: { vi: "Thống kê nhóm", en: "Group statistics" },
  permission: { vi: "Quản lý quyền", en: "Manage permissions" },
  privacy: { vi: "Quyền riêng tư", en: "Privacy" },
  publicGroup: { vi: "Công khai nhóm", en: "Make group public" },
  notifications: { vi: "Thông báo", en: "Notifications" },
  groupNotif: { vi: "Nhận thông báo nhóm", en: "Receive group notifications" },
  dangerZone: { vi: "Nguy hiểm", en: "Danger zone" },
  leave: { vi: "Rời nhóm", en: "Leave group" },
  leaveConfirm: {
    vi: "Bạn chắc chắn muốn rời nhóm?",
    en: "Are you sure you want to leave the group?",
  },
  cancel: { vi: "Huỷ", en: "Cancel" },
  leaveSuccess: { vi: "Đã rời nhóm (mẫu)", en: "Left group (demo)" },
  devSample: { vi: "chức năng mẫu", en: "sample feature" },
  editGroup: { vi: "Chỉnh sửa thông tin nhóm", en: "Edit group info" },
  inviteMember: { vi: "Mời thành viên", en: "Invite member" },
  groupStats: { vi: "Thống kê nhóm", en: "Group statistics" },
  managePerm: { vi: "Quản lý quyền", en: "Manage permissions" },
};

export default function GroupSettings({ navigation }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  // Dummy state for switchers
  const [isNotif, setIsNotif] = React.useState(true);
  const [isPublic, setIsPublic] = React.useState(false);

  // Các chức năng quản trị nhóm bổ sung
  const adminOptions = [
    {
      key: "edit",
      icon: "create-outline",
      label: TEXT.edit[lang],
      color: theme.primary,
      onPress: (navigation: any) =>
        Alert.alert(
          TEXT.editGroup[lang],
          `${TEXT.devSample[lang]} (${TEXT.editGroup[lang]})`,
        ),
    },
    {
      key: "invite",
      icon: "person-add-outline",
      label: TEXT.invite[lang],
      color: "#00C48C",
      onPress: (navigation: any) =>
        Alert.alert(
          TEXT.inviteMember[lang],
          `${TEXT.devSample[lang]} (${TEXT.inviteMember[lang]})`,
        ),
    },
    {
      key: "statistics",
      icon: "bar-chart-outline",
      label: TEXT.statistics[lang],
      color: "#FFB300",
      onPress: (navigation: any) =>
        Alert.alert(
          TEXT.groupStats[lang],
          `${TEXT.devSample[lang]} (${TEXT.groupStats[lang]})`,
        ),
    },
    {
      key: "permission",
      icon: "settings-outline",
      label: TEXT.permission[lang],
      color: "#8C54FF",
      onPress: (navigation: any) =>
        Alert.alert(
          TEXT.managePerm[lang],
          `${TEXT.devSample[lang]} (${TEXT.managePerm[lang]})`,
        ),
    },
  ];

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
        {/* Section: General */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {TEXT.groupInfo[lang]}
        </Text>
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card }]}
          onPress={() =>
            Alert.alert(TEXT.renameGroup[lang], TEXT.renameGroupDev[lang])
          }
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
          onPress={() =>
            Alert.alert(
              TEXT.editDescription[lang],
              TEXT.editDescriptionDev[lang],
            )
          }
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

        {/* Các chức năng quản trị nhóm bổ sung */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {TEXT.adminTools[lang]}
        </Text>
        {adminOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.item, { backgroundColor: theme.card }]}
            activeOpacity={0.7}
            onPress={() => option.onPress(navigation)}
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

        {/* Section: Privacy */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {TEXT.privacy[lang]}
        </Text>
        <View style={[styles.item, { backgroundColor: theme.card }]}>
          <Ionicons
            name="lock-closed-outline"
            size={scale(22)}
            color="#FF647C"
            style={styles.itemIcon}
          />
          <Text style={[styles.itemText, { color: theme.text }]}>
            {TEXT.publicGroup[lang]}
          </Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: theme.subText, true: theme.primary }}
            thumbColor={isPublic ? theme.primary : theme.card}
            style={{ marginLeft: "auto" }}
          />
        </View>

        {/* Section: Notifications */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {TEXT.notifications[lang]}
        </Text>
        <View style={[styles.item, { backgroundColor: theme.card }]}>
          <Ionicons
            name="notifications-outline"
            size={scale(22)}
            color="#FFB300"
            style={styles.itemIcon}
          />
          <Text style={[styles.itemText, { color: theme.text }]}>
            {TEXT.groupNotif[lang]}
          </Text>
          <Switch
            value={isNotif}
            onValueChange={setIsNotif}
            trackColor={{ false: theme.subText, true: theme.primary }}
            thumbColor={isNotif ? theme.primary : theme.card}
            style={{ marginLeft: "auto" }}
          />
        </View>

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
                onPress: () => {
                  if (Platform.OS === "android")
                    ToastAndroid.show(
                      TEXT.leaveSuccess[lang],
                      ToastAndroid.SHORT,
                    );
                  else Alert.alert(TEXT.leaveSuccess[lang]);
                  navigation.goBack?.();
                },
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
