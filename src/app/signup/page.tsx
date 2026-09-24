import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Create your CoNext account."
        text="Sign up to apply for live jobs and track your partnership conversations."
      />
      <section className="section">
        <div className="container narrow">
          <form className="auth-form contact-form">
            <label>
              Full name
              <input name="name" required placeholder="Your name" autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
            </label>
            <label>
              Password
              <input name="password" type="password" required placeholder="Create a password" autoComplete="new-password" />
            </label>
            <button className="button" type="submit">Sign up</button>
            <p className="form-note">
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
