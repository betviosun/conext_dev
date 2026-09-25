"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { queueAuthSuccessToast } from "@/components/AuthSuccessToast";
import { GOOGLE_CLIENT_ID, isGoogleConfigured, loginWithGoogle, storeSession } from "@/lib/auth";

type GoogleAuthButtonProps = {
  mode: "login" | "signup";
  disabled?: boolean;
  onError?: (message: string) => void;
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              logo_alignment?: "left" | "center";
            }
          ) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Sign-In is unavailable."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Unable to load Google Sign-In.")), {
          once: true
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Google Sign-In."));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export function GoogleAuthButton({ mode, disabled = false, onError }: GoogleAuthButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const credential = response.credential;
      if (!credential) {
        onError?.("Google did not return a sign-in credential.");
        return;
      }

      try {
        const session = await loginWithGoogle(credential, mode);
        storeSession(session);
        queueAuthSuccessToast(session.isNewUser ? "signup" : "login", session.user.firstName);
        const next = searchParams.get("next");
        router.push(next && next.startsWith("/") ? next : "/");
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Unable to sign in with Google.");
      }
    },
    [mode, onError, router, searchParams]
  );

  useEffect(() => {
    if (!isGoogleConfigured()) {
      setLoadError("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local to your real Google OAuth client ID.");
      return;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.google?.accounts?.id) return;

        hostRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(hostRef.current, {
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          width: 200,
          logo_alignment: "left"
        });

        setReady(true);
        setLoadError("");
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Unable to load Google Sign-In.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handleCredential, mode]);

  if (!isGoogleConfigured() || loadError) {
    return (
      <div className="auth-google-fallback">
        <button type="button" className="auth-social-btn" disabled title={loadError || "Google Sign-In not configured"}>
          Authorize with Google
        </button>
        {loadError && <p className="auth-google-note">{loadError}</p>}
      </div>
    );
  }

  function triggerGoogleSignIn() {
    const googleButton = hostRef.current?.querySelector('[role="button"]') as HTMLElement | null;
    googleButton?.click();
  }

  const label = mode === "signup" ? "Sign up with Google" : "Continue with Google";

  return (
    <div className={`auth-google-wrap${disabled ? " is-disabled" : ""}`}>
      <div className="auth-google-hidden" ref={hostRef} aria-hidden="true" />
      <button
        type="button"
        className="auth-google-trigger"
        disabled={disabled || !ready}
        onClick={triggerGoogleSignIn}
      >
        <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {label}
      </button>
      {!ready && <p className="auth-google-note">Loading Google Sign-In…</p>}
    </div>
  );
}
