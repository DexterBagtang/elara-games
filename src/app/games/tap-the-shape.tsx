import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { playSound } from "@/game/sounds";
import { theme } from "@/theme";

const SHAPES = ["⭐️", "🔵", "🔺", "❤️", "🟩", "🌙", "🟠", "💜"] as const;
const SHAPE_SIZE = 150;
const HEADER_H = 76;

type Pos = { x: number; y: number };

function nextPos(w: number, h: number, from: Pos): Pos {
  const maxX = Math.max(1, w - SHAPE_SIZE);
  const maxY = Math.max(1, h - SHAPE_SIZE);
  for (let i = 0; i < 12; i++) {
    const p = { x: Math.random() * maxX, y: Math.random() * maxY };
    if (Math.hypot(p.x - from.x, p.y - from.y) > SHAPE_SIZE) return p;
  }
  return { x: Math.random() * maxX, y: Math.random() * maxY };
}

export default function TapTheShape() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // play field = the screen minus the safe-area edges and the header row
  const field = useMemo(
    () => ({
      w: width - insets.left - insets.right,
      h: height - insets.top - insets.bottom - HEADER_H,
    }),
    [width, height, insets]
  );

  const [score, setScore] = useState(0);
  const [shape, setShape] = useState<string>(SHAPES[0]);
  const [pos, setPos] = useState<Pos>(() => ({
    x: (width - SHAPE_SIZE) / 2,
    y: 40,
  }));

  const onTapShape = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound("pop");
    setScore((s) => s + 1);
    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    setPos((from) => nextPos(field.w, field.h, from));
  }, [field]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.color.bg,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      }}
    >
      {/* header */}
      <View
        style={{
          height: HEADER_H,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingHorizontal: 24,
        }}
      >
        <HoldButton
          emoji="🏠"
          accessibilityLabel="Go home"
          onHold={() => router.back()}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 30 }}>⭐️</Text>
          <Txt variant="huge" style={{ fontSize: 34 }}>
            {score}
          </Txt>
        </View>
      </View>

      {/* play field */}
      <View style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tap the shape"
          onPress={onTapShape}
          style={({ pressed }) => ({
            position: "absolute",
            left: pos.x,
            top: pos.y,
            width: SHAPE_SIZE,
            height: SHAPE_SIZE,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.lg,
            backgroundColor: theme.color.surface,
            boxShadow: theme.shadow.card,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <Breathing>
            <Text style={{ fontSize: 92 }}>{shape}</Text>
          </Breathing>
        </Pressable>
      </View>
    </View>
  );
}
