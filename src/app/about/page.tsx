import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ArrowIcon, ShieldIcon, GlobeIcon, PeopleIcon, CodeIcon } from "@/components/Icons";

export const metadata = {
  title: "About",
  description: "CoNext connects people's ideas to what comes next through collaboration, co-creation, and real execution."
};

const values = [
  {
    icon: <PeopleIcon />,
    title: "Collaboration over transaction",
    text: "We work with you, not around you. Every engagement is built on shared context, honest dialogue, and mutual respect for what each party brings."
  },
  {
    icon: <CodeIcon />,
    title: "Execution over aspiration",
    text: "Ideas deserve more than slide decks. We focus on building, launching, and supporting — turning vision into tangible forward motion."
  },
  {
    icon: <GlobeIcon />,
    title: "Connection over isolation",
    text: "Great outcomes happen when the right people and capabilities come together. CoNext exists to make those connections purposeful and productive."
  },
  {
    icon: <ShieldIcon />,
    title: "Integrity over shortcuts",
    text: "Transparent roles, clear terms, and honest communication. Trust is not a feature — it is the foundation of every partnership we build."
  }
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About CoNext"
        title="We connect people's ideas to what comes next."
        text="CoNext exists because too many good ideas never leave the notebook. We are an idea realization partner — receiving ideas from individuals and businesses, co-creating the path forward, and turning vision into reality."
        image={{
          src: "/brand/about-collaboration.png",
          alt: "CoNext team collaborating on bringing an idea forward"
        }}
      />

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">Our mission</span>
            <h2>Make idea realization accessible, collaborative, and real.</h2>
          </div>
          <div className="prose">
            <p>
              CoNext receives ideas from people who see what could be — and helps them build it. We are not a passive platform or a distant agency. We are a realization partner who sits beside you from first conversation through launch and beyond.
            </p>
            <p>
              Our mission is to connect human creativity to forward motion: giving individuals the execution support they lack, and giving businesses the co-innovation capacity they need to grow.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container split">
          <div>
            <span className="eyebrow">Our vision</span>
            <h2>A world where every worthy idea finds its way forward.</h2>
          </div>
          <div className="prose">
            <p>
              We envision a future where ideas are not lost to lack of resources, isolation, or uncertainty about what comes next. CoNext aims to be the connective tissue between inspiration and impact — for creators, entrepreneurs, and organizations alike.
            </p>
            <p>
              When collaboration replaces going-it-alone, and execution replaces endless planning, more ideas become products, partnerships, and progress.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">Our story</span>
            <h2>Born from a simple belief: ideas deserve execution.</h2>
          </div>
          <div className="prose">
            <p>
              CoNext started with a pattern we kept seeing — talented people with compelling ideas who lacked the team, structure, or confidence to move forward. At the same time, businesses were looking for fresh innovation but struggled to connect with the right creators and execution partners.
            </p>
            <p>
              We built CoNext to bridge that gap. Not as a middleman, but as a co-creation partner who brings clarity, capability, and momentum to every engagement. Today, we work with idea creators and business partners across industries — always with the same goal: connect the idea to what comes next.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-blue">
        <div className="container split">
          <div>
            <span className="eyebrow">What CoNext means</span>
            <h2>Two ideas. One purpose.</h2>
            <p className="lead">
              Our name is our promise — a constant reminder of who we are and how we work.
            </p>
          </div>
          <div className="name-meaning">
            <article>
              <strong>Co-</strong>
              <p>Collaboration. Connection. Working together. The &ldquo;Co-&rdquo; in CoNext means we never go it alone — we build alongside the people who bring the ideas.</p>
            </article>
            <article>
              <strong>Next</strong>
              <p>The future. Success. Forward motion. &ldquo;Next&rdquo; is what every idea is reaching for — and what CoNext helps you reach.</p>
            </article>
            <article className="name-meaning-full">
              <strong>CoNext</strong>
              <p>Together: <em>We connect people&apos;s ideas to what comes next.</em></p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Our philosophy</span>
              <h2>Ideas deserve execution.</h2>
            </div>
            <p>
              We believe the world moves forward when ideas become real. That requires more than enthusiasm — it requires a partner who collaborates honestly, executes with discipline, and stays through what comes next.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Our values</span>
              <h2>How we show up in every partnership.</h2>
            </div>
          </div>
          <div className="card-grid">
            {values.map((item) => (
              <article className="service-card" key={item.title}>
                <div className="icon-box">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">Our team</span>
            <h2>Builders, connectors, and doers.</h2>
          </div>
          <div className="prose">
            <p>
              CoNext is a team of strategists, builders, and partnership leaders who care deeply about turning ideas into outcomes. Based in the Philippines with a global outlook, we bring together product thinking, technical execution, and relationship-first collaboration.
            </p>
            <p>
              We are always looking for people who share our belief that ideas deserve execution. If that sounds like you, we would love to connect.
            </p>
            <Link href="/contact" className="text-link">Get in touch <ArrowIcon size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <span className="eyebrow">CoNext</span>
            <h2>Ready to connect your idea to what&apos;s next?</h2>
            <p>Tell us what you are building — or what you wish someone would build with you.</p>
          </div>
          <Link className="button" href="/contact">Submit your idea <ArrowIcon /></Link>
        </div>
      </section>
    </>
  );
}
