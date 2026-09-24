import { PageHero } from "@/components/PageHero";
import { ShieldIcon, GlobeIcon, PeopleIcon } from "@/components/Icons";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About CoNext" title="We are an open company." text="Since 2026, We've opened our doors to the world. CoNext is a Philippines-based talent and technology company focused on connecting skilled professionals, innovative teams, and global opportunities. We help create meaningful partnerships by bringing the right people, capabilities, and business needs together." />
      <section className="section"><div className="container split">
        <div><span className="eyebrow">Our mission</span><h2>Make cross-border collaboration easier to understand and safer to execute.</h2></div>
        <div className="prose"><p>Software teams increasingly work across countries, time zones, and commercial models. CoNext exists to make those relationships more structured: the right people, the right technical capability, clear communication, and clear ownership.</p><p>We believe long-term partnerships work best when expectations are documented before the work begins and every participant acts in the role they have actually been authorized to perform.</p></div>
      </div></section>
      <section className="section section-soft"><div className="container card-grid three">
        <article className="service-card"><div className="icon-box"><GlobeIcon/></div><h3>Global by design</h3><p>The Philippines is our base, while our partnership model is designed for international software markets and distributed teams.</p></article>
        <article className="service-card"><div className="icon-box"><PeopleIcon/></div><h3>People before process</h3><p>We build relationships around clear responsibilities, respectful communication, and outcomes that benefit every participating party.</p></article>
        <article className="service-card"><div className="icon-box"><ShieldIcon/></div><h3>Integrity by default</h3><p>Identity, background information, interviews, and verification must represent the actual person and authorized role involved.</p></article>
      </div></section>
    </>
  );
}
