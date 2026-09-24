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
        throw new Error(result.error || "Unable to send your enquiry right now.");
      }

      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to send your enquiry right now.");
    }
  }

  return (
    <div className="contact-layout">
      <SuccessToast open={toastVisible} onClose={() => setToastVisible(false)} />

      <div className="contact-card">
        <span className="eyebrow">Let’s talk</span>
        <h2>Build the next opportunity together.</h2>
        <p>Tell us what you are trying to achieve. We will respond with a clear scope, responsibilities, and next step.</p>
        <div className="contact-details">
          <a href={`mailto:${site.email}`}><MailIcon/><span><small>Email</small>{site.email}</span></a>
          <div>
            <PhoneIcon/>
            <span>
              <small>Telephone</small>
              {site.phones.map((phone, index) => (
                <span key={phone}>
                  {index > 0 && ", "}
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
                </span>
              ))}
            </span>
          </div>
          <div><PinIcon/><span><small>Location</small>{site.location}</span></div>
        </div>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <label>Name<input name="name" required placeholder="Your name" disabled={status === "sending"}/></label>
        <label>Email<input name="email" required type="email" placeholder="you@company.com" disabled={status === "sending"}/></label>
        <label>Company / organisation<input name="company" placeholder="Optional" disabled={status === "sending"}/></label>
        <label>How can we help?<textarea name="message" required rows={6} placeholder="Tell us about your goal, project, or partnership idea." disabled={status === "sending"}/></label>
        {/* Honeypot — leave empty */}
        <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
        <button className="button" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>

        {status === "error" && (
          <div className="alert alert-error alert-inline" role="alert">
            <span className="alert-icon" aria-hidden="true"><AlertIcon size={22}/></span>
            <div className="alert-body">
              <strong>Unable to send enquiry</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
