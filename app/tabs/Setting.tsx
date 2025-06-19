import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

// Đa ngữ
const TEXT = {
  header: { vi: "Cài đặt", en: "Settings" },
  profile: { vi: "Thông tin tài khoản", en: "Profile" },
  changePassword: { vi: "Đổi mật khẩu", en: "Change Password" },
  notification: { vi: "Nhận thông báo", en: "Notification" },
  darkMode: { vi: "Chế độ tối", en: "Dark Mode" },
  language: { vi: "Ngôn ngữ", en: "Language" },
  about: { vi: "Về ứng dụng", en: "About" },
  logout: { vi: "Đăng xuất", en: "Logout" },
  logout_confirm: {
    vi: "Bạn có chắc muốn đăng xuất không?",
    en: "Are you sure you want to logout?",
  },
  cancel: { vi: "Huỷ", en: "Cancel" },
  version: { vi: "Phiên bản 1.0.0", en: "Version 1.0.0" },
  about_detail: {
    vi: "Quiz Battle App\nPhiên bản 1.0.0\n© 2025",
    en: "Quiz Battle App\nVersion 1.0.0\n© 2025",
  },
  changePassword_alert: {
    vi: "Chức năng đổi mật khẩu.",
    en: "Password change function.",
  },
};

export default function Setting() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [notiEnabled, setNotiEnabled] = React.useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang, setLang } = useLanguage();

  function handlePressProfile() {
    navigation.navigate("Profile");
  }
  function handlePressChangePassword() {
    Alert.alert(TEXT.changePassword[lang], TEXT.changePassword_alert[lang]);
  }
  function handlePressAbout() {
    Alert.alert(TEXT.about[lang], TEXT.about_detail[lang]);
  }
  function handlePressLogout() {
    Alert.alert(TEXT.logout[lang], TEXT.logout_confirm[lang], [
      { text: TEXT.cancel[lang], style: "cancel" },
      {
        text: TEXT.logout[lang],
        style: "destructive",
        onPress: () => {
          // Xử lý logout
        },
      },
    ]);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: theme.primary }]}>
          {TEXT.header[lang]}
        </Text>
        <View style={[styles.section, { backgroundColor: theme.section }]}>
          <TouchableOpacity style={styles.row} onPress={handlePressProfile}>
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={theme.primary}
            />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {TEXT.profile[lang]}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.subText || "#bbb"}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={handlePressChangePassword}
          >
            <Ionicons name="key-outline" size={22} color={theme.primary} />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {TEXT.changePassword[lang]}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.subText || "#bbb"}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.section, { backgroundColor: theme.section }]}>
          <View style={styles.row}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.primary}
            />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {TEXT.notification[lang]}
            </Text>
            <Switch
              style={{ marginLeft: "auto" }}
              value={notiEnabled}
              onValueChange={setNotiEnabled}
              thumbColor={notiEnabled ? theme.primary : "#ccc"}
              trackColor={{ false: "#ddd", true: "#B7D1FF" }}
            />
          </View>
          <View style={styles.row}>
            <Ionicons name="moon-outline" size={21} color={theme.primary} />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {TEXT.darkMode[lang]}
            </Text>
            <Switch
              style={{ marginLeft: "auto" }}
              value={darkMode}
              onValueChange={toggleDarkMode}
              thumbColor={darkMode ? theme.primary : "#ccc"}
              trackColor={{ false: "#ddd", true: "#B7D1FF" }}
            />
          </View>
          {/* Nút toggle ngôn ngữ */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => setLang(lang === "vi" ? "en" : "vi")}
          >
            <Ionicons name="language-outline" size={21} color={theme.primary} />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {TEXT.language[lang]}
            </Text>
            <View style={styles.langToggle}>
              <Text
                style={[
                  styles.langText,
                  {
                    color: lang === "vi" ? theme.primary : theme.subText,
                    fontWeight: lang === "vi" ? "bold" : "normal",
                  },
                ]}
              >
                VI
              </Text>
              <Text style={{ color: theme.subText, marginHorizontal: 6 }}>
                |
              </Text>
              <Text
                style={[
                  styles.langText,
                  {
                    color: lang === "en" ? theme.primary : theme.subText,
                    fontWeight: lang === "en" ? "bold" : "normal",
                  },
                ]}
              >
                EN
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.section, { backgroundColor: theme.section }]}>
          <TouchableOpacity style={styles.row} onPress={handlePressAbout}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.primary}
            />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {TEXT.about[lang]}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.subText || "#bbb"}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.section, { backgroundColor: theme.section }]}>
          <TouchableOpacity
            style={[
              styles.row,
              { backgroundColor: theme.dangerBg || "#fff0f0" },
            ]}
            onPress={handlePressLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={theme.danger || "#e74c3c"}
            />
            <Text
              style={[styles.rowText, { color: theme.danger || "#e74c3c" }]}
            >
              {TEXT.logout[lang]}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.version, { color: theme.subText || "#aaa" }]}>
          {TEXT.version[lang]}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: scale(18), paddingBottom: scale(28) },
  header: {
    fontWeight: "bold",
    fontSize: scale(22),
    marginBottom: scale(12),
    marginTop: scale(6),
    alignSelf: "center",
  },
  section: {
    borderRadius: 10,
    marginBottom: scale(16),
    paddingVertical: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(8),
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
  },
  rowText: {
    fontSize: scale(16),
    marginLeft: 12,
    fontWeight: "500",
  },
  version: { alignSelf: "center", marginTop: 10, fontSize: 14 },
  langToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#0000",
  },
  langText: {
    fontSize: scale(15),
    minWidth: 22,
    textAlign: "center",
  },
});
