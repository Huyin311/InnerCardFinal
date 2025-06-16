import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Card from "./Card";
import Study from "./Study";
import Group from "./Group";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
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
          } else if (route.name === "Study")
            iconName = focused ? "book" : "book-outline";
          else if (route.name === "Group")
            iconName = focused ? "people" : "people-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2C4BFF",
        tabBarInactiveTintColor: "#BFC8D6",
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Card" component={Card} />
      <Tab.Screen name="Study" component={Study} />
      <Tab.Screen name="Group" component={Group} />
    </Tab.Navigator>
  );
}
