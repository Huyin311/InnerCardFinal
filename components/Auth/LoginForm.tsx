//components/Auth/LoginForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "../../constants/Colors";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../AppNavigator"; // Đường dẫn tuỳ dự án

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginForm({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
          <Text style={{ color: Colors.light.icon }}>
            {showPassword ? "👁️" : "🙈"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forget password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Tabs")}
      >
        <Text style={styles.buttonText}>Login</Text>
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

// ... phần styles giữ nguyên ...

const styles = StyleSheet.create({
  // ... giữ nguyên phần styles của bạn ...
  card: {
    width: 350,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.light.icon,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 18,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
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
    padding: 8,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginVertical: 8,
  },
  forgotText: {
    color: Colors.light.icon,
    fontSize: 13,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginVertical: 16,
  },
  buttonText: {
    color: Colors.light.background,
    fontWeight: "bold",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  grayText: {
    color: Colors.light.icon,
    fontSize: 13,
  },
  link: {
    color: Colors.light.tint,
    fontWeight: "bold",
    fontSize: 13,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 14,
  },
  orText: {
    color: Colors.light.icon,
    fontSize: 13,
    marginHorizontal: 10,
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
    gap: 16,
  },
  socialBtn: {
    backgroundColor: Colors.light.background,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.light.muted,
    padding: 14,
    marginHorizontal: 10,
  },
  socialIcon: {
    fontSize: 24,
  },
});
