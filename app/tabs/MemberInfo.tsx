import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../LanguageContext";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { supabase } from "../../supabase/supabaseClient";
import { useRoute, useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

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
  loading: { vi: "Đang tải...", en: "Loading..." },
};

export default function MemberInfo() {
  const { lang } = useLanguage();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  // nhận thêm role, name, avatar nếu truyền từ MemberGroup
  const {
    userId,
    groupId,
    role: paramRole,
    name: paramName,
    avatar: paramAvatar,
  } = route.params || {};

  // State lưu thông tin user
  const [info, setInfo] = useState<any>(null);
  // State lưu role (ưu tiên lấy từ param, nếu chưa có thì fetch)
  const [role, setRole] = useState(paramRole || "");
  const [loading, setLoading] = useState(true);

  // Fetch info user
  useEffect(() => {
    supabase
      .from("users")
      .select("full_name, email, avatar_url, username, created_at")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        setInfo(data);
        setLoading(false);
      });
  }, [userId]);

  // Nếu chưa có role thì fetch từ group_members
  useEffect(() => {
    if (!role && groupId && userId) {
      supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single()
        .then(({ data }) => {
          if (data?.role) setRole(data.role);
        });
    }
  }, [role, groupId, userId]);

  const getRoleLabel = (r: string) => {
    if (r === "owner") return TEXT.owner[lang];
    if (r === "admin") return TEXT.admin[lang];
    return TEXT.member[lang];
  };

  if (loading)
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
            {TEXT.header[lang]}
          </Text>
          <View style={{ width: scale(26) }} />
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={theme.primary} />
          <Text style={{ color: theme.text, marginTop: 8 }}>
            {TEXT.loading[lang]}
          </Text>
        </View>
      </SafeAreaView>
    );

  if (!info)
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
            {TEXT.header[lang]}
          </Text>
          <View style={{ width: scale(26) }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.text }}>{TEXT.notfound[lang]}</Text>
        </View>
      </SafeAreaView>
    );

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
          {TEXT.header[lang]}
        </Text>
        <View style={{ width: scale(26) }} />
      </View>
      <View style={styles.content}>
        <Image
          source={
            paramAvatar
              ? paramAvatar
              : info.avatar_url
                ? { uri: info.avatar_url }
                : require("../../assets/images/avatar.png")
          }
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.primary }]}>
          {paramName || info.full_name || TEXT.notset[lang]}
        </Text>
        <Text style={[styles.role, { color: theme.primary }]}>
          {getRoleLabel(role)}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="mail-outline"
            size={scale(18)}
            color={theme.subText}
            style={{ marginRight: scale(7) }}
          />
          <Text style={[styles.infoText, { color: theme.text }]}>
            {TEXT.email[lang]}: {info.email || TEXT.notset[lang]}
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
            {TEXT.dateJoin[lang]}:{" "}
            {info.created_at
              ? new Date(info.created_at).toLocaleDateString()
              : TEXT.notset[lang]}
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
    backgroundColor: "#eee",
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
