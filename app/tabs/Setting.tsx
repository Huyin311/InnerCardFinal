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
  Modal,
  TextInput,
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
import { AuthContext } from "../../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

const TEXT = {
  header: { vi: "Cài đặt", en: "Settings" },
  profile: { vi: "Thông tin tài khoản", en: "Profile" },
  changePassword: { vi: "Đổi mật khẩu", en: "Change Password" },
  changePasswordTitle: { vi: "Đổi mật khẩu", en: "Change Password" },
  currentPassword: { vi: "Mật khẩu hiện tại", en: "Current password" },
  newPassword: { vi: "Mật khẩu mới", en: "New password" },
  confirmNewPassword: {
    vi: "Nhập lại mật khẩu mới",
    en: "Confirm new password",
  },
  passwordPlaceholder: { vi: "Nhập mật khẩu...", en: "Enter password..." },
  changePassword_alert: {
    vi: "Chức năng đổi mật khẩu.",
    en: "Password change function.",
  },
  password_success: {
    vi: "Đã đổi mật khẩu thành công!",
    en: "Password changed successfully!",
  },
  password_failed: {
    vi: "Đổi mật khẩu thất bại.",
    en: "Password change failed.",
  },
  password_mismatch: {
    vi: "Mật khẩu mới không khớp.",
    en: "Passwords do not match.",
  },
  password_short: {
    vi: "Mật khẩu mới phải từ 6 ký tự!",
    en: "New password must be at least 6 characters!",
  },
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
  save_success: {
    vi: "Đã lưu cài đặt!",
    en: "Settings saved!",
  },
  save_failed: {
    vi: "Lỗi khi lưu cài đặt.",
    en: "Failed to save settings.",
  },
  logout_success: {
    vi: "Đã đăng xuất.",
    en: "Successfully logged out.",
  },
  save: { vi: "Lưu", en: "Save" },
  close: { vi: "Đóng", en: "Close" },
};

