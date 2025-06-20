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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";
import { useDarkMode } from "../DarkModeContext";
import { lightTheme, darkTheme } from "../theme";
import { useLanguage } from "../LanguageContext";
import { supabase } from "../../supabase/supabaseClient";
import { useUserId } from "../../hooks/useUserId";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

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
  save_success: {
    vi: "Đã lưu cài đặt!",
    en: "Settings saved!",
  },
  save_failed: {
    vi: "Lỗi khi lưu cài đặt.",
    en: "Failed to save settings.",
  },
};

export default function Setting() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const userId = useUserId();
  const [isLoading, setIsLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // DB state
  const [notiEnabled, setNotiEnabled] = React.useState(true);
  const [dbDarkMode, setDbDarkMode] = React.useState(false);
  const [dbLang, setDbLang] = React.useState<"vi" | "en">("vi");

  // Context/UI state
  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang, setLang } = useLanguage();

  // Lấy setting từ DB khi mount
  React.useEffect(() => {
    if (!userId) return;
    let ignore = false;
    (async () => {
      setIsLoading(true);
      // Lấy setting hiện tại
      const { data, error } = await supabase
        .from("setting")
        .select("notification_enabled, dark_mode, language")
        .eq("user_id", userId)
        .single();

      if (!ignore) {
        if (data) {
          setNotiEnabled(data.notification_enabled ?? true);
          setDbDarkMode(data.dark_mode ?? false);
          setDbLang(data.language === "en" ? "en" : "vi");
          if (data.language && data.language !== lang) setLang(data.language);
          // Nếu trạng thái dark mode khác với context thì đồng bộ lại UI
          if (
            typeof data.dark_mode === "boolean" &&
            data.dark_mode !== darkMode
          )
            toggleDarkMode();
        } else {
          // Nếu chưa có dòng setting, tạo mới dòng mặc định trên DB
          await supabase.from("setting").insert({
            user_id: userId,
            notification_enabled: true,
            dark_mode: false,
            language: "vi",
            updated_at: new Date(),
          });
          setNotiEnabled(true);
          setDbDarkMode(false);
          setDbLang("vi");
          if (lang !== "vi") setLang("vi");
          if (darkMode) toggleDarkMode();
        }
        setIsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line
  }, [userId]);

  // Lưu lên DB khi đổi
  async function saveSetting(newSetting: {
    notification_enabled?: boolean;
    dark_mode?: boolean;
    language?: string;
  }) {
    if (!userId) return;
    setSaving(true);
    // Kiểm tra đã có row chưa
    const { data } = await supabase
      .from("setting")
      .select("id")
      .eq("user_id", userId)
      .single();

    let result;
    if (!data) {
      // Insert mới
      result = await supabase.from("setting").insert({
        user_id: userId,
        notification_enabled:
          newSetting.notification_enabled ?? notiEnabled ?? true,
        dark_mode: newSetting.dark_mode ?? dbDarkMode ?? false,
        language: newSetting.language ?? dbLang ?? "vi",
        updated_at: new Date(),
      });
    } else {
      // Update
      result = await supabase
        .from("setting")
        .update({
          ...newSetting,
          updated_at: new Date(),
        })
        .eq("user_id", userId);
    }
    setSaving(false);
    if (result.error) {
      Alert.alert(TEXT.save_failed[lang]);
    } else {
      // Alert.alert(TEXT.save_success[lang]);
    }
  }

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

  function onToggleNotification(val: boolean) {
    setNotiEnabled(val);
    saveSetting({ notification_enabled: val });
  }

  function onToggleDarkMode(val: boolean) {
    setDbDarkMode(val);
    saveSetting({ dark_mode: val });
    if (val !== darkMode) toggleDarkMode();
  }

  function onToggleLang() {
    const newLang = dbLang === "vi" ? "en" : "vi";
    setDbLang(newLang as "vi" | "en");
    setLang(newLang as "vi" | "en");
    saveSetting({ language: newLang });
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
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
              onValueChange={onToggleNotification}
              thumbColor={notiEnabled ? theme.primary : "#ccc"}
              trackColor={{ false: "#ddd", true: "#B7D1FF" }}
              disabled={saving}
            />
          </View>
          <View style={styles.row}>
            <Ionicons name="moon-outline" size={21} color={theme.primary} />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {TEXT.darkMode[lang]}
            </Text>
            <Switch
              style={{ marginLeft: "auto" }}
              value={dbDarkMode}
              onValueChange={onToggleDarkMode}
              thumbColor={dbDarkMode ? theme.primary : "#ccc"}
              trackColor={{ false: "#ddd", true: "#B7D1FF" }}
              disabled={saving}
            />
          </View>
          <TouchableOpacity
            style={styles.row}
            onPress={onToggleLang}
            disabled={saving}
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
                    color: dbLang === "vi" ? theme.primary : theme.subText,
                    fontWeight: dbLang === "vi" ? "bold" : "normal",
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
                    color: dbLang === "en" ? theme.primary : theme.subText,
                    fontWeight: dbLang === "en" ? "bold" : "normal",
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
