import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../LanguageContext";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { supabase } from "../../supabase/supabaseClient";
import { useUserId } from "../../hooks/useUserId";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const TEXT = {
  email: { vi: "Email", en: "Email" },
  username: { vi: "Tên đăng nhập", en: "Username" },
  phone: { vi: "Số điện thoại", en: "Phone" },
  joined: { vi: "Ngày tham gia", en: "Joined" },
  member: { vi: "Thành viên", en: "Member" },
  owner: { vi: "Chủ nhóm", en: "Owner" },
  admin: { vi: "Quản trị viên", en: "Admin" },
  loading: { vi: "Đang tải...", en: "Loading..." },
};

export default function ProfileScreen() {
  const { lang } = useLanguage();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const userId = useUserId();

  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<{
    avatar_url?: string;
    full_name?: string;
    email?: string;
    username?: string;
    phone?: string;
    role?: "member" | "owner" | "admin";
    created_at?: string;
  }>({});

  React.useEffect(() => {
    if (!userId) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("avatar_url, full_name, email, username, created_at")
        .eq("id", userId)
        .single();
      if (!ignore && data) {
        setUser({
          ...data,
          // Nếu muốn thêm phone, role thì phải có trong db hoặc bảng profiles
          // phone: data.phone,
          // role: data.role,
        });
      }
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [userId]);

  // Nếu muốn lấy thêm phone, role: Thêm cột ở bảng users hoặc join bảng profiles

  function getRoleLabel(role: string | undefined) {
    if (role === "owner") return TEXT.owner[lang];
    if (role === "admin") return TEXT.admin[lang];
    return TEXT.member[lang];
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.primary, marginTop: 12 }}>
            {TEXT.loading[lang]}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              user.avatar_url
                ? { uri: user.avatar_url }
                : require("../../assets/images/avatar.png")
            }
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.name, { color: theme.primary }]}>
          {user.full_name}
        </Text>
        <Text style={[styles.role, { color: theme.subText }]}>
          {getRoleLabel(user.role)}
        </Text>

        <View
          style={[
            styles.infoSection,
            { backgroundColor: theme.card, shadowColor: theme.primary },
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.email[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.email}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.username[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.username}
            </Text>
          </View>
          {/* Nếu có phone thì mở comment dưới đây */}
          {/* <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.phone[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.phone}
            </Text>
          </View> */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.joined[lang]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.created_at?.slice(0, 10)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    alignItems: "center",
    padding: scale(20),
    paddingBottom: scale(40),
  },
  avatarWrap: { marginTop: 14, marginBottom: 10, position: "relative" },
  avatar: {
    width: scale(110),
    height: scale(110),
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  name: {
    fontWeight: "bold",
    fontSize: scale(20),
    marginBottom: 2,
    marginTop: 6,
  },
  role: {
    marginBottom: 17,
    fontSize: scale(15),
  },
  infoSection: {
    borderRadius: 13,
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 18,
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: scale(15),
    marginLeft: 10,
    minWidth: 100,
  },
  infoValue: {
    fontWeight: "500",
    marginLeft: 4,
    fontSize: scale(15),
    flexShrink: 1,
  },
});
