import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { Txt } from "@/components/Txt";

const EMOJI = ["🎉", "⭐️", "🎈", "✨", "🌈", "🦄", "🍭", "💖"];

const POP = {
  "0%": { transform: [{ scale: 0.5 }], opacity: 0 },
  "60%": { transform: [{ scale: 1.15 }], opacity: 1 },
  "100%": { transform: [{ scale: 1 }], opacity: 1 },
};

const RISE = {
  "0%": { transform: [{ translateY: 10 }, { rotate: "0deg" }], opacity: 0 },
  "15%": { opacity: 1 },
  "100%": { transform: [{ translateY: -170 }, { rotate: "300deg" }], opacity: 0 },
};

export function Celebration({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <Pressable
      onPress={onDone}
      accessibilityRole="button"
      accessibilityLabel="All done"
      className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-surface/70"
    >
      {!reduced && (
        <View className="absolute flex-row gap-4">
          {EMOJI.map((e, i) => (
            <Animated.Text
              key={i}
              style={{
                fontSize: 40,
                animationName: RISE,
                animationDuration: 1600,
                animationDelay: i * 110,
                animationTimingFunction: "ease-out",
                animationIterationCount: 1,
                animationFillMode: "both",
              }}
            >
              {e}
            </Animated.Text>
          ))}
        </View>
      )}

      <Animated.View
        style={{
          animationName: POP,
          animationDuration: 450,
          animationTimingFunction: "ease-out",
          animationFillMode: "both",
        }}
      >
        <Txt variant="huge">Yay!</Txt>
      </Animated.View>
    </Pressable>
  );
}
