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
import { lightTheme, darkTheme } from "../../app/theme";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";
import { useDarkMode } from "../../app/DarkModeContext";
import { useLanguage } from "../../app/LanguageContext";

// ----- Responsive helpers -----
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isTablet = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= 600;
const clamp = (v: number, min: number, max: number) =>
  Math.max(Math.min(v, max), min);
const baseWidth = 375;
const maxScale = isTablet ? 1.22 : 1.06;
const minScale = 0.84;
const scale = (size: number) => {
  const ratio = SCREEN_WIDTH / baseWidth;
  return clamp(size * ratio, size * minScale, size * maxScale);
};
// --------------------------------

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Signup">;
};

const TEXT = {
  title: { vi: "Đăng ký", en: "Sign Up" },
  subtitle: {
    vi: "Nhập thông tin bên dưới để đăng ký miễn phí",
    en: "Enter your details below & free sign up",
  },
  email: { vi: "Email của bạn", en: "Your Email" },
  password: { vi: "Mật khẩu", en: "Password" },
  createAccount: { vi: "Tạo tài khoản", en: "Create account" },
  agree: {
    vi: "Bằng việc tạo tài khoản, bạn đồng ý với điều khoản sử dụng của chúng tôi.",
    en: "By creating an account you have to agree with our terms & condition.",
  },
  already: { vi: "Đã có tài khoản?", en: "Already have an account?" },
  login: { vi: "Đăng nhập", en: "Log in" },
};

export default function SignupForm({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { darkMode } = useDarkMode();
  const { lang } = useLanguage();
  const theme = darkMode ? darkTheme : lightTheme;

  // Độ rộng viền hai bên màn hình
  const SIDE_BORDER_WIDTH = 16;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Border trái */}
      <View
        style={[
          styles.sideBorder,
          { backgroundColor: theme.background, width: SIDE_BORDER_WIDTH },
        ]}
      />
      {/* Nội dung */}
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
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {TEXT.subtitle[lang]}
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
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {TEXT.createAccount[lang]}
            </Text>
          </TouchableOpacity>
          <View style={styles.checkRow}>
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.section, backgroundColor: theme.card },
              ]}
            />
            <Text style={[styles.checkLabel, { color: theme.subText }]}>
              {TEXT.agree[lang]}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.grayText, { color: theme.subText }]}>
              {TEXT.already[lang]}{" "}
            </Text>
            <Text
              style={[styles.link, { color: theme.primary }]}
              onPress={() => navigation.replace("Login")}
            >
              {TEXT.login[lang]}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* Border phải */}
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
    padding: scale(24),
    shadowOpacity: 0.08,
    shadowRadius: scale(10),
    elevation: 3,
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: scale(32),
    fontWeight: "bold",
    marginBottom: scale(4),
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: scale(14),
    marginBottom: scale(18),
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(16),
    marginBottom: scale(16),
    borderWidth: 0,
    borderBottomWidth: 2,
    // borderBottomColor sẽ override inline để lấy theo theme
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: scale(16),
  },
  eyeBtn: {
    padding: scale(8),
  },
  button: {
    borderRadius: scale(8),
    paddingVertical: scale(14),
    width: "100%",
    alignItems: "center",
    marginBottom: scale(16),
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: scale(16),
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(10),
    alignSelf: "flex-start",
    width: "100%",
  },
  checkbox: {
    width: scale(16),
    height: scale(16),
    borderWidth: 1,
    borderRadius: scale(4),
    marginRight: scale(8),
  },
  checkLabel: {
    fontSize: scale(12),
    flex: 1,
    flexWrap: "wrap",
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
  },
});
