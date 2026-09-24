import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Log in to CoNext."
        text="Access your profile, applications, and partnership updates."
      />
      <section className="section">
        <div className="container narrow">
          <form className="auth-form contact-form">
            <label>
              Email
              <input name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
            </label>
            <label>
              Password
              <input name="password" type="password" required placeholder="Your password" autoComplete="current-password" />
            </label>
            <button className="button" type="submit">Log in</button>
            <p className="form-note">
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
