import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../LanguageContext";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Đa ngữ động
const TEXT = {
  header: { vi: "Thông tin thành viên", en: "Member info" },
  notfound: {
    vi: "Không tìm thấy thông tin thành viên.",
    en: "Member info not found.",
  },
  owner: { vi: "Chủ nhóm", en: "Owner" },
  admin: { vi: "Quản trị viên", en: "Admin" },
  member: { vi: "Thành viên", en: "Member" },
  email: { vi: "Email", en: "Email" },
  dateJoin: { vi: "Ngày tham gia", en: "Join date" },
  notset: { vi: "(chưa cập nhật)", en: "(not set)" },
};

export default function MemberInfo({ route, navigation }: any) {
  const { lang } = useLanguage();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { member } = route.params || {};

  const getRoleLabel = (role: string) => {
    if (role === "owner") return TEXT.owner[lang as "vi" | "en"];
    if (role === "admin") return TEXT.admin[lang as "vi" | "en"];
    return TEXT.member[lang as "vi" | "en"];
  };

  if (!member) {
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
              size={scale(26)}
              color={theme.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {TEXT.header[lang as "vi" | "en"]}
          </Text>
          <View style={{ width: scale(26) }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.text }}>
            {TEXT.notfound[lang as "vi" | "en"]}
          </Text>
        </View>
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
            size={scale(26)}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {TEXT.header[lang as "vi" | "en"]}
        </Text>
        <View style={{ width: scale(26) }} />
      </View>
      <View style={styles.content}>
        <Image source={member.avatar} style={styles.avatar} />
        <Text style={[styles.name, { color: theme.primary }]}>
          {member.name}
        </Text>
        <Text style={[styles.role, { color: theme.primary }]}>
          {getRoleLabel(member.role)}
        </Text>
        {/* Thêm thông tin khác nếu muốn */}
        <View style={styles.infoRow}>
          <Ionicons
            name="mail-outline"
            size={scale(18)}
            color={theme.subText}
            style={{ marginRight: scale(7) }}
          />
          <Text style={[styles.infoText, { color: theme.text }]}>
            {TEXT.email[lang as "vi" | "en"]}:{" "}
            {TEXT.notset[lang as "vi" | "en"]}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={scale(18)}
            color={theme.subText}
            style={{ marginRight: scale(7) }}
          />
          <Text style={[styles.infoText, { color: theme.text }]}>
            {TEXT.dateJoin[lang as "vi" | "en"]}:{" "}
            {TEXT.notset[lang as "vi" | "en"]}
          </Text>
        </View>
      </View>
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
  content: {
    alignItems: "center",
    marginTop: scale(36),
    paddingHorizontal: scale(24),
  },
  avatar: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(24),
    marginBottom: scale(18),
  },
  name: {
    fontSize: scale(20),
    fontWeight: "bold",
    marginBottom: scale(4),
  },
  role: {
    fontSize: scale(15),
    marginBottom: scale(18),
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(12),
  },
  infoText: {
    fontSize: scale(15),
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
