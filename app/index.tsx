import React from "react";
import { View } from "react-native";
import OnboardingSlider from "../../components/OnboardingSlider";
import { useRouter } from "expo-router";

const OnboardingScreen = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <OnboardingSlider
        onFinish={() => router.replace("/login")}
        onSignUp={() => router.replace("/signup")}
        onLogin={() => router.replace("/login")}
      />
    </View>
  );
};

export default OnboardingScreen;

// Cách này chỉ hoạt động nếu bạn dùng expo-router >= 2.0.0 và file layout support
export const options = {
  headerShown: true,
};
