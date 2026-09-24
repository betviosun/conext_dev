"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ADMIN_TOKEN_KEY,
  clearAllLiveSessions,
  fetchLiveSession,
  fetchLiveSessions,
  LIVE_POLL_MS,
  LiveMessage,
  LiveSessionSummary,
  pollLiveMessages,
  sendAdminMessage
} from "@/lib/liveChat";

export function AdminLiveSupport() {
  const [token, setToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [sessions, setSessions] = useState<LiveSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [sidebarError, setSidebarError] = useState("");
  const [chatMeta, setChatMeta] = useState("Waiting chats appear on the left.");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);

  const lastMessageIdRef = useRef("");
  const pollAbortRef = useRef<AbortController | null>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
    setToken(saved);
    setTokenSaved(Boolean(saved));
  }, []);

  useEffect(() => {
    const node = chatLogRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const appendMessages = useCallback((incoming: LiveMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const known = new Set(prev.map((message) => message.id));
      const next = incoming.filter((message) => !known.has(message.id));
      if (!next.length) return prev;
      return [...prev, ...next];
    });
    const latest = incoming[incoming.length - 1];
    if (latest?.id) lastMessageIdRef.current = latest.id;
  }, []);

  const loadSessions = useCallback(async () => {
    if (!token.trim()) {
      setSessions([]);
      setSidebarError("");
      return;
    }

    try {
      setSidebarError("");
      setSessions(await fetchLiveSessions(token.trim()));
    } catch (error) {
      setSidebarError(error instanceof Error ? error.message : "Unable to load chats.");
    }
  }, [token]);

  const loadSession = useCallback(
    async (sessionId: string, replace = true) => {
      const session = await fetchLiveSession(token.trim(), sessionId);
      if (replace) {
        setMessages(session.messages);
        lastMessageIdRef.current = session.messages.length
          ? session.messages[session.messages.length - 1].id
          : "";
      } else {
        appendMessages(session.messages);
      }
    },
    [appendMessages, token]
  );

  const syncMessages = useCallback(async () => {
    if (!activeSessionId || !token.trim()) return;

    pollAbortRef.current?.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;

    try {
      const incoming = await pollLiveMessages(
        token.trim(),
        activeSessionId,
        lastMessageIdRef.current,
        controller.signal
      );
      appendMessages(incoming);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setChatMeta(error.message);
      }
    }
  }, [activeSessionId, appendMessages, token]);

  useEffect(() => {
    if (!tokenSaved) return;
    void loadSessions();
    const timer = window.setInterval(() => {
      void loadSessions();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [loadSessions, tokenSaved]);

  useEffect(() => {
    if (!activeSessionId || !tokenSaved) {
      pollAbortRef.current?.abort();
      return;
    }

    void syncMessages();
    const timer = window.setInterval(() => {
      void syncMessages();
    }, LIVE_POLL_MS);

    return () => {
      pollAbortRef.current?.abort();
      window.clearInterval(timer);
    };
  }, [activeSessionId, syncMessages, tokenSaved]);

  function saveToken() {
    const value = token.trim();
    localStorage.setItem(ADMIN_TOKEN_KEY, value);
    setTokenSaved(Boolean(value));
    void loadSessions();
  }

  async function openSession(sessionId: string) {
    setActiveSessionId(sessionId);
    setChatMeta("Connected — replies appear instantly for the visitor.");
    setSidebarError("");
    try {
      await loadSession(sessionId, true);
      await loadSessions();
    } catch (error) {
      setChatMeta(error instanceof Error ? error.message : "Unable to open chat.");
    }
  }

  async function clearHistory() {
    if (!token.trim() || clearing) return;
    if (!window.confirm("Clear all live chat sessions? This cannot be undone.")) return;

    setClearing(true);
    setSidebarError("");
    pollAbortRef.current?.abort();

    try {
      await clearAllLiveSessions(token.trim());
      setSessions([]);
      setActiveSessionId("");
      setMessages([]);
      lastMessageIdRef.current = "";
      setChatMeta("All sessions cleared.");
    } catch (error) {
      setSidebarError(error instanceof Error ? error.message : "Unable to clear sessions.");
    } finally {
      setClearing(false);
    }
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || !activeSessionId || sending) return;

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, sender: "admin", content }]);
    setSending(true);
    setInput("");

    try {
      const session = await sendAdminMessage(token.trim(), activeSessionId, content);
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      appendMessages(session.messages);
      await loadSessions();
      void syncMessages();
      setChatMeta("Connected — replies appear instantly for the visitor.");
    } catch (error) {
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      setChatMeta(error instanceof Error ? error.message : "Unable to send reply.");
    } finally {
      setSending(false);
      focusInput();
    }
  }

  return (
    <div className="admin-live-layout">
      <aside className="admin-live-sidebar">
        <div className="admin-live-brand">
          <span className="eyebrow">CoNext Admin</span>
          <h1>Live Support</h1>
          <p>Reply to website visitors in real time.</p>
        </div>

        <label htmlFor="admin-token">Admin token</label>
        <input
          id="admin-token"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="LIVE_CHAT_ADMIN_TOKEN"
        />
        <div className="admin-live-actions">
          <button type="button" className="button" onClick={saveToken}>
            Save token
          </button>
          <button type="button" className="button button-ghost" onClick={() => void loadSessions()}>
            Refresh
          </button>
          <button
            type="button"
            className="button admin-live-clear"
            onClick={() => void clearHistory()}
            disabled={!tokenSaved || clearing}
          >
            {clearing ? "Clearing…" : "Clear history"}
          </button>
        </div>

        {sidebarError && <p className="admin-live-error" role="alert">{sidebarError}</p>}

        <div className="admin-live-session-list">
          {!tokenSaved && <p className="admin-live-empty">Save your admin token to load chats.</p>}
          {tokenSaved && sessions.length === 0 && (
            <p className="admin-live-empty">No active chats right now.</p>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className={`admin-live-session${session.id === activeSessionId ? " is-active" : ""}`}
              onClick={() => void openSession(session.id)}
            >
              <span className={`admin-live-badge${session.status === "active" ? " is-active" : ""}`}>
                {session.status}
              </span>
              <strong>Visitor {session.id.slice(0, 8)}</strong>
              <span>{session.preview || "New chat"}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="admin-live-main">
        <header className="admin-live-header">
          <strong>
            {activeSessionId ? `Visitor ${activeSessionId.slice(0, 8)}` : "Select a conversation"}
          </strong>
          <p>{chatMeta}</p>
        </header>

        <div className="admin-live-log" ref={chatLogRef}>
          {!activeSessionId && (
            <p className="admin-live-empty">Choose a visitor chat to start replying.</p>
          )}
          {activeSessionId && messages.length === 0 && (
            <p className="admin-live-empty">No messages yet.</p>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`admin-live-bubble admin-live-bubble-${message.sender}`}>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        <form
          className="admin-live-composer"
          onSubmit={submitReply}
          hidden={!activeSessionId}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Write a reply…"
            maxLength={2000}
            autoComplete="off"
          />
          <button className="button" type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
