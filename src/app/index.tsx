import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { GAMES } from "@/game/games";
import { isSoundEnabled, playSound, setSoundEnabled } from "@/game/sounds";
import { theme } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playSound("tap");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* grown-up chrome — small, out of the way */}
      <View className="flex-row items-center justify-between px-6 pt-3">
        <Txt variant="display">Elara Games</Txt>
        {/* grown-up only: hold to toggle. A single tap here would let a toddler
            mute the whole app — and silently break Animal Sounds — with one
            stray corner poke. Hold-to-fire matches the "go home" button. */}
        <HoldButton
          emoji={soundOn ? "🔊" : "🔇"}
          accessibilityLabel={soundOn ? "Turn sound off" : "Turn sound on"}
          onHold={toggleSound}
        />
      </View>

      {/* the toddler's whole world: big pokeable cards, centered */}
      <View className="flex-1 flex-row flex-wrap items-center justify-center gap-8 p-6">
        {GAMES.map((game, i) => (
          <Breathing key={game.id} delay={i * 400}>
            {/* plain Pressable, NOT <Link asChild>: expo-router's Slot merges a
                function-form `style` as `{...fn}` === `{}` and silently drops
                every card style (size, colour, radius). router.push keeps the
                navigation and lets the card keep its look + press feedback. */}
            <Pressable
              {...({ cssInterop: false } as object)}
              accessibilityRole="button"
              accessibilityLabel={game.title}
              onPress={() => {
                playSound("tap");
                router.push(game.route);
              }}
              style={({ pressed }) => ({
                width: 208,
                height: 208,
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                borderRadius: theme.radius.xl,
                backgroundColor: game.color,
                boxShadow: theme.shadow.raised,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Text style={{ fontSize: 84 }}>{game.emoji}</Text>
              <Txt variant="label" style={{ color: theme.color.onAccent }}>
                {game.title}
              </Txt>
            </Pressable>
          </Breathing>
        ))}
      </View>
    </SafeAreaView>
  );
}
