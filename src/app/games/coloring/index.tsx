import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { ColoringCanvas } from "@/game/ColoringCanvas";
import { loadFills } from "@/game/coloringProgress";
import { PICTURES } from "@/game/pictures";
import { playSound } from "@/game/sounds";
import { goHome } from "@/lib/goHome";
import { theme } from "@/theme";

const EMPTY = {} as Record<string, string>;

export default function ColoringPicker() {
  const router = useRouter();
  // thumbnails show saved progress, so reload whenever this screen regains
  // focus (e.g. coming back from coloring a picture)
  const [fillsByPicture, setFillsByPicture] = useState<
    Record<string, Record<string, string>>
  >({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all(
        PICTURES.map(async (p) => [p.id, await loadFills(p.id)] as const),
      ).then((entries) => {
        if (cancelled) return;
        setFillsByPicture(Object.fromEntries(entries));
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center gap-4 px-6 pt-3">
        <HoldButton
          emoji="🏠"
          accessibilityLabel="Go home"
          onHold={() => goHome(router)}
        />
        <Txt variant="title">Coloring</Txt>
      </View>

      {/* wrapping grid, scrolled vertically — horizontal swipe wasn't
          registering reliably for toddlers, so scroll the way most apps do */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-row flex-wrap items-center justify-center gap-7 px-8 py-6"
        showsVerticalScrollIndicator={false}
      >
        {PICTURES.map((p, i) => (
          <Breathing key={p.id} delay={i * 300}>
            {/* plain Pressable, NOT <Link asChild>: expo-router's Slot merges a
                function-form `style` as `{...fn}` === `{}` and drops the whole
                card (size, surface, shadow). router.push keeps navigation. */}
            <Pressable
              {...({ cssInterop: false } as object)}
              accessibilityRole="button"
              accessibilityLabel={`Color the ${p.title}`}
              onPress={() => {
                playSound("tap");
                router.push({
                  pathname: "/games/coloring/[picture]",
                  params: { picture: p.id },
                });
              }}
              style={({ pressed }) => ({
                width: 176,
                height: 176,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.radius.xl,
                backgroundColor: theme.color.surface,
                boxShadow: theme.shadow.card,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              {/* the actual outline — pre-readers recognise the drawing */}
              <View pointerEvents="none">
                <ColoringCanvas
                  picture={p}
                  fills={fillsByPicture[p.id] ?? EMPTY}
                  onTapRegion={() => {}}
                  width={150}
                  height={150}
                />
              </View>
            </Pressable>
          </Breathing>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
