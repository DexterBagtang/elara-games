import { useState } from "react";
import { Pressable, Text } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { playSound } from "@/game/sounds";
import { theme } from "@/theme";

const FILL = {
  from: { transform: [{ scale: 0.4 }], opacity: 0.25 },
  to: { transform: [{ scale: 1 }], opacity: 1 },
};

/**
 * A button a toddler can't fire by accident: it only triggers after a
 * deliberate press-and-hold. A ring fills during the hold so the grown-up
 * can see it working. Used for "go home" and "clear the picture".
 */
export function HoldButton({
  emoji,
  onHold,
  accessibilityLabel,
  delay = 650,
}: {
  emoji: string;
  onHold: () => void;
  accessibilityLabel: string;
  delay?: number;
}) {
  const [holding, setHolding] = useState(false);
  const reduced = useReducedMotion();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Press and hold"
      onPressIn={() => setHolding(true)}
      onPressOut={() => setHolding(false)}
      onLongPress={() => {
        setHolding(false);
        playSound("tap");
        onHold();
      }}
      delayLongPress={delay}
      hitSlop={10}
      className="h-16 w-16 items-center justify-center rounded-full bg-ink/10"
    >
      {holding && !reduced && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: theme.radius.full,
            borderWidth: 4,
            borderColor: theme.color.grape,
            animationName: FILL,
            animationDuration: delay,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
          }}
        />
      )}
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
    </Pressable>
  );
}
