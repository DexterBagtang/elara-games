import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Celebration } from "@/game/Celebration";
import { ColoringCanvas } from "@/game/ColoringCanvas";
import { BLANK, ERASER, PALETTE, type Swatch } from "@/game/palette";
import { getPicture } from "@/game/pictures";
import { playSound } from "@/game/sounds";

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
    setCanvas(Math.max(0, Math.min(width, height) - 12));
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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FFFDF5]">
        <Text className="text-xl text-neutral-500">Picture not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-full bg-berry px-6 py-3"
        >
          <Text className="text-lg font-bold text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFFDF5]">
      {/* top bar */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onLongPress={() => router.back()}
          delayLongPress={600}
          className="h-14 w-14 items-center justify-center rounded-full bg-black/10"
        >
          <Text className="text-2xl">🏠</Text>
        </Pressable>

        <Text className="text-xl font-extrabold text-neutral-700">
          {picture.emoji} {picture.title}
        </Text>

        <Pressable
          onLongPress={reset}
          delayLongPress={600}
          className="h-14 items-center justify-center rounded-full bg-black/10 px-4"
        >
          <Text className="text-xs font-bold text-neutral-600">
            hold to{"\n"}clear
          </Text>
        </Pressable>
      </View>

      {/* canvas */}
      <View className="flex-1 items-center justify-center" onLayout={onCanvasLayout}>
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

      {/* palette strip */}
      <View className="flex-row flex-wrap items-center justify-center gap-2 px-4 pb-2 pt-1">
        {SWATCHES.map((s) => {
          const isSelected = s.id === selected.id;
          const isEraser = s.id === ERASER.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => {
                Haptics.selectionAsync();
                playSound("tap");
                setSelected(s);
              }}
              className={`h-12 w-12 items-center justify-center rounded-full border-4 ${
                isSelected ? "border-neutral-800" : "border-white"
              }`}
              style={{
                backgroundColor: s.color,
                borderColor: isEraser && !isSelected ? "#D4D4D4" : undefined,
              }}
            >
              {isEraser && <Text className="text-lg">🧽</Text>}
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
