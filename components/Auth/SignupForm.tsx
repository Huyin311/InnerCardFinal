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
import { Ionicons } from "@expo/vector-icons";

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

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Signup">;
};

export default function SignupForm({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !username || !email || !password || !passwordAgain) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (password !== passwordAgain) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Auth signUp error:", error);
        setLoading(false);
        Alert.alert(
          "Sign up failed",
          error.message || "Unknown error during Auth signUp.",
        );
        return;
      }
      if (!data?.user?.id) {
        console.error("No user id returned from Supabase Auth:", data);
        setLoading(false);
        Alert.alert(
          "Sign up failed",
          "No user id returned from Supabase Auth.",
        );
        return;
      }

      const userId = data.user.id;

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUser) {
        setLoading(false);
        Alert.alert(
          "Sign up failed",
          "Username already exists. Please choose another one.",
        );
        return;
      }

      const { error: profileError } = await supabase.from("users").insert([
        {
          id: userId,
          full_name: fullName,
          username: username,
          email: email,
        },
      ]);
      if (profileError) {
        console.error("Insert profile error:", profileError);
        setLoading(false);
        if (
          profileError.code === "23505" &&
          profileError.message?.includes("users_username_key")
        ) {
          Alert.alert(
            "Sign up failed",
            "Username already exists. Please choose another one.",
          );
        } else {
          Alert.alert(
            "Sign up failed",
            "Could not save profile: " +
              (profileError.message || "Unknown insert error."),
          );
        }
        return;
      }

      setLoading(false);
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
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setPasswordAgain("");
    } catch (err) {
      setLoading(false);
      console.error("Unexpected signup error:", err);
      Alert.alert(
        "Sign up failed",
        "Unexpected error: " +
          (err instanceof Error ? err.message : JSON.stringify(err)),
      );
    }
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
        placeholder="Full Name"
        placeholderTextColor={Colors.light.icon}
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={Colors.light.icon}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
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
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={scale(20)}
            color={Colors.light.icon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Repeat Password"
          placeholderTextColor={Colors.light.icon}
          value={passwordAgain}
          secureTextEntry={!showPasswordAgain}
          onChangeText={setPasswordAgain}
        />
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setShowPasswordAgain((v) => !v)}
        >
          <Ionicons
            name={showPasswordAgain ? "eye" : "eye-off"}
            size={scale(20)}
            color={Colors.light.icon}
          />
        </TouchableOpacity>
      </View>
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
          By creating an account you have to agree with our term & condition.
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
