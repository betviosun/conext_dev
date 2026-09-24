"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { SendIcon } from "./Icons";
import { site } from "@/config/site";

const API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL || "http://localhost:4000";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hi, I'm the CoNext Assistant. How can I help you today?`
};

export function AssistWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open, sending]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
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
    }
  }

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
                <strong>CoNext Assistant</strong>
                <p>AI guide for services, partnerships, and how we work.</p>
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
              {sending && (
                <div className="assist-bubble assist-bubble-assistant assist-typing" aria-live="polite">
                  <span/><span/><span/>
                </div>
              )}
            </div>

            <form className="assist-chat-form" onSubmit={submit}>
              {error && <p className="assist-chat-error" role="alert">{error}</p>}
              <div className="assist-chat-composer">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about CoNext…"
                  disabled={sending}
                  aria-label="Message"
                  maxLength={2000}
                />
                <button className="button" type="submit" disabled={sending || !input.trim()} aria-label="Send message">
                  <SendIcon/>
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
