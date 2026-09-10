import "../global.css";

import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // keep the screen on while a toddler plays
  useKeepAwake();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          // recommended per-screen orientation (react-native-screens);
          // applies to every route in this stack
          orientation: "landscape",
          contentStyle: { backgroundColor: "#FFFDF5" },
          animation: "fade",
        }}
      />
    </>
  );
}
