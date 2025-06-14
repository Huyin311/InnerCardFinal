import React from "react";
import { Text, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Hello, Tailwind!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center", // tương đương items-center
    justifyContent: "center", // tương đương justify-center
    backgroundColor: "#ffffff", // tương đương bg-white
  },
  text: {
    fontSize: 18, // tương đương text-lg (18 là gần đúng)
    fontWeight: "700", // tương đương font-bold
    color: "#3b82f6", // tương đương text-blue-500 (màu xanh Tailwind)
  },
});
