/** Per-picture coloring progress, persisted so a drawing survives a restart. */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "elara:coloring:";

export async function loadFills(
  pictureId: string,
): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + pictureId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveFills(pictureId: string, fills: Record<string, string>) {
  AsyncStorage.setItem(KEY_PREFIX + pictureId, JSON.stringify(fills)).catch(
    () => {},
  );
}

export function clearFills(pictureId: string) {
  AsyncStorage.removeItem(KEY_PREFIX + pictureId).catch(() => {});
}

/** parent settings page "reset coloring progress" button */
export async function clearAllColoringProgress() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((k) => k.startsWith(KEY_PREFIX));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {
    // nothing to clear / storage unavailable
  }
}
