import "../global.css";

import {
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from "@expo-google-fonts/fredoka";
import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { initAnimalSounds } from "@/game/animalSounds";
import { initSettings } from "@/game/settings";
import { initSounds } from "@/game/sounds";
import { theme } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // keep the screen on while a toddler plays
  useKeepAwake();

  const [fontsLoaded] = useFonts({
    Fredoka_300Light,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    initSounds();
    initAnimalSounds();
    void initSettings();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          // recommended per-screen orientation (react-native-screens);
          // applies to every route in this stack
          orientation: "landscape",
          contentStyle: { backgroundColor: theme.color.bg },
          animation: "fade",
        }}
      />
    </>
  );
}
