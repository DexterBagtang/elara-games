import { Host, Picker, Slider } from "@expo/ui";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HoldButton } from "@/components/HoldButton";
import { Txt } from "@/components/Txt";
import { clearAllColoringProgress } from "@/game/coloringProgress";
import { GAMES } from "@/game/games";
import {
  setGameEnabled,
  setSoundSetting,
  setSpeechSetting,
  useSettings,
} from "@/game/settings";
import { listEnglishVoices, speak } from "@/game/speak";
import { goHome } from "@/lib/goHome";
import { theme } from "@/theme";

const NO_VOICE = "__auto__"; // Picker.Item values can't be undefined

/** a card matching the app's look — surface, shadow, rounded corners */
function Card({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.color.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 16,
        gap: 12,
      }}
    >
      <View className="flex-row items-center gap-2">
        <Txt style={{ fontSize: 20 }}>{emoji}</Txt>
        <Txt variant="title" style={{ fontSize: 18 }}>
          {title}
        </Txt>
      </View>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Txt
        variant="label"
        style={{ fontSize: 16, opacity: disabled ? 0.4 : 1 }}
      >
        {label}
      </Txt>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#D8D5E6", true: theme.color.grass }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function SpeechSlider({
  label,
  value,
  min,
  max,
  onValueChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onValueChange: (v: number) => void;
}) {
  return (
    <View style={{ gap: 4 }}>
      <View className="flex-row items-center justify-between">
        <Txt variant="hint">{label}</Txt>
        <Txt variant="hint">{value.toFixed(2)}</Txt>
      </View>
      <Host matchContents seedColor={theme.color.grape} style={{ height: 32 }}>
        <Slider
          value={value}
          min={min}
          max={max}
          step={0.05}
          onValueChange={onValueChange}
        />
      </Host>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettings();
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const onlyOneGameLeft = settings.enabledGameIds.length === 1;

  useEffect(() => {
    listEnglishVoices().then(setVoices);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center gap-4 px-6 pt-3 pb-2">
        <HoldButton
          emoji="🏠"
          accessibilityLabel="Go home"
          onHold={() => goHome(router)}
        />
        <Txt variant="title">Parent Settings</Txt>
      </View>

      {/* two columns — this app is landscape-locked, so a tall single-column
          form would mean a lot of scrolling for not much content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-row gap-5 px-6 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, gap: 16 }}>
          <Card emoji="🔊" title="Sound">
            <Row
              label="Sound effects & speech"
              value={settings.soundEnabled}
              onValueChange={setSoundSetting}
            />
          </Card>

          <Card emoji="🎮" title="Games on the home screen">
            {GAMES.map((game) => {
              const enabled = settings.enabledGameIds.includes(game.id);
              return (
                <Row
                  key={game.id}
                  label={`${game.emoji}  ${game.title}`}
                  value={enabled}
                  disabled={onlyOneGameLeft && enabled}
                  onValueChange={(v) => setGameEnabled(game.id, v)}
                />
              );
            })}
            <Txt variant="hint">At least one game always stays on.</Txt>
          </Card>

          <Card emoji="🗑️" title="Reset">
            <Txt variant="hint">
              Clears every saved coloring page. Games, sound and speech
              settings are not affected.
            </Txt>
            <View className="flex-row items-center gap-3 pt-1">
              <HoldButton
                emoji="🗑️"
                accessibilityLabel="Reset all coloring progress"
                onHold={clearAllColoringProgress}
              />
              <Txt variant="hint">Hold to reset coloring progress</Txt>
            </View>
          </Card>
        </View>

        <View style={{ flex: 1, gap: 16 }}>
          <Card emoji="🗣️" title="Speech voice">
            <Txt variant="hint">Voice</Txt>
            <Host matchContents seedColor={theme.color.grape}>
              <Picker
                selectedValue={settings.speech.voice ?? NO_VOICE}
                onValueChange={(v) =>
                  setSpeechSetting({
                    voice: v === NO_VOICE ? undefined : String(v),
                  })
                }
              >
                <Picker.Item label="Automatic" value={NO_VOICE} />
                {voices.map((v) => (
                  <Picker.Item
                    key={v.identifier}
                    label={v.name ?? v.identifier}
                    value={v.identifier}
                  />
                ))}
              </Picker>
            </Host>

            <SpeechSlider
              label="Speed"
              value={settings.speech.rate}
              min={0.5}
              max={1.5}
              onValueChange={(rate) => setSpeechSetting({ rate })}
            />
            <SpeechSlider
              label="Pitch"
              value={settings.speech.pitch}
              min={0.8}
              max={1.8}
              onValueChange={(pitch) => setSpeechSetting({ pitch })}
            />

            <Pressable
              {...({ cssInterop: false } as object)}
              accessibilityRole="button"
              accessibilityLabel="Preview voice"
              onPress={() => speak("Hello! This is how I sound.")}
              style={({ pressed }) => ({
                marginTop: 4,
                alignSelf: "flex-start",
                borderRadius: theme.radius.full,
                backgroundColor: theme.color.berry,
                paddingHorizontal: 20,
                paddingVertical: 10,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Txt variant="label" style={{ color: theme.color.onAccent }}>
                ▶️ Preview voice
              </Txt>
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
