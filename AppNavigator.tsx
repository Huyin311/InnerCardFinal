import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./app/login";
import SignupScreen from "./app/signup";
import OnboardingScreen from "./app/onboarding";
import TabsNavigator from "./app/tabs/TabsNavigator";
import CardDetailScreen from "./app/ScreenDetail/CardDetail";
import StudyScreen from "./app/tabs/Study"; // Thêm dòng này
import GroupDetailScreen from "./app/tabs/GroupDetail";
import MemberGroup from "./app/tabs/MemberGroup";
import MemberInfo from "./app/tabs/MemberInfo";
import GroupAnnouncements from "@/app/tabs/GroupAnnouncements";
import GroupActivities from "@/app/tabs/GroupActivities";
import GroupSetting from "./app/tabs/GroupSetting";
import { GroupQuizScreen } from "./app/tabs/GroupQuizScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  CardDetail: undefined;
  Study: undefined;
  GroupDetail: undefined;
  MemberGroup: undefined;
  MemberInfo: undefined;
  GroupAnnouncements: undefined;
  GroupActivities: undefined;
  GroupSetting: undefined;
  GroupQuizScreen: undefined;
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
        <Stack.Screen name="Study" component={StudyScreen} />
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
        <Stack.Screen name="MemberGroup" component={MemberGroup} />
        <Stack.Screen name="MemberInfo" component={MemberInfo} />
        <Stack.Screen
          name="GroupAnnouncements"
          component={GroupAnnouncements}
        />
        <Stack.Screen name="GroupActivities" component={GroupActivities} />
        <Stack.Screen name="GroupSetting" component={GroupSetting} />
        <Stack.Screen name="GroupQuizScreen" component={GroupQuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
