export const LIVE_API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL || "http://localhost:4000";
export const ADMIN_TOKEN_KEY = "conext_live_admin_token";
export const LIVE_POLL_MS = 400;

export type LiveMessage = {
  id: string;
  sender: "user" | "admin" | "system";
  content: string;
  created_at?: string;
};

export type LiveSessionSummary = {
  id: string;
  status: "waiting" | "active" | "closed";
  created_at: string;
  updated_at: string;
  user_ip?: string;
  preview?: string;
  message_count?: number;
};

export type LiveSession = {
  id: string;
  status: "waiting" | "active" | "closed";
  created_at: string;
  updated_at: string;
  messages: LiveMessage[];
};

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export async function liveApiFetch<T>(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<T & { ok: true }> {
  const response = await fetch(`${LIVE_API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(token),
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Request failed.");
  }
  return result;
}

export async function fetchLiveSessions(token: string): Promise<LiveSessionSummary[]> {
  const result = await liveApiFetch<{ sessions: LiveSessionSummary[] }>(token, "/api/live/sessions");
  return result.sessions;
}

export async function fetchLiveSession(token: string, sessionId: string): Promise<LiveSession> {
  const result = await liveApiFetch<{ session: LiveSession }>(
    token,
    `/api/live/session?id=${encodeURIComponent(sessionId)}`
  );
  return result.session;
}

export async function pollLiveMessages(
  token: string,
  sessionId: string,
  afterId: string,
  signal?: AbortSignal
): Promise<LiveMessage[]> {
  const query = new URLSearchParams({
    sessionId,
    after: afterId
  });
  const response = await fetch(`${LIVE_API_URL}/api/live/poll?${query.toString()}`, {
    signal,
    headers: authHeaders(token)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Unable to poll messages.");
  }
  return result.messages || [];
}

export async function sendAdminMessage(
  token: string,
  sessionId: string,
  content: string
): Promise<LiveSession> {
  const result = await liveApiFetch<{ session: LiveSession }>(token, "/api/live/message", {
    method: "POST",
    body: JSON.stringify({ sessionId, sender: "admin", content })
  });
  return result.session;
}

export async function clearAllLiveSessions(token: string): Promise<number> {
  const result = await liveApiFetch<{ removed: number }>(token, "/api/live/sessions/clear", {
    method: "POST"
  });
  return result.removed;
}
