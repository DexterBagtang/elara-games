import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Celebration } from "@/game/Celebration";
import { nextRound, type Animal } from "@/game/animals";
import { playSound } from "@/game/sounds";
import { speak, stopSpeaking } from "@/game/speak";
import { theme } from "@/theme";

const HEADER_H = 76;
const SPEAKER = 104;

// one-shot bounce for the animal that was just tapped correctly
const POP = {
  "0%": { transform: [{ scale: 0.9 }] },
  "55%": { transform: [{ scale: 1.16 }] },
  "100%": { transform: [{ scale: 1 }] },
};

export default function AnimalSounds() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  const [round, setRound] = useState(() => nextRound());
  const [phase, setPhase] = useState<"ask" | "right">("ask");
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  // after a couple of misses, glow the right animal so the round still ends well
  const [hinting, setHinting] = useState(false);

  const correctCount = useRef(0);
  const wrongCount = useRef(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // speak the prompt a clear beat after each new round appears (long enough
  // that the previous round's "Cow!" praise has finished first)
  useEffect(() => {
    const t = setTimeout(() => speak(round.target.says), 550);
    return () => clearTimeout(t);
  }, [round]);

  // stop any pending timer / speech when leaving the screen
  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      stopSpeaking();
    },
    [],
  );

  const onPick = useCallback(
    (a: Animal) => {
      if (phase === "right") return;

      if (a.id !== round.target.id) {
        // wrong — no penalty, no scary noise, just nudge them to listen again
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        playSound("tap");
        speak(round.target.says);
        wrongCount.current += 1;
        if (wrongCount.current >= 2) setHinting(true); // show them the one
        return;
      }

      // right! praise with just the name — no echoed sound, keeps it short
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound("win");
      speak(a.name);
      wrongCount.current = 0;
      setHinting(false);
      setChosenId(a.id);
      setPhase("right");

      correctCount.current += 1;
      const burst = correctCount.current % 5 === 0 && !reduced;
      if (burst) setCelebrate(true);
      const wait = reduced ? 700 : burst ? 2600 : 1500;

      advanceTimer.current = setTimeout(() => {
        stopSpeaking(); // kill any lingering praise before the next prompt
        setCelebrate(false);
        setChosenId(null);
        setHinting(false);
        setPhase("ask");
        setRound((r) => nextRound(r.target.id));
      }, wait);
    },
    [phase, round, reduced],
  );

  // biggest square that leaves room for the speaker + gaps, in both axes
  const card = clamp(
    Math.min(height - HEADER_H - SPEAKER - 84, (width - 48 - 56 * 2) / 3),
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
          onHold={() => router.back()}
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
        {/* the prompt: a big pulsing speaker. tapping it replays the sound. */}
        <Breathing>
          <SpeakerButton
            hidden={phase === "right"}
            onPress={() => speak(round.target.says)}
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
          {round.options.map((a) => {
            const isChosen = phase === "right" && a.id === chosenId;
            const dimmed = phase === "right" && !isChosen;
            const hint = hinting && phase === "ask" && a.id === round.target.id;
            return (
              <Animated.View
                // remount the winner so the one-shot POP keyframe fires
                key={isChosen ? `${a.id}-pop` : a.id}
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
                    <AnimalCard
                      animal={a}
                      size={card}
                      lifted
                      dimmed={false}
                      hint
                      onPress={() => onPick(a)}
                    />
                  </Breathing>
                ) : (
                  <AnimalCard
                    animal={a}
                    size={card}
                    lifted={isChosen}
                    dimmed={dimmed}
                    hint={false}
                    onPress={() => onPick(a)}
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

function SpeakerButton({
  hidden,
  onPress,
}: {
  hidden: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      {...({ cssInterop: false } as object)}
      accessibilityRole="button"
      accessibilityLabel="Hear the sound again"
      hitSlop={16}
      onPress={onPress}
      style={({ pressed }) => ({
        width: SPEAKER,
        height: SPEAKER,
        borderRadius: theme.radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.color.grass,
        boxShadow: theme.shadow.raised,
        pointerEvents: hidden ? "none" : "auto",
        opacity: hidden ? 0 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Text style={{ fontSize: 46 }}>🔊</Text>
    </Pressable>
  );
}

function AnimalCard({
  animal,
  size,
  lifted,
  dimmed,
  hint,
  onPress,
}: {
  animal: Animal;
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
      accessibilityLabel={animal.name}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.xl,
        backgroundColor: theme.color.surface,
        borderWidth: hint ? 5 : 0,
        borderColor: theme.color.grass,
        boxShadow: lifted || hint ? theme.shadow.raised : theme.shadow.card,
        opacity: dimmed ? 0.35 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Text style={{ fontSize: size * 0.52 }}>{animal.emoji}</Text>
    </Pressable>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
