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
  navigation: StackNavigationProp<RootStackParamList, "Signup">;
};

export default function SignupForm({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !passwordAgain) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (password !== passwordAgain) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://your-app-domain.com/verified", // đổi thành domain app bạn nếu muốn
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }
    Alert.alert(
      "Check your email",
      "We have sent a confirmation email. Please confirm to activate your account.",
      [
        {
          text: "OK",
          onPress: () => navigation.replace("Login"),
        },
      ],
    );
    setEmail("");
    setPassword("");
    setPasswordAgain("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.card}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>
        Enter your details below & free sign up
      </Text>
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
      <TextInput
        style={styles.input}
        placeholder="Repeat Password"
        placeholderTextColor={Colors.light.icon}
        value={passwordAgain}
        secureTextEntry={!showPassword}
        onChangeText={setPasswordAgain}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create account</Text>
        )}
      </TouchableOpacity>
      <View style={styles.checkRow}>
        <View style={styles.checkbox} />
        <Text style={styles.checkLabel}>
          By creating an account you have to agree with our them & condition.
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.grayText}>Already have an account ? </Text>
        <Text style={styles.link} onPress={() => navigation.replace("Login")}>
          Log in
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ... giữ nguyên phần styles của bạn ...

const CARD_WIDTH = clamp(Math.min(SCREEN_WIDTH * 0.92, 410), 320, 500);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.background,
    borderRadius: scale(16),
    padding: scale(24),
    shadowColor: Colors.light.icon,
    shadowOpacity: 0.08,
    shadowRadius: scale(10),
    elevation: 3,
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: scale(32),
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: scale(4),
    alignSelf: "flex-start",
  },
  subtitle: {
    color: Colors.light.icon,
    fontSize: scale(14),
    marginBottom: scale(18),
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    backgroundColor: Colors.light.background,
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(16),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: Colors.light.muted,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.tint,
    borderRadius: scale(8),
    paddingVertical: scale(14),
    width: "100%",
    alignItems: "center",
    marginBottom: scale(16),
  },
  buttonText: {
    color: Colors.light.background,
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
    borderColor: Colors.light.muted,
    borderRadius: scale(4),
    marginRight: scale(8),
  },
  checkLabel: {
    fontSize: scale(12),
    color: Colors.light.icon,
    flex: 1,
    flexWrap: "wrap",
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
});
