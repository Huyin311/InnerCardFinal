//app/signup.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import SignupForm from "../components/Auth/SignupForm";
import { Colors } from "../constants/Colors";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <SignupForm />
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
