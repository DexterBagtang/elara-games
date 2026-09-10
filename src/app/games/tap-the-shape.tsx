import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { playSound } from "@/game/sounds";

const SHAPES = ["⭐️", "🔵", "🔺", "❤️", "🟩", "🌙", "🟠", "💜"] as const;
const SHAPE_SIZE = 150;

type Pos = { x: number; y: number };

/** a new spot that isn't basically where we already are */
function nextPos(w: number, h: number, from: Pos): Pos {
  const maxX = Math.max(0, w - SHAPE_SIZE);
  const maxY = Math.max(0, h - SHAPE_SIZE);
  if (maxX === 0 && maxY === 0) return from;
  for (let i = 0; i < 10; i++) {
    const p = { x: Math.random() * maxX, y: Math.random() * maxY };
    if (Math.hypot(p.x - from.x, p.y - from.y) > SHAPE_SIZE * 0.9) return p;
  }
  return { x: Math.random() * maxX, y: Math.random() * maxY };
}

export default function TapTheShape() {
  const router = useRouter();
  const area = useRef({ w: 0, h: 0 });
  const [score, setScore] = useState(0);
  const [shape, setShape] = useState<string>(SHAPES[0]);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    area.current = { w: width, h: height };
    setPos((from) => nextPos(width, height, from));
    setReady(true);
  }, []);

  const onTapShape = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound("pop");
    setScore((s) => s + 1);
    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    setPos((from) => nextPos(area.current.w, area.current.h, from));
  }, []);

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

      {/* plain View so onLayout reliably reports the play area */}
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {ready && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tap the shape"
            onPress={onTapShape}
            className="items-center justify-center rounded-xl bg-surface shadow-card"
            style={({ pressed }) => ({
              position: "absolute",
              width: SHAPE_SIZE,
              height: SHAPE_SIZE,
              left: pos.x,
              top: pos.y,
              transform: [{ scale: pressed ? 0.9 : 1 }],
            })}
          >
            <Breathing>
              <Text style={{ fontSize: 92 }}>{shape}</Text>
            </Breathing>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
