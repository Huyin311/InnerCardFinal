import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Card from "./Card";
import Study from "./Study";
import Group from "./Group";
import Setting from "./Setting";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const { darkMode } = useDarkMode?.() || { darkMode: false };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Card") {
            iconName = focused ? "albums" : "albums-outline";
          } else if (route.name === "Study") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Group") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Setting") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2C4BFF",
        tabBarInactiveTintColor: "#BFC8D6",
        tabBarStyle: {
          backgroundColor: darkMode ? "#181E25" : "#fff",
          borderTopColor: darkMode ? "#232c3b" : "#E4EAF2",
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Card" component={Card} />
      <Tab.Screen name="Study" component={Study} />
      <Tab.Screen name="Group" component={Group} />
      <Tab.Screen name="Setting" component={Setting} />
    </Tab.Navigator>
  );
}
