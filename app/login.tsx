import React from "react";
import { View, StyleSheet } from "react-native";
import LoginForm from "../components/Auth/LoginForm";
import { Colors } from "../constants/Colors";
import type { StackScreenProps } from "@react-navigation/stack";
import type { RootStackParamList } from "../AppNavigator"; // Đường dẫn tuỳ repo bạn

type Props = StackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <LoginForm navigation={navigation} />
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
