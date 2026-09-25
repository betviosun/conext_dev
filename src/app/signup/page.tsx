import Image from "next/image";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <section className="auth-page auth-page-signup">
      <div className="auth-page-grid">
        <div className="auth-page-visual" aria-hidden="true">
          <Image
            src="/signup_left.png"
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            className="auth-page-visual-image"
          />
        </div>

        <div className="auth-page-panel">
          <div className="auth-page-panel-inner">
            <h1>Sign Up</h1>
            <Suspense fallback={<p className="lead">Loading…</p>}>
              <SignupForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
