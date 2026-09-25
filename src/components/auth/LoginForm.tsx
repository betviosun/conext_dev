"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertIcon } from "../Icons";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { PasswordField } from "./PasswordField";
import { queueAuthSuccessToast } from "@/components/AuthSuccessToast";
import { login, storeSession } from "@/lib/auth";

type Status = "idle" | "submitting" | "error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const session = await login({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
        website: String(data.get("website") ?? "")
      });

      storeSession(session);
      queueAuthSuccessToast("login", session.user.firstName);
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") && next !== "/account" ? next : "/");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to log in right now.");
    }
  }

  return (
    <form className="auth-form contact-form" onSubmit={submit}>
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
        placeholder="Your password"
        autoComplete="current-password"
        disabled={status === "submitting"}
      />

      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />

      <button className="button auth-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Logging in…" : "Log in"}
      </button>

      <div className="auth-divider">
        <span>Or</span>
      </div>

      <div className="auth-social">
        <GoogleAuthButton
          mode="login"
          disabled={status === "submitting"}
          onError={(message) => {
            setStatus("error");
            setError(message);
          }}
        />
      </div>

      {status === "error" && (
        <div className="alert alert-error alert-inline" role="alert">
          <span className="alert-icon" aria-hidden="true"><AlertIcon size={22} /></span>
          <div className="alert-body">
            <strong>Unable to log in</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <p className="form-note">
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </p>
    </form>
  );
}
