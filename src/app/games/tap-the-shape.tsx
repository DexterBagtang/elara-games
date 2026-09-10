import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { playSound } from "@/game/sounds";

const SHAPES = ["⭐️", "🔵", "🔺", "❤️", "🟩", "🌙"] as const;
const SHAPE_SIZE = 120;

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
    <SafeAreaView className="flex-1 bg-sky">
      {/* parent gate: long-press to leave */}
      <Pressable
        onLongPress={() => router.back()}
        delayLongPress={700}
        className="absolute left-4 top-4 z-10 h-14 w-14 items-center justify-center rounded-full bg-white/40"
      >
        <Text className="text-2xl">🏠</Text>
      </Pressable>

      <Text className="mt-4 text-center text-3xl font-extrabold text-white">
        {score}
      </Text>

      <View className="flex-1" onLayout={onLayout}>
        <Pressable
          onPress={onTapShape}
          className="absolute items-center justify-center rounded-3xl bg-white active:scale-90"
          style={{
            width: SHAPE_SIZE,
            height: SHAPE_SIZE,
            left: pos.x,
            top: pos.y,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 72 }}>{shape}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
