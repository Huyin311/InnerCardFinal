import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../supabase/supabaseClient";

const TEXT = {
  group_qr_title: {
    vi: "Quét QR để tham gia nhóm",
    en: "Scan QR to join group",
  },
  group_code_copy_success: {
    vi: "Đã sao chép mã nhóm!",
    en: "Group code copied!",
  },
  group_code_label: { vi: "Mã:", en: "Code:" },
  group_members: { vi: "Thành viên", en: "Members" },
  group_members_desc: {
    vi: "Xem danh sách & vai trò",
    en: "View list & roles",
  },
  group_announcements: { vi: "Thông báo", en: "Announcements" },
  group_announcements_desc: {
    vi: "Tin tức mới nhất từ nhóm",
    en: "Latest news from the group",
  },
  group_cards: { vi: "Thẻ", en: "Cards" },
  group_cards_desc: {
    vi: "Tổng số thẻ học nhóm",
    en: "Total group study cards",
  },
  group_activities: { vi: "Hoạt động", en: "Activities" },
  group_activities_desc: {
    vi: "Lịch sử tương tác nhóm",
    en: "Group interaction history",
  },
  group_settings: { vi: "Cài đặt", en: "Settings" },
  group_settings_desc: { vi: "Quản lý nhóm", en: "Manage group" },
  group_quiz: { vi: "Bài kiểm tra", en: "Quiz" },
  group_quiz_desc: {
    vi: "Tạo bài quiz cho nhóm",
    en: "Create a quiz for the group",
  },
  group_feature_coming: {
    vi: "Chức năng đang phát triển",
    en: "Feature in development",
  },
  group_feature_coming_detail: {
    vi: "Tính năng này sẽ sớm có mặt!",
    en: "This feature is coming soon!",
  },
  group_feature_new: { vi: "Chức năng mới", en: "New Feature" },
  group_feature_new_detail: {
    vi: "Điều hướng đến màn hình tạo bài kiểm tra (quiz)!",
    en: "Navigate to quiz creation screen!",
  },
  qr_code: { vi: "QR nhóm", en: "Group QR" },
  owner: { vi: "Chủ nhóm", en: "Owner" },
  members: { vi: "thành viên", en: "members" },
  created_at: { vi: "Tạo ngày", en: "Created at" },
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function GroupDetail() {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId } = route.params as { groupId: number };

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      // 1. Lấy group + owner
      const { data: groupData, error } = await supabase
        .from("groups")
        .select(
          `
          *,
          owner:owner_id(id, full_name, avatar_url)
        `,
        )
        .eq("id", groupId)
        .single();

      if (error || !groupData) {
        setLoading(false);
        Alert.alert("Không tìm thấy nhóm này!");
        navigation.goBack();
        return;
      }

      // 2. Lấy số thành viên
      const { count: memberCount } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);

      // 3. Lấy số bộ thẻ
      const { count: cardCount } = await supabase
        .from("deck_shares")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);

      setGroup({
        ...groupData,
        ownerName: groupData.owner?.full_name,
        ownerAvatar: groupData.owner?.avatar_url,
        memberCount: memberCount || 1,
        cardCount: cardCount || 0,
      });
      setLoading(false);
    };
    fetchGroup();
  }, [groupId]);

  const features = [
    {
      key: "members",
      icon: "people",
      label: TEXT.group_members[lang],
      color: "#4F8CFF",
      desc: TEXT.group_members_desc[lang],
    },
    {
      key: "announcements",
      icon: "notifications",
      label: TEXT.group_announcements[lang],
      color: "#FFB300",
      desc: TEXT.group_announcements_desc[lang],
    },
    {
      key: "cards",
      icon: "albums",
      label: TEXT.group_cards[lang],
      color: "#00C48C",
      desc: TEXT.group_cards_desc[lang],
    },
    {
      key: "activities",
      icon: "pulse",
      label: TEXT.group_activities[lang],
      color: "#8C54FF",
      desc: TEXT.group_activities_desc[lang],
    },
    {
      key: "settings",
      icon: "settings",
      label: TEXT.group_settings[lang],
      color: "#FF647C",
      desc: TEXT.group_settings_desc[lang],
    },
    {
      key: "quiz",
      icon: "create",
      label: TEXT.group_quiz[lang],
      color: "#FF7A00",
      desc: TEXT.group_quiz_desc[lang],
    },
  ];

  const handleCopyCode = async () => {
    if (!group?.join_code) return;
    await Clipboard.setStringAsync(group.join_code);
    if (Platform.OS === "android") {
      ToastAndroid.show(TEXT.group_code_copy_success[lang], ToastAndroid.SHORT);
    } else {
      Alert.alert(TEXT.group_code_copy_success[lang]);
    }
  };

  const handleFeaturePress = (key: string) => {
    switch (key) {
      case "members":
        navigation.navigate("MemberGroup", { groupId });
        break;
      case "announcements":
        navigation.navigate("GroupAnnouncements", { groupId });
        break;
      case "cards":
        navigation.navigate("GroupCards", { groupId });
        break;
      case "activities":
        navigation.navigate("GroupActivities", { groupId });
        break;
      case "quiz":
        console.log("Go to quiz, groupId = ", groupId);
        navigation.navigate("GroupQuizScreen", { groupId });
        break;
      case "settings":
        navigation.navigate("GroupSetting", { groupId });
        break;
      default:
        Alert.alert(
          TEXT.group_feature_coming[lang],
          TEXT.group_feature_coming_detail[lang],
        );
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) return null;

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
        <Text
          style={[styles.headerTitle, { color: theme.primary }]}
          numberOfLines={1}
        >
          {group.name}
        </Text>
        <View style={{ width: scale(32) }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: verticalScale(32) }}>
        {/* Group info */}
        <View
          style={[
            styles.groupCard,
            { backgroundColor: theme.section, shadowColor: theme.primary },
          ]}
        >
          <Image
            source={
              group.ownerAvatar
                ? { uri: group.ownerAvatar }
                : require("../../assets/images/avatar.png")
            }
            style={styles.avatar}
          />
          <View style={{ marginLeft: scale(16), flex: 1 }}>
            <Text style={[styles.groupName, { color: theme.primary }]}>
              {group.name}
            </Text>
            {group.description ? (
              <Text
                style={[styles.groupDesc, { color: theme.text }]}
                numberOfLines={2}
              >
                {group.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Ionicons name="person" size={scale(14)} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.primary }]}>
                {group.ownerName}
              </Text>
              <Ionicons
                name="people"
                size={scale(14)}
                color={theme.primary}
                style={{ marginLeft: scale(10) }}
              />
              <Text style={[styles.metaText, { color: theme.primary }]}>
                {group.memberCount} {TEXT.members[lang]}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: scale(4),
                alignItems: "center",
              }}
            >
              <Ionicons
                name="calendar"
                size={scale(13)}
                color={theme.subText}
              />
              <Text style={[styles.metaSub, { color: theme.subText }]}>
                {TEXT.created_at[lang]}{" "}
                {group.created_at
                  ? new Date(group.created_at).toLocaleDateString()
                  : ""}
              </Text>
            </View>

            {/* Nút mã nhóm gọn hơn: nằm cạnh dòng thông tin, nhỏ, nổi bật */}
            <View
              style={{
                flexDirection: "row",
                marginTop: scale(7),
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={[
                  styles.codeSmallBtn,
                  {
                    backgroundColor: darkMode ? "#232634" : "#E6ECFF",
                    borderColor: theme.primary,
                  },
                ]}
                activeOpacity={0.85}
                onPress={handleCopyCode}
              >
                <Ionicons
                  name="key-outline"
                  size={scale(16)}
                  color={theme.primary}
                />
                <Text style={[styles.codeSmallText, { color: theme.primary }]}>
                  {group.join_code}
                </Text>
                <Ionicons
                  name="copy-outline"
                  size={scale(15)}
                  color={theme.primary}
                  style={{ marginLeft: scale(4) }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Feature buttons */}
        <View style={styles.smartButtonRow}>
          {features.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.smartBtn,
                { backgroundColor: theme.section, shadowColor: theme.primary },
              ]}
              activeOpacity={0.8}
              onPress={() => handleFeaturePress(item.key)}
            >
              <View
                style={[
                  styles.smartBtnIconBox,
                  { backgroundColor: item.color + (darkMode ? "33" : "22") },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={scale(24)}
                  color={item.color}
                />
              </View>
              <Text style={[styles.smartBtnLabel, { color: theme.text }]}>
                {item.label}
              </Text>
              <Text
                style={[styles.smartBtnDesc, { color: theme.subText }]}
                numberOfLines={1}
              >
                {item.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... giữ nguyên các style khác
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(8),
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
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: scale(16),
    marginTop: scale(16),
    marginBottom: scale(8),
    borderRadius: scale(18),
    padding: scale(16),
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: scale(6) },
    shadowRadius: scale(16),
    elevation: 4,
  },
  avatar: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(16),
    backgroundColor: "#eee",
  },
  groupName: {
    fontSize: scale(17),
    fontWeight: "bold",
    marginBottom: 1,
  },
  groupDesc: {
    fontSize: scale(14),
    marginBottom: 2,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(2),
  },
  metaText: {
    fontSize: scale(13),
    marginLeft: scale(3),
    marginRight: scale(10),
    fontWeight: "500",
  },
  metaSub: {
    fontSize: scale(12),
    marginLeft: scale(3),
    marginRight: scale(8),
  },
  codeSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(10),
    paddingVertical: scale(4),
    paddingHorizontal: scale(12),
    borderWidth: 1.1,
    marginTop: 0,
    alignSelf: "flex-start",
  },
  codeSmallText: {
    fontWeight: "bold",
    fontSize: scale(14),
    letterSpacing: 1.3,
    marginLeft: scale(6),
    marginRight: scale(4),
  },
  smartButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: scale(10),
    marginTop: scale(16),
    marginBottom: scale(10),
    rowGap: scale(12),
  },
  smartBtn: {
    width: (SCREEN_WIDTH - scale(48)) / 2,
    borderRadius: scale(16),
    padding: scale(14),
    alignItems: "flex-start",
    marginBottom: scale(10),
    elevation: 3,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(12),
  },
  smartBtnIconBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(6),
  },
  smartBtnLabel: {
    fontWeight: "bold",
    fontSize: scale(15),
    marginBottom: 2,
  },
  smartBtnDesc: {
    fontSize: scale(12),
    marginTop: 0,
  },
});
