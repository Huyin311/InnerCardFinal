import React from "react";
import { View } from "react-native";
import OnboardingSlider from "../components/ui/OnboardingSlider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OnboardingScreen = () => {
  const router = useRouter();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingSlider
        onFinish={finishOnboarding}
        onSignUp={() => router.replace("/signup")}
        onLogin={() => router.replace("/login")}
      />
    </View>
  );
};

export default OnboardingScreen;
