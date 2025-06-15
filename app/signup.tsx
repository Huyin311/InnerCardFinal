import React from "react";
import { View, StyleSheet } from "react-native";
import SignupForm from "../components/Auth/SignupForm";
import { Colors } from "../constants/Colors";
import type { StackScreenProps } from "@react-navigation/stack";
import type { RootStackParamList } from "../AppNavigator"; // Đường dẫn tuỳ dự án của bạn

type Props = StackScreenProps<RootStackParamList, "Signup">;

export default function SignupScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <SignupForm navigation={navigation} />
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
