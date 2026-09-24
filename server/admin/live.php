<?php

declare(strict_types=1);
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CoNext Live Support</title>
  <style>
    :root { --ink:#0a2446; --text:#41536c; --blue:#0a78d5; --line:#dceaf5; --pale:#f8fbff; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: var(--ink); background: #eef6fc; }
    .layout { display: grid; grid-template-columns: 320px 1fr; min-height: 100vh; }
    .sidebar, .main { background: #fff; }
    .sidebar { border-right: 1px solid var(--line); padding: 20px; }
    .main { display: flex; flex-direction: column; min-height: 100vh; }
    h1 { margin: 0 0 6px; font-size: 22px; }
    .muted { color: var(--text); font-size: 13px; margin: 0 0 16px; }
    label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: #334b66; }
    input, textarea, button { font: inherit; }
    input[type="password"], input[type="text"] { width: 100%; padding: 10px 12px; border: 1px solid #cdddea; border-radius: 10px; }
    button { border: 0; border-radius: 10px; padding: 10px 14px; background: linear-gradient(135deg, #07306d, #0a78d5); color: #fff; font-weight: 700; cursor: pointer; }
    button.secondary { background: #fff; color: var(--ink); border: 1px solid var(--line); }
    .session-list { display: grid; gap: 8px; margin-top: 16px; max-height: calc(100vh - 180px); overflow: auto; }
    .session-item { text-align: left; border: 1px solid var(--line); border-radius: 12px; padding: 12px; background: var(--pale); cursor: pointer; }
    .session-item.active { border-color: #90cdf8; background: #eff9ff; }
    .session-item strong { display: block; font-size: 13px; }
    .session-item span { display: block; font-size: 12px; color: var(--text); margin-top: 4px; }
    .badge { display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; padding: 3px 7px; border-radius: 999px; background: #fff3d6; color: #8a5a00; margin-bottom: 6px; }
    .badge.active { background: #e8f7ef; color: #0f8a57; }
    .chat-header { padding: 18px 20px; border-bottom: 1px solid var(--line); }
    .chat-log { flex: 1; overflow: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; background: var(--pale); }
    .bubble { max-width: 78%; padding: 10px 12px; border-radius: 14px; font-size: 13px; line-height: 1.45; }
    .bubble.user { align-self: flex-start; background: #fff; border: 1px solid var(--line); }
    .bubble.admin { align-self: flex-end; background: linear-gradient(135deg, #07306d, #0a78d5); color: #fff; }
    .bubble.system { align-self: center; background: #fff7e8; border: 1px solid #f0dfbf; color: #7a5a12; max-width: 92%; font-size: 12px; }
    .composer { display: flex; gap: 10px; padding: 16px 20px; border-top: 1px solid var(--line); }
    .composer input { flex: 1; padding: 12px 13px; border: 1px solid #cdddea; border-radius: 12px; }
    .empty { padding: 40px 20px; color: var(--text); }
    .error { color: #b42318; font-size: 13px; margin-top: 10px; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .sidebar { border-right: 0; border-bottom: 1px solid var(--line); } }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <h1>Live Support</h1>
      <p class="muted">Reply to website visitors in real time.</p>
      <label for="token">Admin token</label>
      <input id="token" type="password" placeholder="LIVE_CHAT_ADMIN_TOKEN">
      <div style="margin-top:10px;display:flex;gap:8px;">
        <button type="button" id="save-token">Save token</button>
        <button type="button" id="refresh-sessions" class="secondary">Refresh</button>
        <button type="button" id="clear-sessions" class="secondary" style="color:#b42318;border-color:#f0c2c2;">Clear history</button>
      </div>
      <p id="sidebar-error" class="error" hidden></p>
      <div id="session-list" class="session-list"></div>
    </aside>
    <section class="main">
      <div class="chat-header">
        <strong id="chat-title">Select a conversation</strong>
        <p class="muted" id="chat-meta">Waiting chats appear on the left.</p>
      </div>
      <div id="chat-log" class="chat-log">
        <div class="empty">Choose a visitor chat to start replying.</div>
      </div>
      <form id="composer" class="composer" hidden>
        <input id="message" type="text" placeholder="Write a reply…" maxlength="2000" autocomplete="off">
        <button type="submit">Send</button>
      </form>
    </section>
  </div>
  <script>
    const API_BASE = new URL("../", window.location.href).pathname.replace(/\/$/, "");
    const tokenInput = document.getElementById("token");
    const sessionList = document.getElementById("session-list");
    const chatLog = document.getElementById("chat-log");
    const chatTitle = document.getElementById("chat-title");
    const chatMeta = document.getElementById("chat-meta");
    const composer = document.getElementById("composer");
    const messageInput = document.getElementById("message");
    const sidebarError = document.getElementById("sidebar-error");

    let activeSessionId = "";
    let lastMessageId = "";
    let pollAbort = null;
    let sessionsTimer = null;
    window.livePollTimer = null;

    tokenInput.value = localStorage.getItem("conext_live_admin_token") || "";

    function authHeaders() {
      return {
        "Authorization": "Bearer " + tokenInput.value.trim(),
        "Content-Type": "application/json"
      };
    }

    function showSidebarError(message) {
      sidebarError.hidden = !message;
      sidebarError.textContent = message || "";
    }

    function bubbleClass(sender) {
      if (sender === "admin") return "admin";
      if (sender === "system") return "system";
      return "user";
    }

    function renderMessages(messages, replace = false) {
      if (replace) chatLog.innerHTML = "";
      if (!messages.length && replace) {
        chatLog.innerHTML = '<div class="empty">No messages yet.</div>';
        return;
      }
      const empty = chatLog.querySelector(".empty");
      if (empty) empty.remove();
      for (const message of messages) {
        const node = document.createElement("div");
        node.className = "bubble " + bubbleClass(message.sender);
        node.textContent = message.content;
        node.dataset.id = message.id;
        chatLog.appendChild(node);
        lastMessageId = message.id;
      }
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    async function apiFetch(path, options = {}) {
      const response = await fetch(API_BASE + path, options);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Request failed.");
      }
      return result;
    }

    async function loadSessions() {
      if (!tokenInput.value.trim()) {
        sessionList.innerHTML = '<div class="empty">Save your admin token to load chats.</div>';
        return;
      }
      try {
        showSidebarError("");
        const result = await apiFetch("/api/live/sessions", { headers: authHeaders() });
        if (!result.sessions.length) {
          sessionList.innerHTML = '<div class="empty">No active chats right now.</div>';
          return;
        }
        sessionList.innerHTML = "";
        for (const session of result.sessions) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "session-item" + (session.id === activeSessionId ? " active" : "");
          button.innerHTML =
            '<span class="badge ' + (session.status === "active" ? "active" : "") + '">' + session.status + '</span>' +
            "<strong>Visitor " + session.id.slice(0, 8) + "</strong>" +
            "<span>" + (session.preview || "New chat") + "</span>";
          button.addEventListener("click", () => openSession(session.id));
          sessionList.appendChild(button);
        }
      } catch (error) {
        showSidebarError(error.message);
      }
    }

    async function openSession(sessionId) {
      activeSessionId = sessionId;
      lastMessageId = "";
      composer.hidden = false;
      chatTitle.textContent = "Visitor " + sessionId.slice(0, 8);
      chatMeta.textContent = "Connected — replies appear instantly for the visitor.";
      await loadSessions();
      await loadSessionMessages(true);
      startPolling();
    }

    async function loadSessionMessages(replace = false) {
      const result = await apiFetch("/api/live/session?id=" + encodeURIComponent(activeSessionId), {
        headers: authHeaders()
      });
      const messages = result.session.messages || [];
      if (replace) {
        renderMessages(messages, true);
        lastMessageId = messages.length ? messages[messages.length - 1].id : "";
      }
    }

    async function pollMessages() {
      if (!activeSessionId) return;
      pollAbort?.abort();
      pollAbort = new AbortController();
      try {
        const query = new URLSearchParams({
          sessionId: activeSessionId,
          after: lastMessageId || ""
        });
        const response = await fetch(API_BASE + "/api/live/poll?" + query.toString(), {
          signal: pollAbort.signal,
          headers: authHeaders()
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) return;
        if (result.messages?.length) {
          renderMessages(result.messages, false);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      } finally {
        // Instant backend poll — interval keeps chat responsive without blocking PHP.
      }
    }

    function startPolling() {
      pollAbort?.abort();
      pollMessages();
      if (window.livePollTimer) window.clearInterval(window.livePollTimer);
      window.livePollTimer = window.setInterval(pollMessages, 400);
    }

    document.getElementById("save-token").addEventListener("click", () => {
      localStorage.setItem("conext_live_admin_token", tokenInput.value.trim());
      loadSessions();
    });

    document.getElementById("refresh-sessions").addEventListener("click", loadSessions);

    document.getElementById("clear-sessions").addEventListener("click", async () => {
      if (!tokenInput.value.trim()) return;
      if (!window.confirm("Clear all live chat sessions? This cannot be undone.")) return;
      try {
        pollAbort?.abort();
        if (window.livePollTimer) window.clearInterval(window.livePollTimer);
        activeSessionId = "";
        lastMessageId = "";
        composer.hidden = true;
        chatTitle.textContent = "Select a conversation";
        chatMeta.textContent = "All sessions cleared.";
        chatLog.innerHTML = '<div class="empty">Choose a visitor chat to start replying.</div>';
        await apiFetch("/api/live/sessions/clear", { method: "POST", headers: authHeaders() });
        await loadSessions();
      } catch (error) {
        showSidebarError(error.message);
      }
    });

    composer.addEventListener("submit", async (event) => {
      event.preventDefault();
      const content = messageInput.value.trim();
      if (!content || !activeSessionId) return;
      messageInput.value = "";
      try {
        await apiFetch("/api/live/message", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ sessionId: activeSessionId, sender: "admin", content })
        });
        await loadSessionMessages(false);
        await loadSessions();
      } catch (error) {
        chatMeta.textContent = error.message;
      }
    });

    loadSessions();
    sessionsTimer = window.setInterval(loadSessions, 4000);
  </script>
</body>
</html>
