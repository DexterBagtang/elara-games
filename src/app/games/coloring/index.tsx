import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { ColoringCanvas } from "@/game/ColoringCanvas";
import { PICTURES } from "@/game/pictures";
import { playSound } from "@/game/sounds";
import { theme } from "@/theme";

const EMPTY = {} as Record<string, string>;

export default function ColoringPicker() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center gap-4 px-6 pt-3">
        <HoldButton
          emoji="🏠"
          accessibilityLabel="Go home"
          onHold={() => router.back()}
        />
        <Txt variant="title">Coloring</Txt>
      </View>

      {/* one big row a toddler swipes sideways through — landscape has the
          width, and side-swipe beats a vertical grid they have to scroll */}
      <ScrollView
        horizontal
        className="flex-1"
        contentContainerClassName="flex-row items-center gap-7 px-8 py-6"
        showsHorizontalScrollIndicator={false}
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
                  fills={EMPTY}
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
