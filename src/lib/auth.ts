export const AUTH_TOKEN_KEY = "conext_auth_token";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  newsletter: boolean;
  createdAt: string;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

const API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL || "http://localhost:4000";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeSession(session: AuthSession): void {
  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  window.dispatchEvent(new Event("conext-auth-change"));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event("conext-auth-change"));
}

export async function authFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T & { ok: true }> {
  const authToken = token ?? getStoredToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (authToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Request failed.");
  }

  return result;
}

export async function fetchCaptcha(): Promise<{ id: string; challenge: string }> {
  const result = await authFetch<{ id: string; challenge: string }>("/api/auth/captcha");
  return { id: result.id, challenge: result.challenge };
}

export async function signup(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  newsletter: boolean;
  termsAccepted: boolean;
  captchaId: string;
  captchaAnswer: string;
  website?: string;
}): Promise<AuthUser> {
  const result = await authFetch<{ user: AuthUser }>(
    "/api/auth/signup",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
  return result.user;
}

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function isGoogleConfigured(): boolean {
  const clientId = GOOGLE_CLIENT_ID.trim();
  return (
    clientId !== "" &&
    !clientId.includes("your-google-client-id") &&
    clientId.endsWith(".apps.googleusercontent.com")
  );
}

export async function loginWithGoogle(
  credential: string,
  intent: "login" | "signup" = "login"
): Promise<AuthSession & { isNewUser: boolean }> {
  const result = await authFetch<{
    token: string;
    expiresAt: string;
    user: AuthUser;
    isNewUser: boolean;
  }>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential, intent })
  });

  return {
    token: result.token,
    expiresAt: result.expiresAt,
    user: result.user,
    isNewUser: Boolean(result.isNewUser)
  };
}

export async function login(payload: {
  email: string;
  password: string;
  website?: string;
}): Promise<AuthSession> {
  const result = await authFetch<{ token: string; expiresAt: string; user: AuthUser }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
  return { token: result.token, expiresAt: result.expiresAt, user: result.user };
}

export async function logout(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await authFetch("/api/auth/logout", { method: "POST" }, token);
    } catch {
      // Clear local session even if server logout fails.
    }
  }
  clearSession();
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const result = await authFetch<{ user: AuthUser }>("/api/auth/me", {}, token);
    return result.user;
  } catch {
    clearSession();
    return null;
  }
}
