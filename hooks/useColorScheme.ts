import { useColorScheme as _useColorScheme } from "react-native";

// Custom hook để tương thích với expo-router
export function useColorScheme() {
  return _useColorScheme() ?? "light";
}
