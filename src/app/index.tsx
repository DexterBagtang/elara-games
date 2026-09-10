import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { Txt } from "@/components/Txt";
import { GAMES } from "@/game/games";
import { isSoundEnabled, playSound, setSoundEnabled } from "@/game/sounds";

export default function HomeScreen() {
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={soundOn ? "Turn sound off" : "Turn sound on"}
          onPress={toggleSound}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          className="h-12 w-12 items-center justify-center rounded-full bg-ink/10"
        >
          <Text style={{ fontSize: 22 }}>{soundOn ? "🔊" : "🔇"}</Text>
        </Pressable>
      </View>

      {/* the toddler's whole world: big pokeable cards, centered */}
      <View className="flex-1 flex-row flex-wrap items-center justify-center gap-8 p-6">
        {GAMES.map((game, i) => (
          <Breathing key={game.id} delay={i * 400}>
            <Link href={game.route} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={game.title}
                onPress={() => playSound("tap")}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
                className={`${game.color} h-52 w-52 items-center justify-center gap-3 rounded-xl shadow-raised`}
              >
                <Text style={{ fontSize: 84 }}>{game.emoji}</Text>
                <Txt variant="label" style={{ color: "#FFFFFF" }}>
                  {game.title}
                </Txt>
              </Pressable>
            </Link>
          </Breathing>
        ))}
      </View>
    </SafeAreaView>
  );
}
