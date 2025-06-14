//app/index.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Root() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // RESET ONBOARDING FOR TEST PURPOSES
    AsyncStorage.removeItem("hasSeenOnboarding").then(() => {
      console.log("Reset hasSeenOnboarding!");
    });

    (async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      console.log("hasSeenOnboarding:", hasSeenOnboarding);
      if (hasSeenOnboarding === "true") {
        router.replace("/login");
      } else {
        router.replace("/onboarding");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return null;
}
