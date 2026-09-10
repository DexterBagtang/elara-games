import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GAMES } from "@/game/games";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FFFDF5]">
      <View className="px-8 pt-4 pb-2">
        <Text className="text-4xl font-extrabold text-grape">Elara Games</Text>
        <Text className="text-lg text-neutral-500">Pick a game to play</Text>
      </View>

      <ScrollView
        contentContainerClassName="flex-row flex-wrap gap-6 p-8"
        showsVerticalScrollIndicator={false}
      >
        {GAMES.map((game) => (
          <Link key={game.id} href={game.route} asChild>
            <Pressable
              className={`${game.color} h-44 w-44 items-center justify-center rounded-3xl active:scale-95`}
              style={{ elevation: 4 }}
            >
              <Text className="text-6xl">{game.emoji}</Text>
              <Text className="mt-3 text-xl font-bold text-white">
                {game.title}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
