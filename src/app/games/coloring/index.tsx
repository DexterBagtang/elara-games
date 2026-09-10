import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { ColoringCanvas } from "@/game/ColoringCanvas";
import { PICTURES } from "@/game/pictures";
import { playSound } from "@/game/sounds";

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

      <ScrollView
        contentContainerClassName="flex-row flex-wrap items-center justify-center gap-7 p-6"
        showsVerticalScrollIndicator={false}
      >
        {PICTURES.map((p, i) => (
          <Breathing key={p.id} delay={i * 300}>
            <Link
              href={{
                pathname: "/games/coloring/[picture]",
                params: { picture: p.id },
              }}
              asChild
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Color the ${p.title}`}
                onPress={() => playSound("tap")}
                className="h-44 w-44 items-center justify-center rounded-xl bg-surface shadow-card transition active:scale-95"
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
            </Link>
          </Breathing>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
