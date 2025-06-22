import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../supabase/supabaseClient";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../../app/DarkModeContext";
import { useLanguage } from "../../app/LanguageContext";
import { lightTheme, darkTheme } from "../../app/theme";

// Responsive helpers
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;
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
  loginTitle: { vi: "Đăng nhập", en: "Log In" },
  emailPlaceholder: { vi: "Email của bạn", en: "Your Email" },
  passwordPlaceholder: { vi: "Mật khẩu", en: "Password" },
  login: { vi: "Đăng nhập", en: "Login" },
  noAccount: { vi: " Chưa có tài khoản? ", en: " Don't have an account? " },
  signup: { vi: "Đăng ký", en: "Sign up" },
  error: { vi: "Lỗi", en: "Error" },
  enterAll: {
    vi: "Vui lòng nhập email và mật khẩu.",
    en: "Please enter both email and password.",
  },
  loginFailed: { vi: "Đăng nhập thất bại", en: "Login failed" },
};

export default function LoginForm({ navigation }: Props) {
  const { darkMode } = useDarkMode();
  const { lang } = useLanguage();
  const theme = darkMode ? darkTheme : lightTheme;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(TEXT.error[lang], TEXT.enterAll[lang]);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert(TEXT.loginFailed[lang], error.message);
      return;
    }
    navigation.replace("Tabs");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.background, shadowColor: theme.primary },
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>
            {TEXT.loginTitle[lang]}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder={TEXT.emailPlaceholder[lang]}
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
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder={TEXT.passwordPlaceholder[lang]}
              placeholderTextColor={theme.subText}
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={scale(20)}
                color={theme.subText}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={theme.section ? theme.section : "#fff"}
              />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.section ? theme.section : "#fff" },
                ]}
              >
                {TEXT.login[lang]}
              </Text>
            )}
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
    </SafeAreaView>
  );
}

const CARD_WIDTH = clamp(Math.min(SCREEN_WIDTH * 0.92, 410), 320, 500);

const styles = StyleSheet.create({
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
    borderWidth: 1,
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
  button: {
    borderRadius: scale(8),
    paddingVertical: scale(13),
    width: "100%",
    alignItems: "center",
    marginVertical: scale(14),
    borderWidth: 1,
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
  },
});
