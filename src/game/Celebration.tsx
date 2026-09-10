import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

const EMOJI = ["🎉", "🌟", "🎈", "✨", "🦄"];

export function Celebration({ onDone }: { onDone: () => void }) {
  const anims = useRef(EMOJI.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.stagger(
      90,
      anims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        })
      )
    ).start();

    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [anims, onDone]);

  return (
    <Pressable
      onPress={onDone}
      className="absolute inset-0 items-center justify-center bg-white/70"
    >
      <View className="flex-row gap-2">
        {EMOJI.map((e, i) => (
          <Animated.Text
            key={i}
            style={{
              fontSize: 56,
              transform: [
                { scale: anims[i] },
                {
                  translateY: anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            }}
          >
            {e}
          </Animated.Text>
        ))}
      </View>
      <Text className="mt-6 text-5xl font-extrabold text-grape">Yay!</Text>
    </Pressable>
  );
}
