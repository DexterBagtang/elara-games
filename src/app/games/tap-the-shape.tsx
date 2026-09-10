import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { playSound } from "@/game/sounds";

const SHAPES = ["⭐️", "🔵", "🔺", "❤️", "🟩", "🌙", "🟠", "💜"] as const;
const SHAPE_SIZE = 150;

type Pos = { x: number; y: number };

function randomPos(w: number, h: number): Pos {
  return {
    x: Math.random() * Math.max(0, w - SHAPE_SIZE),
    y: Math.random() * Math.max(0, h - SHAPE_SIZE),
  };
}

export default function TapTheShape() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [shape, setShape] = useState<string>(SHAPES[0]);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [area, setArea] = useState({ w: 0, h: 0 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ w: width, h: height });
    setPos(randomPos(width, height));
  }, []);

  const onTapShape = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound("pop");
    setScore((s) => s + 1);
    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    setPos(randomPos(area.w, area.h));
  }, [area]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center gap-4 px-6 pt-2">
        <HoldButton
          emoji="🏠"
          accessibilityLabel="Go home"
          onHold={() => router.back()}
        />
        <View className="flex-row items-center gap-2">
          <Text style={{ fontSize: 30 }}>⭐️</Text>
          <Txt variant="huge" style={{ fontSize: 34 }}>
            {score}
          </Txt>
        </View>
      </View>

      <View className="flex-1" onLayout={onLayout}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tap the shape"
          onPress={onTapShape}
          className="absolute items-center justify-center rounded-xl bg-surface shadow-card transition active:scale-90"
          style={{
            width: SHAPE_SIZE,
            height: SHAPE_SIZE,
            left: pos.x,
            top: pos.y,
          }}
        >
          <Breathing>
            <Text style={{ fontSize: 92 }}>{shape}</Text>
          </Breathing>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
