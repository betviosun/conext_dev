"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SuccessToast } from "./SuccessToast";

const AUTH_TOAST_KEY = "conext_auth_toast";

type ToastKind = "signup" | "login" | "logout";

type ToastContent = {
  title: string;
  message: string;
};

function toastContent(kind: ToastKind, firstName: string): ToastContent {
  const name = firstName.trim() || "there";

  if (kind === "signup") {
    return {
      title: `Welcome, ${name}!`,
      message: "Your account has been created. Please log in to continue."
    };
  }

  if (kind === "login") {
    return {
      title: `Welcome back, ${name}!`,
      message: "You are now signed in to your account."
    };
  }

  return {
    title: `Goodbye, ${name}!`,
    message: "You have been signed out successfully."
  };
}

export function queueAuthSuccessToast(kind: ToastKind, firstName: string): void {
  sessionStorage.setItem(AUTH_TOAST_KEY, JSON.stringify({ kind, firstName }));
  window.dispatchEvent(new Event("conext-auth-toast"));
}

export function AuthSuccessToast() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ToastContent>(() => toastContent("signup", ""));

  const showPendingToast = useCallback(() => {
    const raw = sessionStorage.getItem(AUTH_TOAST_KEY);
    if (!raw) return;

    let parsed: { kind?: ToastKind; firstName?: string } | null = null;
    try {
      parsed = JSON.parse(raw) as { kind?: ToastKind; firstName?: string };
    } catch {
      parsed = { kind: raw as ToastKind, firstName: "" };
    }

    if (!parsed?.kind || !["signup", "login", "logout"].includes(parsed.kind)) return;

    sessionStorage.removeItem(AUTH_TOAST_KEY);
    setContent(toastContent(parsed.kind, parsed.firstName ?? ""));
    setOpen(true);
  }, []);

  useEffect(() => {
    showPendingToast();
  }, [pathname, showPendingToast]);

  useEffect(() => {
    function onAuthToast() {
      showPendingToast();
    }
    window.addEventListener("conext-auth-toast", onAuthToast);
    return () => window.removeEventListener("conext-auth-toast", onAuthToast);
  }, [showPendingToast]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), 6500);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <SuccessToast
      open={open}
      onClose={() => setOpen(false)}
      title={content.title}
      message={content.message}
    />
  );
}
