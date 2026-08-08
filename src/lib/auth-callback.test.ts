import { describe, expect, it, vi } from "vitest";
import { getAuthCallbackPath, handleAuthCallbackUrl } from "./auth-callback";

describe("handleAuthCallbackUrl", () => {
  it("exchanges a PKCE code from a web callback", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    await expect(
      handleAuthCallbackUrl("https://shepherdai.app/auth/callback?code=pkce-code", { exchangeCodeForSession }),
    ).resolves.toBe(true);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
  });

  it("exchanges a code from the custom URL fallback", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    await handleAuthCallbackUrl("com.shepherdai.app://auth/callback?code=native-code", { exchangeCodeForSession });
    expect(exchangeCodeForSession).toHaveBeenCalledWith("native-code");
  });

  it("ignores URLs without an auth code", async () => {
    const exchangeCodeForSession = vi.fn();
    await expect(handleAuthCallbackUrl("https://shepherdai.app/chat", { exchangeCodeForSession })).resolves.toBe(false);
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("maps native recovery and confirmation links to web routes", () => {
    expect(getAuthCallbackPath("com.shepherdai.app://auth/callback?code=x&type=recovery&next=reset-password")).toBe("/reset-password?type=recovery");
    expect(getAuthCallbackPath("com.shepherdai.app://auth/callback?code=x")).toBe("/auth/callback");
  });
});
