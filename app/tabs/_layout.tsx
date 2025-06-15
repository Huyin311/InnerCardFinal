import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./home";
import Card from "./Card";
import CardDetail from "../ScreenDetail/CardDetail"; // Đặt ngoài tabs

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack cho tab Card, chứa cả Card và CardDetail
function CardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Card" component={Card} />
      <Stack.Screen name="CardDetail" component={CardDetail} />
    </Stack.Navigator>
  );
}

// Tab bar chỉ có Home và Card (CardDetail là màn hình ẩn, chỉ navigate bằng code)
export default function TabsLayout() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen
        name="CardStack"
        component={CardStack}
        options={{ title: "Card" }}
      />
    </Tab.Navigator>
  );
}
