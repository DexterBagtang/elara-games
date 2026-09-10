import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { playSound } from "@/game/sounds";
import { theme } from "@/theme";

const SHAPES = ["⭐️", "🔵", "🔺", "❤️", "🟩", "🌙", "🟠", "💜"] as const;
const SHAPE_SIZE = 140;
const HEADER_H = 76;
const PAD = 10;

type Pos = { x: number; y: number };

export default function TapTheShape() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // real size of the root view (fills the screen, so onLayout is reliable here)
  const size = useRef({ w: 0, h: 0 });
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [shape, setShape] = useState<string>(SHAPES[0]);
  const [ready, setReady] = useState(false);

  const pickPos = useCallback(
    (from: Pos): Pos => {
      const { w, h } = size.current;
      const minX = insets.left + PAD;
      const minY = insets.top + HEADER_H + PAD;
      const spanX = Math.max(0, w - insets.right - SHAPE_SIZE - PAD - minX);
      const spanY = Math.max(0, h - insets.bottom - SHAPE_SIZE - PAD - minY);
      for (let i = 0; i < 12; i++) {
        const p = {
          x: minX + Math.random() * spanX,
          y: minY + Math.random() * spanY,
        };
        if (Math.hypot(p.x - from.x, p.y - from.y) > SHAPE_SIZE) return p;
      }
      return { x: minX + Math.random() * spanX, y: minY + Math.random() * spanY };
    },
    [insets]
  );

  const onRootLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      size.current = { w: width, h: height };
      setPos((from) => pickPos(from));
      setReady(true);
    },
    [pickPos]
  );

  const onTapShape = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound("pop");
    setScore((s) => s + 1);
    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    setPos((from) => pickPos(from));
  }, [pickPos]);

  return (
    <View
      style={{ flex: 1, backgroundColor: theme.color.bg }}
      onLayout={onRootLayout}
    >
      {/* header */}
      <View
        style={{
          height: HEADER_H,
          marginTop: insets.top,
          marginLeft: insets.left,
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

      {ready && (
        <Pressable
          // Opt out of NativeWind's jsx interop: it treats `style` as an
          // inline-rule source and drops the function form (position/left/top),
          // which pinned the shape under the header. Plain RN Pressable honours it.
          {...({ cssInterop: false } as object)}
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
            <Text style={{ fontSize: 88 }}>{shape}</Text>
          </Breathing>
        </Pressable>
      )}
    </View>
  );
}
