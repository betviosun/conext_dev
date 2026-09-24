"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertIcon } from "../Icons";
import { PasswordField } from "./PasswordField";
import { queueAuthSuccessToast } from "@/components/AuthSuccessToast";
import { fetchCaptcha, signup } from "@/lib/auth";

type Status = "idle" | "submitting" | "error";

export function SignupForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const loadCaptcha = useCallback(async () => {
    try {
      const captcha = await fetchCaptcha();
      setCaptchaId(captcha.id);
      setCaptchaChallenge(captcha.challenge);
    } catch {
      setCaptchaId("");
      setCaptchaChallenge("");
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setStatus("error");
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setStatus("error");
      setError("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    try {
      const user = await signup({
        firstName: String(data.get("firstName") ?? "").trim(),
        lastName: String(data.get("lastName") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        password,
        confirmPassword,
        newsletter,
        termsAccepted,
        captchaId,
        captchaAnswer: String(data.get("captchaAnswer") ?? "").trim(),
        website: String(data.get("website") ?? "")
      });

      queueAuthSuccessToast("signup", user.firstName);
      router.push("/login");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to create your account right now.");
      await loadCaptcha();
      form.reset();
      setTermsAccepted(false);
      setNewsletter(false);
    }
  }

  return (
    <form className="auth-form contact-form" onSubmit={submit}>
      <p className="auth-form-lead">It&apos;s free and takes less than 60 seconds.</p>

      <div className="auth-form-row">
        <label>
          First name*
          <input
            name="firstName"
            required
            placeholder="First name"
            autoComplete="given-name"
            disabled={status === "submitting"}
          />
        </label>
        <label>
          Last name*
          <input
            name="lastName"
            required
            placeholder="Last name"
            autoComplete="family-name"
            disabled={status === "submitting"}
          />
        </label>
      </div>

      <label>
        Email*
        <input
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
          disabled={status === "submitting"}
        />
      </label>

      <PasswordField
        name="password"
        label="Password*"
        placeholder="Create a password"
        autoComplete="new-password"
        disabled={status === "submitting"}
      />

      <PasswordField
        name="confirmPassword"
        label="Confirm password*"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        disabled={status === "submitting"}
      />

      <div className="auth-captcha">
        <label htmlFor="captchaAnswer">Type the characters</label>
        <div className="auth-captcha-row">
          <span className="auth-captcha-code" aria-hidden="true">
            {captchaChallenge || "------"}
          </span>
          <input
            id="captchaAnswer"
            name="captchaAnswer"
            required
            placeholder="Enter code"
            autoComplete="off"
            disabled={status === "submitting" || !captchaChallenge}
          />
        </div>
        <button
          type="button"
          className="auth-captcha-refresh"
          onClick={loadCaptcha}
          disabled={status === "submitting"}
        >
          Refresh code
        </button>
      </div>

      <label className="auth-checkbox">
        <input
          type="checkbox"
          checked={newsletter}
          onChange={(event) => setNewsletter(event.target.checked)}
          disabled={status === "submitting"}
        />
        <span>I allow CoNext to send me monthly newsletters.</span>
      </label>

      <label className="auth-checkbox">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
          disabled={status === "submitting"}
        />
        <span>
          By signing up, I have read and agreed to CoNext&apos;s{" "}
          <Link href="/contact">Terms &amp; Conditions</Link> and{" "}
          <Link href="/contact">Privacy Policy</Link>.
        </span>
      </label>

      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />

      <button className="button auth-submit" type="submit" disabled={status === "submitting" || !captchaChallenge}>
        {status === "submitting" ? "Creating account…" : "Sign up"}
      </button>

      <div className="auth-divider">
        <span>Or</span>
      </div>

      <div className="auth-social">
        <button type="button" className="auth-social-btn" disabled title="Coming soon">
          Authorize with Google
        </button>
        <button type="button" className="auth-social-btn" disabled title="Coming soon">
          Authorize with Facebook
        </button>
      </div>

      {status === "error" && (
        <div className="alert alert-error alert-inline" role="alert">
          <span className="alert-icon" aria-hidden="true"><AlertIcon size={22} /></span>
          <div className="alert-body">
            <strong>Unable to sign up</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <p className="form-note">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
