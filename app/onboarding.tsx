import React from "react";
import { View } from "react-native";
import OnboardingSlider from "../components/ui/OnboardingSlider";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../AppNavigator";

type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

type OnboardingScreenProps = {
  navigation: OnboardingScreenNavigationProp;
  route: RouteProp<RootStackParamList, "Onboarding">;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const finishOnboarding = async () => {
    // ... lưu AsyncStorage nếu cần
    navigation.replace("Login");
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingSlider
        onFinish={finishOnboarding}
        onSignUp={() => navigation.replace("Signup")}
        onLogin={() => navigation.replace("Login")}
      />
    </View>
  );
};

export default OnboardingScreen;
