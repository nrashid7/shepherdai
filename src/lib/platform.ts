import { Capacitor } from "@capacitor/core";

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Returns the appropriate auth redirect URL based on platform.
 * On native iOS, uses the custom URL scheme registered with Supabase.
 * On web, uses the current origin.
 */
export function getAuthRedirectUrl(): string {
  if (isNativeApp()) {
    return "com.shepherdai.app://auth/callback";
  }
  return window.location.origin;
}
