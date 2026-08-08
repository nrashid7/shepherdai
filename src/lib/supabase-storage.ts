import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import type { SupportedStorage } from "@supabase/supabase-js";

const nativeStorage: SupportedStorage = {
  async getItem(key) {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async setItem(key, value) {
    await Preferences.set({ key, value });
  },
  async removeItem(key) {
    await Preferences.remove({ key });
  },
};

export function getSupabaseStorage(): SupportedStorage {
  return Capacitor.isNativePlatform() ? nativeStorage : window.localStorage;
}
