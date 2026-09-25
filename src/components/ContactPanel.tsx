"use client";
import { FormEvent, useEffect, useState } from "react";
import { AlertIcon, MailIcon, PhoneIcon, PinIcon } from "./Icons";
import { SuccessToast } from "./SuccessToast";
import { site } from "@/config/site";

const API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL || "http://localhost:4000";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactPanel() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (status !== "sent") return;
    setToastVisible(true);
    const timer = window.setTimeout(() => setToastVisible(false), 6500);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    setToastVisible(false);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
          website: data.get("website")
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "We couldn't send your message right now. Please try again or email us directly.");
      }

      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "We couldn't send your message right now. Please try again or email us directly.");
    }
  }

  return (
    <div className="contact-layout">
      <SuccessToast
        open={toastVisible}
        onClose={() => setToastVisible(false)}
        title="Message received"
        message="Thank you for reaching out. A member of the CoNext team will review your message and respond within one business day."
      />

      <div className="contact-card">
        <div className="contact-details">
          <a href={`mailto:${site.email}`}><MailIcon /><span><small>Email</small>{site.email}</span></a>
          <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>
            <PhoneIcon />
            <span><small>Phone</small>{site.phone}</span>
          </a>
          <div><PinIcon /><span><small>Office</small>{site.location}</span></div>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer"><GlobeLinkIcon /><span><small>LinkedIn</small>Follow CoNext</span></a>
        </div>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <label>Your name<input name="name" required placeholder="Full name" disabled={status === "sending"} /></label>
        <label>Email address<input name="email" required type="email" placeholder="you@email.com" disabled={status === "sending"} /></label>
        <label>Company or project name<input name="company" placeholder="Optional — tell us who you represent" disabled={status === "sending"} /></label>
        <label>Your message<textarea name="message" required rows={6} placeholder="Share your idea, partnership interest, or question. The more context you give, the better we can help." disabled={status === "sending"} /></label>
        <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
        <button className="button" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>

        {status === "error" && (
          <div className="alert alert-error alert-inline" role="alert">
            <span className="alert-icon" aria-hidden="true"><AlertIcon size={22} /></span>
            <div className="alert-body">
              <strong>Unable to send message</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function GlobeLinkIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17M12 3c2.6 2.5 4 5.5 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.5-4-9s1.4-6.5 4-9Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
