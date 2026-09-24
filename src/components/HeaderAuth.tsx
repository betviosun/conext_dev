"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { queueAuthSuccessToast } from "@/components/AuthSuccessToast";
import { AuthUser, fetchCurrentUser, logout } from "@/lib/auth";

export function HeaderAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    function onAuthChange() {
      refresh();
    }
    window.addEventListener("conext-auth-change", onAuthChange);
    return () => window.removeEventListener("conext-auth-change", onAuthChange);
  }, [refresh]);

  async function handleLogout() {
    const firstName = user?.firstName ?? "";
    await logout();
    setUser(null);
    queueAuthSuccessToast("logout", firstName);
  }

  if (!ready) {
    return (
      <div className="nav-auth nav-auth-loading" aria-hidden="true">
        <span className="nav-auth-placeholder" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="nav-auth">
        <span className="nav-auth-user">{user.firstName}</span>
        <button type="button" className="button button-small button-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="nav-auth">
      <Link href="/login" className="button button-small button-ghost">Log in</Link>
      <Link href="/signup" className="button button-small">Sign up</Link>
    </div>
  );
}
