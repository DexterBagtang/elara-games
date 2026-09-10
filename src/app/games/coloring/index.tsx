import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PICTURES } from "@/game/pictures";

export default function ColoringPicker() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FFFDF5]">
      <View className="flex-row items-center gap-4 px-8 pt-4 pb-2">
        <Pressable
          onLongPress={() => router.back()}
          delayLongPress={600}
          className="h-14 w-14 items-center justify-center rounded-full bg-black/10"
        >
          <Text className="text-2xl">🏠</Text>
        </Pressable>
        <Text className="text-3xl font-extrabold text-berry">
          Pick a picture
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="flex-row flex-wrap gap-6 p-8"
        showsVerticalScrollIndicator={false}
      >
        {PICTURES.map((p) => (
          <Link
            key={p.id}
            href={{
              pathname: "/games/coloring/[picture]",
              params: { picture: p.id },
            }}
            asChild
          >
            <Pressable className="h-40 w-40 items-center justify-center rounded-3xl bg-white active:scale-95 border-4 border-neutral-200">
              <Text className="text-6xl">{p.emoji}</Text>
              <Text className="mt-2 text-lg font-bold text-neutral-700">
                {p.title}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
