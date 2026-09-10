import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Celebration } from "@/game/Celebration";
import { ColoringCanvas } from "@/game/ColoringCanvas";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { BLANK, ERASER, PALETTE, type Swatch } from "@/game/palette";
import { getPicture, type Region } from "@/game/pictures";
import { playSound } from "@/game/sounds";
import { speak } from "@/game/speak";
import { theme } from "@/theme";

const SWATCHES: Swatch[] = [...PALETTE, ERASER];

// fat toddler targets, stacked in a side rail (landscape has width to spare,
// not height — a bottom strip stole the canvas's room)
const SWATCH = 58;
const RAIL_W = 156;
const ERASER_BG = "#ECECF1"; // a visible "surface", so the eraser reads as a button not a blank hole

/**
 * Tiny accent regions — butterfly spots, fish bubbles, rocket stars, small
 * windows. Still colorable, but they don't gate the celebration: a 2yo can't
 * reliably land a 6px dot, and being forever "one bubble short of done" is the
 * opposite of the payoff we want.
 */
function isMinor(r: Region): boolean {
  if (r.kind === "circle") return r.r < 14;
  if (r.kind === "ellipse") return Math.min(r.rx, r.ry) < 12;
  if (r.kind === "rect") return Math.min(r.width, r.height) < 30;
  return false;
}

export default function ColoringScreen() {
  const router = useRouter();
  const { picture: pictureId } = useLocalSearchParams<{ picture: string }>();
  const picture = useMemo(() => getPicture(pictureId), [pictureId]);
  // regions that must be filled for "done" (minor accents don't count)
  const required = useMemo(
    () => (picture ? picture.regions.filter((r) => !isMinor(r)) : []),
    [picture],
  );

  const [fills, setFills] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Swatch>(PALETTE[0]);
  const [canvas, setCanvas] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const onCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvas(Math.max(0, Math.min(width, height) - 8));
  }, []);

  const onTapRegion = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound("pop");
      const next = { ...fills, [id]: selected.color };
      setFills(next);

      // check for "done" right here, off the tap — no effect needed
      if (
        !celebrated &&
        required.length > 0 &&
        required.every((r) => next[r.id] && next[r.id] !== BLANK)
      ) {
        setCelebrated(true);
        setShowCelebration(true);
        playSound("win");
      }
    },
    [fills, selected, celebrated, required],
  );

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFills({});
    setCelebrated(false);
    setShowCelebration(false);
  }, []);

  if (!picture) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bg">
        <Txt variant="title">Picture not found</Txt>
        <Pressable
          // NativeWind's jsx interop drops the function-form `style`; opt out so
          // plain RN keeps it (see tap-the-shape.tsx).
          {...({ cssInterop: false } as object)}
          onPress={() => router.back()}
          style={({ pressed }) => ({
            marginTop: 16,
            borderRadius: theme.radius.full,
            backgroundColor: theme.color.berry,
            paddingHorizontal: 24,
            paddingVertical: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Txt variant="label" style={{ color: "#FFFFFF" }}>
            Go back
          </Txt>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* top bar — both actions are hold-to-fire, toddler-proof */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <HoldButton
          emoji="🏠"
          accessibilityLabel="Go home"
          onHold={() => router.back()}
        />
        <Txt variant="title">
          {picture.emoji} {picture.title}
        </Txt>
        <HoldButton
          emoji="🗑️"
          accessibilityLabel="Clear the picture"
          onHold={reset}
        />
      </View>

      {/* canvas left, colour rail right — the drawing gets the full height */}
      <View className="flex-1 flex-row">
        <View
          className="flex-1 items-center justify-center"
          onLayout={onCanvasLayout}
        >
          {canvas > 0 && (
            <ColoringCanvas
              picture={picture}
              fills={fills}
              onTapRegion={onTapRegion}
              width={canvas}
              height={canvas}
            />
          )}
        </View>

        {/* the chosen colour lifts, rings and casts a shadow so a pre-reader
            can see "this is the one" at a glance */}
        <View
          style={{
            width: RAIL_W,
            flexDirection: "row",
            flexWrap: "wrap",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            paddingHorizontal: 12,
            paddingBottom: 8,
          }}
        >
          {SWATCHES.map((s) => {
            const isSelected = s.id === selected.id;
            const isEraser = s.id === ERASER.id;
            return (
              <Pressable
                key={s.id}
                // NativeWind's jsx interop can't evaluate a function-form `style`
                // and silently drops it — which zeroed the width/height and made
                // every swatch vanish. Opt out; plain RN honours the style.
                {...({ cssInterop: false } as object)}
                accessibilityRole="button"
                accessibilityLabel={s.label}
                accessibilityState={{ selected: isSelected }}
                hitSlop={12}
                onPress={() => {
                  Haptics.selectionAsync();
                  playSound("tap");
                  speak(s.label); // name the colour — free language practice
                  setSelected(s);
                }}
                style={({ pressed }) => ({
                  width: SWATCH,
                  height: SWATCH,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: theme.radius.full,
                  backgroundColor: isEraser ? ERASER_BG : s.color,
                  borderWidth: isSelected ? 6 : 3,
                  borderColor: isSelected ? theme.color.ink : "#FFFFFF",
                  boxShadow: isSelected
                    ? theme.shadow.raised
                    : theme.shadow.card,
                  transform: [
                    { scale: isSelected ? 1.14 : pressed ? 0.92 : 1 },
                    { translateY: isSelected ? -6 : 0 },
                  ],
                })}
              >
                {isEraser && <Text style={{ fontSize: 26 }}>🧽</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>

      {showCelebration && (
        <Celebration onDone={() => setShowCelebration(false)} />
      )}
    </SafeAreaView>
  );
}
