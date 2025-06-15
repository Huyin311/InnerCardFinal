import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./home";
import Card from "./Card";
import CardDetail from "../ScreenDetail/CardDetail"; // đặt ngoài tabs

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Card" component={Card} />
      <Stack.Screen name="CardDetail" component={CardDetail} />
    </Stack.Navigator>
  );
}

export default function TabsLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen
        name="CardStack"
        component={CardStack}
        options={{ title: "Card" }}
      />
    </Tab.Navigator>
  );
}
