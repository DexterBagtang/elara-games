import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Celebration } from "@/game/Celebration";
import { nextRound, type Round } from "@/game/colorSort";
import { playSound } from "@/game/sounds";
import type { Swatch } from "@/game/palette";
import { speak, stopSpeaking } from "@/game/speak";
import { goHome } from "@/lib/goHome";
import { theme } from "@/theme";

const HEADER_H = 76;
const PROMPT = 104;

// one-shot bounce for the bin that was just tapped correctly
const POP = {
  "0%": { transform: [{ scale: 0.9 }] },
  "55%": { transform: [{ scale: 1.16 }] },
  "100%": { transform: [{ scale: 1 }] },
};

export default function SortByColor() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  const [round, setRound] = useState<Round>(() => nextRound());
  const [phase, setPhase] = useState<"ask" | "right">("ask");
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  // after a couple of misses, glow the right bin so the round still ends well
  const [hinting, setHinting] = useState(false);

  const correctCount = useRef(0);
  const wrongCount = useRef(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // announce the target color a clear beat after each new round appears
  useEffect(() => {
    const t = setTimeout(() => speak(round.target.label), 550);
    return () => clearTimeout(t);
  }, [round]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      stopSpeaking();
    },
    [],
  );

  const onPick = useCallback(
    (s: Swatch) => {
      if (phase === "right") return;

      if (s.id !== round.target.id) {
        // wrong — no penalty, no scary noise, just nudge them to look again
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        playSound("tap");
        wrongCount.current += 1;
        if (wrongCount.current >= 2) setHinting(true); // show them the one
        return;
      }

      // right! praise with just the color name
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound("win");
      speak(s.label);
      wrongCount.current = 0;
      setHinting(false);
      setChosenId(s.id);
      setPhase("right");

      correctCount.current += 1;
      const burst = correctCount.current % 5 === 0 && !reduced;
      if (burst) setCelebrate(true);
      const wait = reduced ? 700 : burst ? 2600 : 1500;

      advanceTimer.current = setTimeout(() => {
        stopSpeaking();
        setCelebrate(false);
        setChosenId(null);
        setHinting(false);
        setPhase("ask");
        setRound((r) => nextRound(r.target.id));
      }, wait);
    },
    [phase, round, reduced],
  );

  // biggest square that leaves room for the prompt + gaps, in both axes
  const card = clamp(
    Math.min(height - HEADER_H - PROMPT - 84, (width - 48 - 56 * 2) / 3),
    112,
    168,
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      {/* header — just "go home", held to fire */}
      <View
        style={{
          height: HEADER_H,
          marginTop: insets.top,
          marginLeft: insets.left,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <HoldButton
          emoji="🏠"
          accessibilityLabel="Go home"
          onHold={() => goHome(router)}
        />
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 12,
        }}
      >
        {/* the prompt: a big pulsing swatch of the color to find. tapping it
            says the color name again. */}
        <Breathing>
          <PromptSwatch
            hidden={phase === "right"}
            color={round.target.color}
            label={round.target.label}
            onPress={() => speak(round.target.label)}
          />
        </Breathing>

        {/* three choices */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          {round.bins.map((s) => {
            const isChosen = phase === "right" && s.id === chosenId;
            const dimmed = phase === "right" && !isChosen;
            const hint = hinting && phase === "ask" && s.id === round.target.id;
            return (
              <Animated.View
                // remount the winner so the one-shot POP keyframe fires
                key={isChosen ? `${s.id}-pop` : s.id}
                style={
                  isChosen && !reduced
                    ? {
                        animationName: POP,
                        animationDuration: 500,
                        animationTimingFunction: "ease-out",
                        animationFillMode: "both",
                      }
                    : undefined
                }
              >
                {hint ? (
                  <Breathing>
                    <SwatchCard
                      swatch={s}
                      size={card}
                      lifted
                      dimmed={false}
                      hint
                      onPress={() => onPick(s)}
                    />
                  </Breathing>
                ) : (
                  <SwatchCard
                    swatch={s}
                    size={card}
                    lifted={isChosen}
                    dimmed={dimmed}
                    hint={false}
                    onPress={() => onPick(s)}
                  />
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>

      {celebrate && <Celebration onDone={() => setCelebrate(false)} />}
    </View>
  );
}

function PromptSwatch({
  hidden,
  color,
  label,
  onPress,
}: {
  hidden: boolean;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      {...({ cssInterop: false } as object)}
      accessibilityRole="button"
      accessibilityLabel={`Hear "${label}" again`}
      hitSlop={16}
      onPress={onPress}
      style={({ pressed }) => ({
        width: PROMPT,
        height: PROMPT,
        borderRadius: theme.radius.full,
        backgroundColor: color,
        borderWidth: 5,
        borderColor: theme.color.surface,
        boxShadow: theme.shadow.raised,
        pointerEvents: hidden ? "none" : "auto",
        opacity: hidden ? 0 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    />
  );
}

function SwatchCard({
  swatch,
  size,
  lifted,
  dimmed,
  hint,
  onPress,
}: {
  swatch: Swatch;
  size: number;
  lifted: boolean;
  dimmed: boolean;
  hint: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      {...({ cssInterop: false } as object)}
      accessibilityRole="button"
      accessibilityLabel={swatch.label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: theme.radius.full,
        backgroundColor: swatch.color,
        borderWidth: hint ? 6 : 4,
        borderColor: hint ? theme.color.grass : theme.color.surface,
        boxShadow: lifted || hint ? theme.shadow.raised : theme.shadow.card,
        opacity: dimmed ? 0.35 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    />
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