export default function Setting() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const userId = useUserId();
  const { setUser } = React.useContext(AuthContext) || {};
  const [isLoading, setIsLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [dbDarkMode, setDbDarkMode] = React.useState(false);
  const [dbLang, setDbLang] = React.useState<"vi" | "en">("vi");

  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = darkMode ? darkTheme : lightTheme;
  const { lang, setLang } = useLanguage();

  // Đổi mật khẩu
  const [showChangePass, setShowChangePass] = React.useState(false);
  const [currentPass, setCurrentPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [reNewPass, setReNewPass] = React.useState("");
  const [changingPass, setChangingPass] = React.useState(false);

  React.useEffect(() => {
    if (!userId) return;
    let ignore = false;
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("setting")
        .select("dark_mode, language")
        .eq("user_id", userId)
        .single();

      if (!ignore) {
        if (data) {
          setDbDarkMode(data.dark_mode ?? false);
          setDbLang(data.language === "en" ? "en" : "vi");
          if (data.language && data.language !== lang) setLang(data.language);
          if (
            typeof data.dark_mode === "boolean" &&
            data.dark_mode !== darkMode
          )
            toggleDarkMode();
        } else {
          await supabase.from("setting").insert({
            user_id: userId,
            dark_mode: false,
            language: "vi",
            updated_at: new Date(),
          });
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

  async function saveSetting(newSetting: {
    dark_mode?: boolean;
    language?: string;
  }) {
    if (!userId) return;
    setSaving(true);
    const { data } = await supabase
      .from("setting")
      .select("id")
      .eq("user_id", userId)
      .single();

    let result;
    if (!data) {
      result = await supabase.from("setting").insert({
        user_id: userId,
        dark_mode: newSetting.dark_mode ?? dbDarkMode ?? false,
        language: newSetting.language ?? dbLang ?? "vi",
        updated_at: new Date(),
      });
    } else {
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
    }
  }

  function handlePressProfile() {
    navigation.navigate("Profile");
  }
  function handlePressChangePassword() {
    setShowChangePass(true);
  }
  function handlePressAbout() {
    Alert.alert(TEXT.about[lang], TEXT.about_detail[lang]);
  }
  async function handlePressLogout() {
    Alert.alert(TEXT.logout[lang], TEXT.logout_confirm[lang], [
      { text: TEXT.cancel[lang], style: "cancel" },
      {
        text: TEXT.logout[lang],
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          if (setUser) setUser(null);
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
          Alert.alert(TEXT.logout_success[lang]);
        },
      },
    ]);
  }

  function onToggleDarkMode(val: boolean) {
    setDbDarkMode(val);
    saveSetting({ dark_mode: val });
    if (val !== darkMode) toggleDarkMode();
  }

  function onToggleLang() {
    const newLang = dbLang === "vi" ? "en" : "vi";
    setDbLang(newLang);
    setLang(newLang);
    saveSetting({ language: newLang });
  }

  async function handleChangePassword() {
    if (!currentPass || !newPass || !reNewPass) {
      Alert.alert(TEXT.password_failed[lang], TEXT.passwordPlaceholder[lang]);
      return;
    }
    if (newPass.length < 6) {
      Alert.alert(TEXT.password_failed[lang], TEXT.password_short[lang]);
      return;
    }
    if (newPass !== reNewPass) {
      Alert.alert(TEXT.password_failed[lang], TEXT.password_mismatch[lang]);
      return;
    }
    setChangingPass(true);

    // 1. Lấy email hiện tại
    let email;
    if (supabase.auth.getUser) {
      const { data } = await supabase.auth.getUser();
      email = data.user?.email;
    } else {
      email = supabase.auth.user()?.email;
    }
    if (!email) {
      setChangingPass(false);
      Alert.alert(TEXT.password_failed[lang], "Không xác định được email!");
      return;
    }

    // 2. Đăng nhập lại để xác thực mật khẩu cũ
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPass,
    });

    if (signInErr) {
      setChangingPass(false);
      Alert.alert(
        TEXT.password_failed[lang],
        lang === "vi"
          ? "Mật khẩu hiện tại không đúng!"
          : "Current password is incorrect!",
      );
      return;
    }

    // 3. Đổi mật khẩu
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setChangingPass(false);

    if (!error) {
      setShowChangePass(false);
      setCurrentPass("");
      setNewPass("");
      setReNewPass("");
      Alert.alert(TEXT.password_success[lang]);
    } else {
      Alert.alert(TEXT.password_failed[lang], error.message || "");
    }
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

      {/* Đổi mật khẩu modal */}
      <Modal visible={showChangePass} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {TEXT.changePasswordTitle[lang]}
            </Text>
            <TextInput
              placeholder={TEXT.currentPassword[lang]}
              style={styles.input}
              value={currentPass}
              onChangeText={setCurrentPass}
              secureTextEntry
              autoFocus
              placeholderTextColor={theme.subText}
            />
            <TextInput
              placeholder={TEXT.newPassword[lang]}
              style={styles.input}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
              placeholderTextColor={theme.subText}
            />
            <TextInput
              placeholder={TEXT.confirmNewPassword[lang]}
              style={styles.input}
              value={reNewPass}
              onChangeText={setReNewPass}
              secureTextEntry
              placeholderTextColor={theme.subText}
            />
            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.primary, marginRight: 14 },
                ]}
                onPress={handleChangePassword}
                disabled={changingPass}
              >
                {changingPass ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {TEXT.save[lang]}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#aaa" }]}
                onPress={() => {
                  setShowChangePass(false);
                  setCurrentPass("");
                  setNewPass("");
                  setReNewPass("");
                }}
                disabled={changingPass}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {TEXT.close[lang]}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "#0009",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "86%",
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
    elevation: 7,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 14,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: "#222",
    backgroundColor: "#fff",
  },
  modalBtn: {
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
});
