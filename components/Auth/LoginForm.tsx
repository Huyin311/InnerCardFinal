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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { supabase } from "../../supabase/supabaseClient";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator";

// Responsive helpers...
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
// ----------

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginForm({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }
    // Success! Chuyển sang màn hình chính
    navigation.replace("Tabs");
  };

  return (
    <KeyboardAvoidingView
      style={styles.card}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Log In</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        placeholderTextColor={Colors.light.icon}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Password"
          placeholderTextColor={Colors.light.icon}
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setShowPassword((v) => !v)}
        >
          <Text style={{ color: Colors.light.icon, fontSize: scale(18) }}>
            {showPassword ? "👁️" : "🙈"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forget password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.grayText}> Don&#39;t have an account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate("Signup")}>
          Sign up
        </Text>
      </View>
      {/* ... phần còn lại giữ nguyên ... */}
    </KeyboardAvoidingView>
  );
}

// ... giữ nguyên phần styles của bạn ...
// Responsive card width
const CARD_WIDTH = clamp(Math.min(SCREEN_WIDTH * 0.92, 410), 320, 500);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.background,
    borderRadius: scale(16),
    padding: scale(22),
    shadowColor: Colors.light.icon,
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
    color: Colors.light.text,
    marginBottom: scale(16),
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    backgroundColor: Colors.light.background,
    borderRadius: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: scale(11),
    fontSize: scale(16),
    marginBottom: scale(13),
    borderWidth: 1,
    borderColor: Colors.light.muted,
    color: Colors.light.text,
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
    color: Colors.light.icon,
    fontSize: scale(13),
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: scale(8),
    paddingVertical: scale(13),
    width: "100%",
    alignItems: "center",
    marginVertical: scale(14),
  },
  buttonText: {
    color: Colors.light.background,
    fontWeight: "bold",
    fontSize: scale(16),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  grayText: {
    color: Colors.light.icon,
    fontSize: scale(13),
  },
  link: {
    color: Colors.light.tint,
    fontWeight: "bold",
    fontSize: scale(13),
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: scale(12),
  },
  orText: {
    color: Colors.light.icon,
    fontSize: scale(13),
    marginHorizontal: scale(10),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.muted,
  },
  socialRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: scale(16),
  },
  socialBtn: {
    backgroundColor: Colors.light.background,
    borderRadius: scale(30),
    borderWidth: 1,
    borderColor: Colors.light.muted,
    padding: scale(14),
    marginHorizontal: scale(10),
  },
  socialIcon: {
    fontSize: scale(24),
  },
});
