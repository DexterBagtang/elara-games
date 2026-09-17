import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { Celebration } from "@/game/Celebration";
import { playSound } from "@/game/sounds";
import { goHome } from "@/lib/goHome";
import { theme } from "@/theme";

const SHAPES = ["⭐️", "🔵", "🔺", "❤️", "🟩", "🌙", "🟠", "💜"] as const;
const SHAPE_MAX = 168; // fat target — a 2yo taps where the shape *was*
const SHAPE_MIN = 96; // ...but shrink before it would clip on a short screen
const HEADER_H = 76;
const PAD = 10;
const CELEBRATE_EVERY = 5;

type Pos = { x: number; y: number };

export default function TapTheShape() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // real size of the root view (fills the screen, so onLayout is reliable here)
  const size = useRef({ w: 0, h: 0 });
  const taps = useRef(0);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [shapeSize, setShapeSize] = useState(SHAPE_MAX);
  const [score, setScore] = useState(0);
  const [shape, setShape] = useState<string>(SHAPES[0]);
  const [ready, setReady] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // largest shape that fits in the play area below the header, on both axes
  const fitSize = useCallback(() => {
    const { w, h } = size.current;
    const availW = w - insets.left - insets.right - PAD * 2;
    const availH = h - insets.top - insets.bottom - HEADER_H - PAD * 2;
    return Math.max(SHAPE_MIN, Math.min(SHAPE_MAX, availW, availH));
  }, [insets]);

  const pickPos = useCallback(
    (from: Pos, s: number): Pos => {
      const { w, h } = size.current;
      const minX = insets.left + PAD;
      const minY = insets.top + HEADER_H + PAD;
      const spanX = Math.max(0, w - insets.right - s - PAD - minX);
      const spanY = Math.max(0, h - insets.bottom - s - PAD - minY);
      for (let i = 0; i < 12; i++) {
        const p = {
          x: minX + Math.random() * spanX,
          y: minY + Math.random() * spanY,
        };
        // move a visible amount, but not a full fling across the screen —
        // a near re-tap should still be able to catch it
        if (Math.hypot(p.x - from.x, p.y - from.y) > s * 0.7) return p;
      }
      return {
        x: minX + Math.random() * spanX,
        y: minY + Math.random() * spanY,
      };
    },
    [insets],
  );

  const onRootLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      size.current = { w: width, h: height };
      const s = fitSize();
      setShapeSize(s);
      setPos((from) => pickPos(from, s));
      setReady(true);
    },
    [fitSize, pickPos],
  );

  const onTapShape = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    taps.current += 1;
    setScore(taps.current);

    // every few taps, pay it off with a burst — a number a pre-reader can't
    // read is not a reward on its own
    if (taps.current % CELEBRATE_EVERY === 0) {
      playSound("win");
      setCelebrate(true);
    } else {
      playSound("pop");
    }

    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    setPos((from) => pickPos(from, shapeSize));
  }, [pickPos, shapeSize]);

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
          onHold={() => goHome(router)}
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
            width: shapeSize,
            height: shapeSize,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.lg,
            backgroundColor: theme.color.surface,
            boxShadow: theme.shadow.card,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <Breathing>
            <Text style={{ fontSize: Math.round(shapeSize * 0.62) }}>
              {shape}
            </Text>
          </Breathing>
        </Pressable>
      )}

      {celebrate && <Celebration onDone={() => setCelebrate(false)} />}
    </View>
  );
}
