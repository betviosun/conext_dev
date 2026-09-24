"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { LIVE_POLL_MS } from "@/lib/liveChat";
import { SendIcon } from "./Icons";

const API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL || "http://localhost:4000";
const LIVE_SESSION_KEY = "conext_live_session_id";
const ASSISTANT_REPLY_THRESHOLD = 3;

type ChatMode = "assistant" | "live";
type MessageRole = "user" | "assistant" | "support" | "system";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

type LiveMessage = {
  id: string;
  sender: "user" | "admin" | "system";
  content: string;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi, I'm the CoNext Assistant. How can I help you today?"
};

function liveToUiMessage(message: LiveMessage): ChatMessage {
  if (message.sender === "admin") {
    return { id: message.id, role: "support", content: message.content };
  }
  if (message.sender === "system") {
    return { id: message.id, role: "system", content: message.content };
  }
  return { id: message.id, role: "user", content: message.content };
}

export function AssistWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("assistant");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [sending, setSending] = useState(false);
  const [connectingLive, setConnectingLive] = useState(false);
  const [error, setError] = useState("");
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastLiveMessageIdRef = useRef("");
  const pollAbortRef = useRef<AbortController | null>(null);

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const assistantReplyCount = messages.filter(
    (message) => message.role === "assistant" && message.id !== "welcome"
  ).length;
  const showLiveButton = mode === "assistant" && assistantReplyCount >= ASSISTANT_REPLY_THRESHOLD;

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open, sending, connectingLive]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const appendLiveMessages = useCallback((liveMessages: LiveMessage[]) => {
    if (!liveMessages.length) return;
    setMessages((prev) => {
      const known = new Set(prev.map((message) => message.id));
      const next = liveMessages
        .filter((message) => !known.has(message.id))
        .map(liveToUiMessage);
      if (!next.length) return prev;
      return [...prev, ...next];
    });
    const latest = liveMessages[liveMessages.length - 1];
    if (latest?.id) {
      lastLiveMessageIdRef.current = latest.id;
    }
  }, []);

  const syncLiveMessages = useCallback(async () => {
    if (!liveSessionId) return;

    pollAbortRef.current?.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;

    try {
      const query = new URLSearchParams({
        sessionId: liveSessionId,
        after: lastLiveMessageIdRef.current
      });
      const response = await fetch(`${API_URL}/api/live/poll?${query.toString()}`, {
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to receive live messages.");
      }
      appendLiveMessages(result.messages || []);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [appendLiveMessages, liveSessionId]);

  useEffect(() => {
    if (mode !== "live" || !liveSessionId || !open) {
      pollAbortRef.current?.abort();
      return;
    }

    void syncLiveMessages();
    const timer = window.setInterval(() => {
      void syncLiveMessages();
    }, LIVE_POLL_MS);

    return () => {
      pollAbortRef.current?.abort();
      window.clearInterval(timer);
    };
  }, [liveSessionId, mode, open, syncLiveMessages]);

  async function startLiveChat() {
    setConnectingLive(true);
    setError("");

    try {
      const context = messages
        .filter((message) => message.id !== "welcome")
        .slice(-6)
        .map((message) => `${message.role}: ${message.content}`);

      const response = await fetch(`${API_URL}/api/live/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || !result.session?.id) {
        throw new Error(result.error || "Unable to connect to support right now.");
      }

      const sessionId = String(result.session.id);
      const liveMessages = (result.session.messages || []) as LiveMessage[];

      setLiveSessionId(sessionId);
      sessionStorage.setItem(LIVE_SESSION_KEY, sessionId);
      setMode("live");
      appendLiveMessages(liveMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to support right now.");
    } finally {
      setConnectingLive(false);
    }
  }

  async function submitAssistant(text: string) {
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setSending(true);
    setError("");

    try {
      const history = nextMessages
        .filter((item) => item.id !== "welcome")
        .map(({ role, content }) => ({ role, content }));

      const response = await fetch(`${API_URL}/api/assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || !result.reply) {
        throw new Error(result.error || "Unable to reply right now.");
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: String(result.reply) }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reply right now.");
    } finally {
      setSending(false);
      focusInput();
    }
  }

  async function submitLive(text: string) {
    if (!liveSessionId) return;

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);
    setSending(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/live/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: liveSessionId,
          sender: "user",
          content: text
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to send message right now.");
      }

      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      appendLiveMessages((result.session?.messages || []) as LiveMessage[]);
      void syncLiveMessages();
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      setError(err instanceof Error ? err.message : "Unable to send message right now.");
    } finally {
      setSending(false);
      focusInput();
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || connectingLive) return;

    setInput("");
    if (mode === "live") {
      await submitLive(text);
      return;
    }
    await submitAssistant(text);
  }

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const panelTitle = mode === "live" ? "Live Support" : "CoNext Assistant";
  const panelDescription =
    mode === "live"
      ? "You are chatting with our support team in real time."
      : "AI guide for services, partnerships, and how we work.";

  return (
    <div className="assist-root">
      {open && (
        <>
          <button
            type="button"
            className="assist-backdrop"
            aria-label="Close CoNext Assistant chat"
            onClick={() => setOpen(false)}
          />
          <section className="assist-panel" aria-label="CoNext Assistant chat" role="dialog" aria-modal="true">
            <header className="assist-panel-header">
              <div>
                <strong>{panelTitle}</strong>
                <p>{panelDescription}</p>
              </div>
            </header>

            <div className="assist-chat-log" ref={listRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`assist-bubble assist-bubble-${message.role}`}
                >
                  <p>{message.content}</p>
                </div>
              ))}
              {(sending || connectingLive) && mode === "assistant" && (
                <div className="assist-bubble assist-bubble-assistant assist-typing" aria-live="polite">
                  <span /><span /><span />
                </div>
              )}
              {connectingLive && (
                <div className="assist-bubble assist-bubble-system" aria-live="polite">
                  <p>Connecting you with our support team…</p>
                </div>
              )}
            </div>

            {showLiveButton && (
              <div className="assist-live-action">
                <button
                  type="button"
                  className="button assist-live-button"
                  onClick={() => void startLiveChat()}
                  disabled={connectingLive}
                >
                  Live chat with support team
                </button>
              </div>
            )}

            <form className="assist-chat-form" onSubmit={submit}>
              {error && <p className="assist-chat-error" role="alert">{error}</p>}
              <div className="assist-chat-composer">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === "live" ? "Message support…" : "Ask about CoNext…"}
                  disabled={connectingLive}
                  aria-label="Message"
                  maxLength={2000}
                />
                <button className="button" type="submit" disabled={sending || connectingLive || !input.trim()} aria-label="Send message">
                  <SendIcon />
                </button>
              </div>
            </form>
          </section>
        </>
      )}

      {!open && (
        <button
          type="button"
          className="assist-launcher is-idle"
          aria-label="Open CoNext Assistant chat"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          <span className="assist-launcher-pulse" aria-hidden="true" />
          <Image
            className="assist-launcher-logo"
            src="/brand/conext-logo.png"
            alt=""
            width={100}
            height={30}
            priority
          />
          <span className="assist-launcher-label">Assistant</span>
        </button>
      )}
    </div>
  );
}
