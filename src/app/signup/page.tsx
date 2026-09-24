import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <section className="section">
      <div className="container narrow">
        <SignupForm />
      </div>
    </section>
  );
}
