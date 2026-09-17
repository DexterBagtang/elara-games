import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { Celebration } from "@/game/Celebration";
import {
  MAX_LEVEL,
  NUMBER_WORDS,
  ROUNDS_PER_LEVEL,
  nextRound,
  promptFor,
  successPhrase,
  type Food,
  type Round,
} from "@/game/monster";
import { playSound } from "@/game/sounds";
import { speak, stopSpeaking } from "@/game/speak";
import { goHome } from "@/lib/goHome";
import { theme } from "@/theme";

const HEADER_H = 76;
const MONSTER = "👾";

type Item = { uid: string; food: Food; kind: "target" | "distractor"; group?: "A" | "B" };

let uidSeq = 0;
const uid = () => `i${uidSeq++}`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildItems(round: Round): Item[] {
  switch (round.mode) {
    case "count":
      return Array.from({ length: round.target }, () => ({
        uid: uid(),
        food: round.food,
        kind: "target" as const,
      }));
    case "mixedCount": {
      const targets = Array.from({ length: round.target }, () => ({
        uid: uid(),
        food: round.food,
        kind: "target" as const,
      }));
      const distractors = Array.from({ length: round.distractorCount }, () => ({
        uid: uid(),
        food: round.distractor,
        kind: "distractor" as const,
      }));
      return shuffle([...targets, ...distractors]);
    }
    case "addition": {
      const a = Array.from({ length: round.a }, () => ({
        uid: uid(),
        food: round.food,
        kind: "target" as const,
        group: "A" as const,
      }));
      const b = Array.from({ length: round.b }, () => ({
        uid: uid(),
        food: round.food,
        kind: "target" as const,
        group: "B" as const,
      }));
      return [...a, ...b];
    }
    case "chooseGroup":
      return [];
  }
}

function sizeForCount(n: number): number {
  if (n <= 3) return 88;
  if (n <= 5) return 72;
  if (n <= 8) return 58;
  return 48;
}

const BUMP = {
  "0%": { transform: [{ scale: 1 }] },
  "40%": { transform: [{ scale: 1.2 }] },
  "100%": { transform: [{ scale: 1 }] },
};

const SHAKE = {
  "0%": { transform: [{ translateX: 0 }] },
  "25%": { transform: [{ translateX: -8 }] },
  "50%": { transform: [{ translateX: 8 }] },
  "75%": { transform: [{ translateX: -6 }] },
  "100%": { transform: [{ translateX: 0 }] },
};

