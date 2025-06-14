import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./app/login";
import SignupScreen from "./app/signup";
import OnboardingScreen from "./app/onboarding";
import TabsNavigator from "./app/tabs/TabsNavigator";
import CardDetailScreen from "./app/ScreenDetail/CardDetail";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  CardDetail: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Onboarding"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Tabs" component={TabsNavigator} />
        <Stack.Screen name="CardDetail" component={CardDetailScreen} />
        {/* KHÔNG được có {" "} hoặc <View> hoặc bất cứ gì khác */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
