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
import { useRouter } from "expo-router";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
          <Text style={{ color: Colors.light.icon }}>
            {showPassword ? "👁️" : "🙈"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>
      <View style={styles.checkRow}>
        <View style={styles.checkbox} />
        <Text style={styles.checkLabel}>
          By creating an account you have to agree with our them & condition.
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.grayText}>Already have an account ? </Text>
        <Text style={styles.link} onPress={() => router.replace("/login")}>
          Log in
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  subtitle: {
    color: Colors.light.icon,
    fontSize: 14,
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
    marginBottom: 16,
  },
  eyeBtn: {
    padding: 8,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.light.background,
    fontWeight: "bold",
    fontSize: 16,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: Colors.light.muted,
    borderRadius: 4,
    marginRight: 8,
  },
  checkLabel: {
    fontSize: 12,
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
    fontSize: 13,
  },
  link: {
    color: Colors.light.tint,
    fontWeight: "bold",
    fontSize: 13,
  },
});
