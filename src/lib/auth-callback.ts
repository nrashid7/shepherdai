type AuthCodeExchanger = {
  exchangeCodeForSession: (code: string) => Promise<{ error: Error | null }>;
};

export async function handleAuthCallbackUrl(url: string, auth: AuthCodeExchanger): Promise<boolean> {
  const callback = new URL(url);
  const code = callback.searchParams.get("code");
  if (!code) return false;

  const { error } = await auth.exchangeCodeForSession(code);
  if (error) throw error;
  return true;
}

export function getAuthCallbackPath(url: string): string {
  const callback = new URL(url);
  const nativePath = callback.protocol === "com.shepherdai.app:"
    ? `/${callback.hostname}${callback.pathname}`
    : callback.pathname;
  const path = nativePath.replace(/\/$/, "");
  if (path === "/reset-password" || callback.searchParams.get("next") === "reset-password") {
    return "/reset-password?type=recovery";
  }
  return "/auth/callback";
}
