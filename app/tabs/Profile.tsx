import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../LanguageContext";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Đa ngữ động
const TEXT = {
  edit: { vi: "Chỉnh sửa", en: "Edit" },
  editInfo: { vi: "Chỉnh sửa thông tin", en: "Edit information" },
  editProfile: { vi: "Chỉnh sửa thông tin cá nhân.", en: "Edit your profile." },
  email: { vi: "Email", en: "Email" },
  username: { vi: "Tên đăng nhập", en: "Username" },
  phone: { vi: "Số điện thoại", en: "Phone" },
  joined: { vi: "Ngày tham gia", en: "Joined" },
  group: { vi: "Nhóm hiện tại", en: "Current group" },
  member: { vi: "Thành viên", en: "Member" },
  owner: { vi: "Chủ nhóm", en: "Owner" },
  admin: { vi: "Quản trị viên", en: "Admin" },
};

const user = {
  avatar: "https://i.pravatar.cc/180?img=3",
  name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  username: "nguyenvana",
  phone: "0123456789",
  role: "member", // key: "member" | "owner" | "admin"
  joined: "2024-08-01",
  group: "Nhóm TOEIC 900+",
};

export default function ProfileScreen({ navigation }: any) {
  const { lang } = useLanguage();
  const { darkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;

  function handleEditProfile() {
    Alert.alert(
      TEXT.edit[lang as "vi" | "en"],
      TEXT.editProfile[lang as "vi" | "en"],
    );
  }

  const getRoleLabel = (role: string) => {
    if (role === "owner") return TEXT.owner[lang as "vi" | "en"];
    if (role === "admin") return TEXT.admin[lang as "vi" | "en"];
    return TEXT.member[lang as "vi" | "en"];
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              user.avatar
                ? { uri: user.avatar }
                : require("../../assets/images/avatar.png")
            }
            style={styles.avatar}
          />
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: theme.primary }]}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: theme.primary }]}>{user.name}</Text>
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
              {TEXT.email[lang as "vi" | "en"]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.email}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.username[lang as "vi" | "en"]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.username}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.phone[lang as "vi" | "en"]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.phone}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.joined[lang as "vi" | "en"]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.joined}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              {TEXT.group[lang as "vi" | "en"]}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {user.group}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={19} color="#fff" />
          <Text style={styles.primaryBtnText}>
            {TEXT.editInfo[lang as "vi" | "en"]}
          </Text>
        </TouchableOpacity>
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
  editBtn: {
    position: "absolute",
    bottom: 7,
    right: 7,
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
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
  primaryBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
    paddingVertical: scale(13),
    paddingHorizontal: scale(22),
    marginTop: scale(12),
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scale(16),
    marginLeft: 10,
  },
});
