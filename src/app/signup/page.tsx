import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <section className="section">
      <div className="container narrow">
        <Suspense fallback={<p className="lead">Loading…</p>}>
          <SignupForm />
        </Suspense>
      </div>
    </section>
  );
}
