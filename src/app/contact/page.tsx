import { ContactPanel } from "@/components/ContactPanel";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Contact",
  description: "Reach out to CoNext — share your idea, explore a partnership, or start a conversation about what comes next."
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Let's Contact"
        title="Every great build starts with a conversation."
        text="Whether you have an idea to share, a partnership to explore, or a question about how CoNext works — we're here. Reach out and let's figure out what comes next, together."
        image={{
          src: "/brand/contact-conversation.png",
          alt: "Two people starting a conversation by phone and email"
        }}
      />
      <section className="section">
        <div className="container">
          <ContactPanel />
        </div>
      </section>
    </>
  );
}
