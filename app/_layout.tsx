//app/_layout.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Card from "./Card";
import CustomTabBar from "@/components/CustomTabBar";
import { Slot, useSegments } from "expo-router";

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  // Lấy segment để biết đang ở route nào
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];

  // Các màn KHÔNG render TabNavigator
  const hideTabScreens = ["onboarding", "login", "signup"];

  if (hideTabScreens.includes(currentScreen)) {
    // Render đúng màn hình đó
    return <Slot />;
  }

  // Còn lại, render TabNavigator
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Card" component={Card} />
    </Tab.Navigator>
  );
}
