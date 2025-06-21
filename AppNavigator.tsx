import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./app/login";
import SignupScreen from "./app/signup";
import OnboardingScreen from "./app/onboarding";
import TabsNavigator from "./app/tabs/TabsNavigator";
import CardDetailScreen from "./app/ScreenDetail/CardDetail";
import StudyScreen from "./app/tabs/Study";
import GroupDetailScreen from "./app/tabs/GroupDetail";
import MemberGroup from "./app/tabs/MemberGroup";
import MemberInfo from "./app/tabs/MemberInfo";
import GroupAnnouncements from "@/app/tabs/GroupAnnouncements";
import GroupActivities from "@/app/tabs/GroupActivities";
import GroupSetting from "./app/tabs/GroupSetting";
import GroupQuizScreen from "./app/tabs/GroupQuizScreen";
import GroupQuizCreateScreen from "./app/tabs/GroupQuizCreateScreen";
import ProfileScreen from "./app/tabs/Profile";
import GroupCards from "./app/tabs/GroupCards";
import ShareDeckToGroup from "./app/tabs/ShareDeckToGroup";
import GroupDeckDetail from "./app/tabs/GroupDeckDetail";
import EditDeck from "./app/tabs/EditDeck";
import GroupStatistic from "./app/tabs/GroupStatistic";
import GroupPermission from "./app/tabs/GroupPermission";
import GroupQuizDoScreen from "./app/tabs/GroupQuizDoScreen";
import GroupQuizLeaderboardButton from "./app/tabs/GroupQuizLeaderboard";
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  CardDetail: { deckId: number };
  Study: { deckId: number };
  GroupDetail: { groupId: number };
  MemberGroup: { groupId: number };
  MemberInfo: {
    userId: string;
    role: string;
    name: string;
    avatar: any;
    groupId: number;
  };
  GroupAnnouncements: { groupId: number };
  GroupActivities: { groupId: number };
  GroupSetting: { groupId: number };
  GroupQuizScreen: { groupId: number };
  GroupQuizCreateScreen: { groupId: number };
  Profile: undefined;
  GroupCards: { groupId: number };
  ShareDeckToGroup: { groupId: number; onShare?: () => void };
  GroupDeckDetail: { groupId: number; deckId: number };
  EditDeck: { deckId: number; onDone?: () => void };
  GroupStatistic: { groupId: number };
  GroupPermission: { groupId: number };
  GroupQuizDoScreen: { groupId: number };
  GroupQuizLeaderboard: {};
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
        <Stack.Screen
          name="GroupQuizCreateScreen"
          component={GroupQuizCreateScreen}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="GroupCards" component={GroupCards} />
        <Stack.Screen name="ShareDeckToGroup" component={ShareDeckToGroup} />
        <Stack.Screen name="GroupDeckDetail" component={GroupDeckDetail} />
        <Stack.Screen name="EditDeck" component={EditDeck} />
        <Stack.Screen name="GroupStatistic" component={GroupStatistic} />
        <Stack.Screen name="GroupPermission" component={GroupPermission} />
        <Stack.Screen name="GroupQuizDoScreen" component={GroupQuizDoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
