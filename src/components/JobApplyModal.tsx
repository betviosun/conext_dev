"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowIcon, CloseIcon } from "./Icons";
import { SuccessToast } from "./SuccessToast";

const API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL || "http://localhost:4000";

type JobApplyModalProps = {
  open: boolean;
  onClose: () => void;
  jobToken: string;
  jobTitle: string;
};

type Status = "idle" | "sending" | "sent" | "error";

export function JobApplyModal({ open, onClose, jobToken, jobTitle }: JobApplyModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setError("");
    setToastVisible(false);
    formRef.current?.reset();
  }, [open, jobToken]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && status !== "sending") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, status]);

  useEffect(() => {
    if (status !== "sent") return;
    setToastVisible(true);
    const timer = window.setTimeout(() => setToastVisible(false), 6500);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    setToastVisible(false);

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("jobToken", jobToken);
    data.set("jobTitle", jobTitle);

    try {
      const response = await fetch(`${API_URL}/api/jobs/apply`, {
        method: "POST",
        body: data
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to submit your application right now.");
      }

      form.reset();
      setStatus("sent");
      window.setTimeout(() => onClose(), 1200);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to submit your application right now.");
    }
  }

  if (!open) return null;

  return (
    <>
      <SuccessToast
        open={toastVisible}
        onClose={() => setToastVisible(false)}
        title="Application received"
        message="Thank you. Our team will review your resume and respond if there is a fit."
      />
      {createPortal(
        <div className="job-apply-root">
          <button
            type="button"
            className="job-apply-backdrop"
            aria-label="Close application form"
            onClick={() => status !== "sending" && onClose()}
          />
          <section className="job-apply-modal" role="dialog" aria-modal="true" aria-labelledby="job-apply-title">
            <header className="job-apply-header">
              <div>
                <span className="eyebrow">Apply</span>
                <h2 id="job-apply-title">{jobTitle}</h2>
                <p>Ref {jobToken} · PDF, DOC, or DOCX up to 5 MB</p>
              </div>
              <button
                type="button"
                className="job-apply-close"
                aria-label="Close"
                onClick={onClose}
                disabled={status === "sending"}
              >
                <CloseIcon size={18} />
              </button>
            </header>

            <form ref={formRef} className="job-apply-form" onSubmit={submit}>
              <label>
                Full name
                <input name="name" required placeholder="Your name" disabled={status === "sending"} autoComplete="name" />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  disabled={status === "sending"}
                  autoComplete="email"
                />
              </label>
              <label>
                Phone <span className="job-apply-optional">(optional)</span>
                <input name="phone" type="tel" placeholder="+63 …" disabled={status === "sending"} autoComplete="tel" />
              </label>
              <label>
                Resume
                <input
                  name="resume"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={status === "sending"}
                />
              </label>
              <label>
                Short note <span className="job-apply-optional">(optional)</span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Briefly share why you are a strong fit for this role."
                  disabled={status === "sending"}
                />
              </label>
              <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />

              {status === "error" && (
                <p className="job-apply-error" role="alert">{error}</p>
              )}

              <div className="job-apply-actions">
                <button type="button" className="button button-ghost" onClick={onClose} disabled={status === "sending"}>
                  Cancel
                </button>
                <button className="button" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Submitting…" : status === "sent" ? "Submitted" : <>Submit application <ArrowIcon /></>}
                </button>
              </div>
            </form>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}

type JobApplyButtonProps = {
  jobToken: string;
  jobTitle: string;
  className?: string;
  children: React.ReactNode;
};

export function JobApplyButton({ jobToken, jobTitle, className = "button", children }: JobApplyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <JobApplyModal
        open={open}
        onClose={() => setOpen(false)}
        jobToken={jobToken}
        jobTitle={jobTitle}
      />
    </>
  );
}
