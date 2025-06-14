//app/login.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import LoginForm from "../components/Auth/LoginForm";
import { Colors } from "../constants/Colors";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <LoginForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
});
