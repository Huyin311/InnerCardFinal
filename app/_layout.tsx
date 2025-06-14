//app/_layout.tsx
import { Slot, useSegments } from "expo-router";

export default function AppLayout() {
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];

  // Các màn không render TabNavigator
  const hideTabScreens = ["onboarding", "login", "signup"];

  if (hideTabScreens.includes(currentScreen)) {
    return <Slot />;
  }

  // Render TabNavigator cho Home, Card, ...
  return <Slot />;
}
