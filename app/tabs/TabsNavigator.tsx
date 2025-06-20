import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Card from "./Card";
import Study from "./Study";
import Group from "./Group";
import Setting from "./Setting";
import { Ionicons } from "@expo/vector-icons";
import { useDarkMode } from "../DarkModeContext";
import { useUserId } from "../../hooks/useUserId";
import { useLanguage } from "../LanguageContext";

const TAB_LABELS: Record<string, { vi: string; en: string }> = {
  Home: { vi: "Trang chủ", en: "Home" },
  Card: { vi: "Thẻ", en: "Cards" },
  Study: { vi: "Ôn tập", en: "Study" },
  Group: { vi: "Nhóm", en: "Groups" },
  Setting: { vi: "Cài đặt", en: "Settings" },
};

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const { darkMode } = useDarkMode?.() || { darkMode: false };
  const userId = useUserId();
  const { lang } = useLanguage();

  if (!userId) {
    return null; // hoặc <ActivityIndicator size="large" style={{ flex: 1 }} />
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: TAB_LABELS[route.name]?.[lang] || route.name,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Card")
            iconName = focused ? "albums" : "albums-outline";
          else if (route.name === "Study")
            iconName = focused ? "book" : "book-outline";
          else if (route.name === "Group")
            iconName = focused ? "people" : "people-outline";
          else if (route.name === "Setting")
            iconName = focused ? "settings" : "settings-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2C4BFF",
        tabBarInactiveTintColor: "#BFC8D6",
        tabBarStyle: {
          backgroundColor: darkMode ? "#181E25" : "#fff",
          borderTopColor: darkMode ? "#232c3b" : "#E4EAF2",
        },
        unmountOnBlur: true, // optional: unmount tab when not focused
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Card" component={Card} />
      <Tab.Screen
        name="Study"
        component={Study}
        // Truyền userId mỗi lần tab được focus (cho mọi trường hợp chuyển tab)
        initialParams={{ userId }} // initial lần đầu
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.setParams({ userId }); // cập nhật userId khi nhấn tab
          },
        })}
      />
      <Tab.Screen name="Group" component={Group} />
      <Tab.Screen name="Setting" component={Setting} />
    </Tab.Navigator>
  );
}