export default function FeedMonster() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const [level, setLevel] = useState(1);
  const [round, setRound] = useState<Round>(() => nextRound(1));
  const [items, setItems] = useState<Item[]>(() => buildItems(round));
  const [phase, setPhase] = useState<"ask" | "right">("ask");
  const [celebrate, setCelebrate] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null);

  // group-choice mode: which pile the child picked, and the miss-based hint
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [hinting, setHinting] = useState(false);

  const targetTotalRef = useRef(0);
  const remainingRef = useRef(0); // decremented synchronously so fast/multi-touch taps can't double-count
  const consumedRef = useRef<Set<string>>(new Set()); // uids already tapped this round
  const wonRef = useRef(false); // guards onWin against firing twice for one round
  const roundsWonRef = useRef(0);
  const wrongRef = useRef(0);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    targetTotalRef.current =
      round.mode === "chooseGroup" ? 0 : items.filter((i) => i.kind === "target").length;
    remainingRef.current = targetTotalRef.current;
    consumedRef.current = new Set();
    wonRef.current = false;
    wrongRef.current = 0;
    if (winTimer.current) clearTimeout(winTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    const t = setTimeout(() => speak(promptFor(round)), 550);
    return () => clearTimeout(t);
  }, [round]);

  useEffect(
    () => () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      if (winTimer.current) clearTimeout(winTimer.current);
      stopSpeaking();
    },
    [],
  );

  function advanceRound() {
    const leveledUp = roundsWonRef.current % ROUNDS_PER_LEVEL === 0;
    const nextLevel = leveledUp ? Math.min(level + 1, MAX_LEVEL) : level;
    setLevel(nextLevel);
    const r = nextRound(nextLevel, round.food.id);
    setRound(r);
    setItems(buildItems(r));
    setPhase("ask");
    setSelectedGroup(null);
    setHinting(false);
  }

  function onWin() {
    if (wonRef.current) return; // already celebrating this round — don't layer a second win sound
    wonRef.current = true;
    // Celebration fires its own success haptic on mount — don't double it here.
    playSound("win");
    speak(successPhrase(round));
    roundsWonRef.current += 1;
    setPhase("right");
    setCelebrate(true);
  }

  function onTapTarget(itemUid: string) {
    if (phase === "right" || consumedRef.current.has(itemUid)) return;
    consumedRef.current.add(itemUid);
    setItems((prev) => prev.filter((i) => i.uid !== itemUid));
    Haptics.selectionAsync(); // each tap ticks the count up a step
    setBumpKey((k) => k + 1);

    remainingRef.current -= 1;
    const tappedSoFar = targetTotalRef.current - remainingRef.current;
    const isLast = remainingRef.current <= 0;

    if (!isLast) playSound("tap"); // skip the click on the last one — let the number land clean
    speak(NUMBER_WORDS[Math.min(tappedSoFar, NUMBER_WORDS.length) - 1] ?? String(tappedSoFar));

    if (isLast) {
      // give the final number a beat to finish before the win praise lands on top of it
      if (winTimer.current) clearTimeout(winTimer.current);
      winTimer.current = setTimeout(onWin, 700);
    }
  }

  function onTapDistractor(itemUid: string) {
    if (phase === "right") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound("tap");
    speak("Try again!");
    setShakeId(itemUid);
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setShakeId(null), 420);
  }

  function onPickGroup(count: number, index: number) {
    if (round.mode !== "chooseGroup" || phase === "right") return;
    if (count !== round.target) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound("tap");
      speak("Try again!");
      wrongRef.current += 1;
      if (wrongRef.current >= 2) setHinting(true);
      return;
    }
    setSelectedGroup(index);
    onWin();
  }

  const itemSize = sizeForCount(items.length);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <View
        style={{
          height: HEADER_H,
          marginTop: insets.top,
          marginLeft: insets.left,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingHorizontal: 24,
        }}
      >
        <HoldButton emoji="🏠" accessibilityLabel="Go home" onHold={() => goHome(router)} />
        <View style={{ flexDirection: "row", gap: 3 }}>
          {Array.from({ length: MAX_LEVEL }, (_, i) => (
            <Text key={i} style={{ fontSize: 14, color: theme.color.sun }}>
              {i < level ? "★" : "☆"}
            </Text>
          ))}
        </View>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-evenly",
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 12,
        }}
      >
        <Breathing>
          <Animated.Text
            key={bumpKey}
            style={
              !reduced
                ? {
                    fontSize: 88,
                    animationName: BUMP,
                    animationDuration: 380,
                    animationTimingFunction: "ease-out",
                    animationFillMode: "both",
                  }
                : { fontSize: 88 }
            }
          >
            {MONSTER}
          </Animated.Text>
        </Breathing>

        {round.mode === "chooseGroup" ? (
          <View style={{ flexDirection: "row", gap: 24, justifyContent: "center" }}>
            {round.groupCounts.map((count, index) => {
              const isSelected = phase === "right" && selectedGroup === index;
              const isHint = hinting && phase === "ask" && count === round.target;
              return (
                <Pressable
                  key={index}
                  {...({ cssInterop: false } as object)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pile of ${count}`}
                  onPress={() => onPickGroup(count, index)}
                  style={({ pressed }) => ({
                    width: 140,
                    minHeight: 140,
                    borderRadius: theme.radius.lg,
                    borderCurve: "continuous",
                    backgroundColor: theme.color.surface,
                    borderWidth: isHint ? 6 : 4,
                    borderColor: isHint ? theme.color.grass : theme.color.surface,
                    boxShadow: isSelected || isHint ? theme.shadow.raised : theme.shadow.card,
                    padding: 10,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignContent: "center",
                    justifyContent: "center",
                    gap: 4,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    opacity: phase === "right" && !isSelected ? 0.35 : 1,
                  })}
                >
                  {Array.from({ length: count }, (_, i) => (
                    <Text key={i} style={{ fontSize: 30 }}>
                      {round.food.emoji}
                    </Text>
                  ))}
                </Pressable>
              );
            })}
          </View>
        ) : round.mode === "addition" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <ItemGroup
              items={items.filter((i) => i.group === "A")}
              size={itemSize}
              shakeId={shakeId}
              reduced={reduced}
              onTapTarget={onTapTarget}
              onTapDistractor={onTapDistractor}
            />
            <Txt variant="huge" style={{ fontSize: 40 }}>+</Txt>
            <ItemGroup
              items={items.filter((i) => i.group === "B")}
              size={itemSize}
              shakeId={shakeId}
              reduced={reduced}
              onTapTarget={onTapTarget}
              onTapDistractor={onTapDistractor}
            />
          </View>
        ) : (
          <ItemGroup
            items={items}
            size={itemSize}
            shakeId={shakeId}
            reduced={reduced}
            onTapTarget={onTapTarget}
            onTapDistractor={onTapDistractor}
            wrap
          />
        )}
      </View>

      {celebrate && (
        <Celebration
          onDone={() => {
            setCelebrate(false);
            advanceRound();
          }}
        />
      )}
    </View>
  );
}

function ItemGroup({
  items,
  size,
  shakeId,
  reduced,
  onTapTarget,
  onTapDistractor,
  wrap,
}: {
  items: Item[];
  size: number;
  shakeId: string | null;
  reduced: boolean;
  onTapTarget: (uid: string) => void;
  onTapDistractor: (uid: string) => void;
  wrap?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        maxWidth: wrap ? 340 : undefined,
      }}
    >
      {items.map((item) => {
        const shaking = shakeId === item.uid;
        return (
          <Animated.View
            key={shaking ? `${item.uid}-shake` : item.uid}
            style={
              shaking && !reduced
                ? {
                    animationName: SHAKE,
                    animationDuration: 400,
                    animationTimingFunction: "ease-out",
                    animationFillMode: "both",
                  }
                : undefined
            }
          >
            <Pressable
              {...({ cssInterop: false } as object)}
              accessibilityRole="button"
              accessibilityLabel={item.food.singular}
              hitSlop={8}
              onPress={() =>
                item.kind === "target" ? onTapTarget(item.uid) : onTapDistractor(item.uid)
              }
              style={({ pressed }) => ({
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.radius.lg,
                borderCurve: "continuous",
                backgroundColor: theme.color.surface,
                boxShadow: theme.shadow.card,
                transform: [{ scale: pressed ? 0.9 : 1 }],
              })}
            >
              <Text style={{ fontSize: Math.round(size * 0.62) }}>{item.food.emoji}</Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
