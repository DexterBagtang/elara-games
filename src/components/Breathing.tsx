import type { ReactNode } from "react";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { theme } from "@/theme";

const BREATHE = {
  "0%": { transform: [{ scale: 1 }] },
  "50%": { transform: [{ scale: 1.035 }] },
  "100%": { transform: [{ scale: 1 }] },
};

/**
 * Slow idle pulse — a wordless "tap me" cue for pre-readers.
 * Delight tier; disabled under reduce-motion.
 */
export function Breathing({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;

  return (
    <Animated.View
      style={{
        animationName: BREATHE,
        animationDuration: theme.motion.breathe,
        animationIterationCount: "infinite",
        animationTimingFunction: "ease-in-out",
        animationDelay: delay,
      }}
    >
      {children}
    </Animated.View>
  );
}
