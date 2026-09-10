import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Celebration } from "@/game/Celebration";
import { ColoringCanvas } from "@/game/ColoringCanvas";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { BLANK, ERASER, PALETTE, type Swatch } from "@/game/palette";
import { getPicture } from "@/game/pictures";
import { playSound } from "@/game/sounds";
import { theme } from "@/theme";

const SWATCHES: Swatch[] = [...PALETTE, ERASER];

export default function ColoringScreen() {
  const router = useRouter();
  const { picture: pictureId } = useLocalSearchParams<{ picture: string }>();
  const picture = useMemo(() => getPicture(pictureId), [pictureId]);

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
      setFills((prev) => ({ ...prev, [id]: selected.color }));
    },
    [selected]
  );

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFills({});
    setCelebrated(false);
    setShowCelebration(false);
  }, []);

  // fire celebration once when every region has a non-blank color
  useEffect(() => {
    if (!picture || celebrated) return;
    const done = picture.regions.every(
      (r) => fills[r.id] && fills[r.id] !== BLANK
    );
    if (done) {
      setCelebrated(true);
      setShowCelebration(true);
      playSound("win");
    }
  }, [fills, picture, celebrated]);

  if (!picture) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bg">
        <Txt variant="title">Picture not found</Txt>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-full bg-berry px-6 py-3 transition active:scale-95"
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

      {/* canvas */}
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

      {/* palette — one row, big targets, selected lifts + rings */}
      <View className="flex-row flex-wrap items-end justify-center gap-3 px-4 pb-3">
        {SWATCHES.map((s) => {
          const isSelected = s.id === selected.id;
          const isEraser = s.id === ERASER.id;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={s.label}
              onPress={() => {
                Haptics.selectionAsync();
                playSound("tap");
                setSelected(s);
              }}
              className={`h-16 w-16 items-center justify-center rounded-full transition ${
                isSelected ? "-translate-y-1 scale-110" : ""
              }`}
              style={{
                backgroundColor: s.color,
                borderWidth: isSelected ? 5 : 3,
                borderColor: isSelected
                  ? theme.color.ink
                  : isEraser
                    ? "#D4D4D4"
                    : "#FFFFFF",
              }}
            >
              {isEraser && <Text style={{ fontSize: 22 }}>🧽</Text>}
            </Pressable>
          );
        })}
      </View>

      {showCelebration && (
        <Celebration onDone={() => setShowCelebration(false)} />
      )}
    </SafeAreaView>
  );
}
