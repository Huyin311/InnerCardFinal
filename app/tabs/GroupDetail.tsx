import React, { useRef, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";

// ==== TEXT KEYWORDS FOR MULTILINGUAL ====
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
  group_quiz: { vi: "Tạo bài kiểm tra", en: "Create Quiz" },
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

// Fake group data
const group = {
  id: "g1",
  name: "IELTS Speaking Club",
  owner: "Huy Nguyen",
  memberCount: 123,
  cardCount: 456,
  avatar: require("../../assets/images/avatar.png"),
  description:
    "Nơi mọi người luyện nói tiếng Anh, chia sẻ tài liệu, cùng nhau tiến bộ.",
  category: "Education",
  createdAt: new Date("2024-05-01"),
  joinCode: "IELTS2024",
};

export default function GroupDetail({ navigation }: any) {
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang } = useLanguage();

  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<any>(null);

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
    await Clipboard.setStringAsync(group.joinCode);
    if (Platform.OS === "android") {
      ToastAndroid.show(TEXT.group_code_copy_success[lang], ToastAndroid.SHORT);
    } else {
      Alert.alert(TEXT.group_code_copy_success[lang]);
    }
  };

  const handleShowQR = () => setShowQR(true);
  const handleHideQR = () => setShowQR(false);

  // Action for each feature
  const handleFeaturePress = (key: string) => {
    switch (key) {
      case "members":
        navigation.navigate("MemberGroup");
        break;
      case "announcements":
        navigation.navigate("GroupAnnouncements");
        break;
      case "cards":
        navigation.navigate("CardDetail", { groupId: group.id });
        break;
      case "activities":
        navigation.navigate("GroupActivities");
        break;
      case "quiz":
        navigation.navigate("GroupQuizScreen");
        break;
      case "settings":
        navigation.navigate("GroupSetting");
        break;
      case "create_test":
        Alert.alert(
          TEXT.group_feature_new[lang],
          TEXT.group_feature_new_detail[lang],
        );
        break;
      default:
        Alert.alert(
          TEXT.group_feature_coming[lang],
          TEXT.group_feature_coming_detail[lang],
        );
        break;
    }
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
          <Image source={group.avatar} style={styles.avatar} />
          <View style={{ marginLeft: scale(16), flex: 1 }}>
            <Text style={[styles.groupName, { color: theme.primary }]}>
              {group.name}
            </Text>
            <Text
              style={[styles.groupDesc, { color: theme.text }]}
              numberOfLines={2}
            >
              {group.description}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="person" size={scale(14)} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.primary }]}>
                {group.owner}
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
                {TEXT.created_at[lang]} {group.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Group code + QR */}
        <View style={styles.codeRow}>
          <TouchableOpacity
            style={[
              styles.codeBox,
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
              size={scale(18)}
              color={theme.primary}
            />
            <Text style={[styles.codeText, { color: theme.primary }]}>
              {group.joinCode}
            </Text>
            <Ionicons
              name="copy-outline"
              size={scale(18)}
              color={theme.primary}
              style={{ marginLeft: scale(6) }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.qrBtn,
              { backgroundColor: theme.section, borderColor: theme.primary },
            ]}
            onPress={handleShowQR}
          >
            <Ionicons
              name="qr-code-outline"
              size={scale(23)}
              color={theme.primary}
            />
            <Text style={[styles.qrText, { color: theme.primary }]}>
              {TEXT.qr_code[lang]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR modal */}
        {showQR && (
          <View style={styles.qrModalOverlay}>
            <TouchableOpacity
              style={styles.qrModalBack}
              onPress={handleHideQR}
            />
            <View
              style={[
                styles.qrModalCard,
                { backgroundColor: theme.section, shadowColor: theme.primary },
              ]}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: scale(17),
                  color: theme.primary,
                }}
              >
                {TEXT.group_qr_title[lang]}
              </Text>
              <View style={{ marginVertical: verticalScale(18) }}>
                <QRCode
                  value={group.joinCode}
                  size={scale(180)}
                  color={theme.primary}
                  backgroundColor={theme.section}
                  getRef={(c) => {
                    qrRef.current = c;
                  }}
                />
              </View>
              <Text
                style={{ color: theme.text, marginBottom: verticalScale(12) }}
              >
                {TEXT.group_code_label[lang]}{" "}
                <Text style={{ fontWeight: "bold" }}>{group.joinCode}</Text>
              </Text>
              <TouchableOpacity
                style={[styles.qrCloseBtn, { backgroundColor: theme.primary }]}
                onPress={handleHideQR}
              >
                <Ionicons name="close" size={scale(22)} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  codeRow: {
    marginTop: scale(10),
    marginBottom: scale(12),
    marginHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12),
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(14),
    paddingVertical: scale(11),
    paddingHorizontal: scale(20),
    flex: 1,
    marginRight: scale(10),
    elevation: 2,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(6),
    borderWidth: 1.2,
  },
  codeText: {
    fontWeight: "bold",
    fontSize: scale(16),
    letterSpacing: 2,
    marginLeft: scale(8),
  },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderWidth: 1.1,
    elevation: 2,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(6),
  },
  qrText: {
    fontWeight: "bold",
    fontSize: scale(14),
    marginLeft: scale(4),
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
  qrModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "rgba(36,45,77,0.24)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  qrModalBack: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  qrModalCard: {
    borderRadius: scale(22),
    padding: scale(26),
    alignItems: "center",
    width: SCREEN_WIDTH * 0.77,
    elevation: 9,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: scale(8) },
    shadowRadius: scale(24),
  },
  qrCloseBtn: {
    borderRadius: 999,
    padding: scale(6),
    position: "absolute",
    top: scale(9),
    right: scale(9),
  },
});
