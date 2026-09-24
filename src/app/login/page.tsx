import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <section className="section">
      <div className="container narrow">
        <Suspense fallback={<p className="lead">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
