import "dotenv/config";
import cors from "cors";
import express from "express";
import { generateAssistReply } from "./assistChat.js";
import { getCsvPath, saveContactRecord } from "./csvStore.js";

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(
  cors({
    origin: FRONTEND_ORIGIN.split(",").map((value) => value.trim()),
    methods: ["POST", "OPTIONS"]
  })
);

const recentByIp = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recentByIp.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recentByIp.set(ip, hits);
  return hits.length > RATE_MAX;
}

function clientIp(req) {
  return req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.ip || "unknown";
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clean(value, max = 2000) {
  return String(value || "")
    .trim()
    .slice(0, max)
    .replace(/[\r\n]+/g, " ");
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    csv: getCsvPath(),
    assistConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/assist", async (req, res) => {
  try {
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return res.status(429).json({ ok: false, error: "Too many requests. Please try again shortly." });
    }

    const reply = await generateAssistReply(req.body?.messages);
    return res.json({ ok: true, reply });
  } catch (error) {
    console.error("[assist]", error);
    return res.status(error.status || 500).json({
      ok: false,
      error: error.message || "Unable to reply right now."
    });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return res.status(429).json({ ok: false, error: "Too many requests. Please try again shortly." });
    }

    const { name, email, company, message, website } = req.body || {};

    // Honeypot — bots fill hidden fields; humans leave this empty.
    if (website) {
      return res.json({ ok: true });
    }

    const safeName = clean(name, 120);
    const safeEmail = clean(email, 180);
    const safeCompany = clean(company, 180);
    const safeMessage = String(message || "").trim().slice(0, 5000);

    if (!safeName || !safeEmail || !safeMessage) {
      return res.status(400).json({ ok: false, error: "Name, email, and message are required." });
    }
    if (!isEmail(safeEmail)) {
      return res.status(400).json({ ok: false, error: "Please provide a valid email address." });
    }

    const record = await saveContactRecord({
      name: safeName,
      gmail: safeEmail,
      company: safeCompany,
      content: safeMessage,
      ip
    });

    return res.json({ ok: true, id: record.id });
  } catch (error) {
    console.error("[contact]", error);
    return res.status(500).json({ ok: false, error: "Unable to save your enquiry right now." });
  }
});

app.listen(PORT, () => {
  console.log(`CoNext contact server listening on http://localhost:${PORT}`);
  console.log(`Contact CSV store: ${getCsvPath()}`);
  console.log(`Assist AI: ${process.env.OPENAI_API_KEY ? "configured" : "missing OPENAI_API_KEY"}`);
});
