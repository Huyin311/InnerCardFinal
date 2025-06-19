import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useDarkMode } from "../../app/DarkModeContext";
import { useLanguage } from "../../app/LanguageContext";
import { lightTheme, darkTheme } from "../../app/theme";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = Math.min(SCREEN_WIDTH, 0) >= 600;
const clamp = (v: number, min: number, max: number) =>
  Math.max(Math.min(v, max), min);
const baseWidth = 375;
const maxScale = isTablet ? 1.22 : 1.06;
const minScale = 0.84;
const scale = (size: number) => {
  const ratio = SCREEN_WIDTH / baseWidth;
  return clamp(size * ratio, size * minScale, size * maxScale);
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Login">;
};

const TEXT = {
  title: { vi: "Đăng nhập", en: "Log In" },
  email: { vi: "Email của bạn", en: "Your Email" },
  password: { vi: "Mật khẩu", en: "Password" },
  forgot: { vi: "Quên mật khẩu?", en: "Forget password?" },
  login: { vi: "Đăng nhập", en: "Login" },
  noAccount: { vi: "Chưa có tài khoản?", en: "Don't have an account?" },
  signup: { vi: "Đăng ký", en: "Sign up" },
};

export default function LoginForm({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { darkMode } = useDarkMode();
  const { lang } = useLanguage();
  const theme = darkMode ? darkTheme : lightTheme;

  // Chỉnh độ rộng viền tuỳ ý
  const SIDE_BORDER_WIDTH = 16;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Viền trái */}
      <View
        style={[
          styles.sideBorder,
          { backgroundColor: theme.background, width: SIDE_BORDER_WIDTH },
        ]}
      />
      {/* Nội dung chính */}
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowColor: theme.primary,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>
            {TEXT.title[lang]}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderBottomColor: theme.primary,
              },
            ]}
            placeholder={TEXT.email[lang]}
            placeholderTextColor={theme.subText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                {
                  flex: 1,
                  marginBottom: 0,
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderBottomColor: theme.primary,
                },
              ]}
              placeholder={TEXT.password[lang]}
              placeholderTextColor={theme.subText}
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text style={{ color: theme.subText, fontSize: scale(18) }}>
                {showPassword ? "👁️" : "🙈"}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: theme.subText }]}>
              {TEXT.forgot[lang]}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate("Tabs")}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {TEXT.login[lang]}
            </Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <Text style={[styles.grayText, { color: theme.subText }]}>
              {TEXT.noAccount[lang]}
            </Text>
            <Text
              style={[styles.link, { color: theme.primary }]}
              onPress={() => navigation.navigate("Signup")}
            >
              {TEXT.signup[lang]}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* Viền phải */}
      <View
        style={[
          styles.sideBorder,
          { backgroundColor: theme.background, width: SIDE_BORDER_WIDTH },
        ]}
      />
    </View>
  );
}

const CARD_WIDTH = clamp(Math.min(SCREEN_WIDTH * 0.92, 410), 320, 500);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
  },
  sideBorder: {
    height: "100%",
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: scale(16),
    padding: scale(22),
    shadowOpacity: 0.08,
    shadowRadius: scale(10),
    elevation: 3,
    alignItems: "center",
    alignSelf: "center",
    marginVertical: scale(18),
  },
  title: {
    fontSize: scale(30),
    fontWeight: "bold",
    marginBottom: scale(16),
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    borderRadius: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: scale(11),
    fontSize: scale(16),
    marginBottom: scale(13),
    borderWidth: 0,
    borderBottomWidth: 2,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 0,
  },
  eyeBtn: {
    padding: scale(8),
    justifyContent: "center",
    alignItems: "center",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginVertical: scale(6),
  },
  forgotText: {
    fontSize: scale(13),
  },
  button: {
    borderRadius: scale(8),
    paddingVertical: scale(13),
    width: "100%",
    alignItems: "center",
    marginVertical: scale(14),
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: scale(16),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  grayText: {
    fontSize: scale(13),
  },
  link: {
    fontWeight: "bold",
    fontSize: scale(13),
    marginLeft: 4,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: scale(12),
  },
  orText: {
    fontSize: scale(13),
    marginHorizontal: scale(10),
  },
  line: {
    flex: 1,
    height: 1,
  },
  socialRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: scale(16),
  },
  socialBtn: {
    borderRadius: scale(30),
    borderWidth: 1,
    padding: scale(14),
    marginHorizontal: scale(10),
  },
  socialIcon: {
    fontSize: scale(24),
  },
});
