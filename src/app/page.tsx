import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, CodeIcon, GlobeIcon, PeopleIcon, ShieldIcon } from "@/components/Icons";

const valueProps = [
  {
    icon: <PeopleIcon />,
    title: "Co-creation, not handoffs",
    text: "Your idea stays at the center. We work alongside you — sharing context, decisions, and momentum — so the result reflects your vision and our execution capability."
  },
  {
    icon: <CodeIcon />,
    title: "From concept to launch",
    text: "Validation, design, build, and go-to-market support in one connected flow. CoNext is your realization partner from the first conversation through what comes next."
  },
  {
    icon: <GlobeIcon />,
    title: "Built for individuals and teams",
    text: "Whether you arrive with a sketch on a napkin or a business ready to co-innovate, we structure the path forward with clarity, respect, and forward motion."
  },
  {
    icon: <ShieldIcon />,
    title: "Transparent by design",
    text: "Clear roles, documented scope, and honest communication at every stage. You always know where your idea stands and what happens next."
  }
];

const audiences = [
  {
    title: "Idea creators",
    text: "You see a problem worth solving or an opportunity others miss. CoNext gives you the team, process, and partnership to bring it to life — without going it alone.",
    href: "/contact",
    cta: "Submit your idea"
  },
  {
    title: "Businesses & partners",
    text: "You want to co-build, co-innovate, or expand what you offer. CoNext connects your organization to new ideas, execution capacity, and shared outcomes.",
    href: "/products",
    cta: "Explore our products"
  }
];

const testimonials = [
  {
    quote: "CoNext took our rough concept and helped us shape it into something we could actually launch. The collaboration felt like a true partnership — not a vendor relationship.",
    name: "Maria Santos",
    role: "Founder, early-stage product"
  },
  {
    quote: "We needed an innovation partner who could move fast without cutting corners. CoNext connected our team to the right execution path and kept everyone aligned.",
    name: "James Okonkwo",
    role: "Director of Product, growth-stage company"
  },
  {
    quote: "What stood out was how clearly they explained what would happen next at every step. That clarity made all the difference when we were deciding to move forward.",
    name: "Elena Vasquez",
    role: "Independent creator & consultant"
  }
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <Image
            className="hero-bg-image"
            src="/brand/conext-handshake-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="container">
          <div className="hero-copy">
            <h1>Connect your idea to what comes next.</h1>
            <p>
              <strong>CoNext</strong> receives ideas from people and turns them into reality. We co-create with individuals and businesses — connecting vision to execution, collaboration to results, and today to what&apos;s next.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/contact">Submit your idea <ArrowIcon /></Link>
              <Link className="button button-ghost" href="/products">Explore products</Link>
            </div>
            <div className="hero-points">
              <span>Idea realization</span>
              <span>Co-creation</span>
              <span>Forward momentum</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><strong>Collaboration first</strong><span>Co- means we build together</span></div>
          <div><strong>Future focused</strong><span>Next means forward motion</span></div>
          <div><strong>Real execution</strong><span>Ideas become products and partnerships</span></div>
          <div><strong>Clear partnership</strong><span>Transparent roles from day one</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">How it works</span>
              <h2>From idea to reality — together.</h2>
            </div>
            <p>
              Every engagement follows the same core path: you bring the idea, we bring the way. CoNext connects the two through structured collaboration and disciplined execution.
            </p>
          </div>
          <ol className="steps steps-inline">
            <li><span>01</span><div><strong>Share your idea</strong><p>Tell us what you want to build, solve, or explore. No polished pitch required — clarity comes through conversation.</p></div></li>
            <li><span>02</span><div><strong>Collaborate with CoNext</strong><p>We review, refine, and co-create a path forward — defining scope, roles, and what success looks like.</p></div></li>
            <li><span>03</span><div><strong>Realize what&apos;s next</strong><p>We build, launch, and support — turning your idea into something real that moves you forward.</p></div></li>
          </ol>
          <div className="section-cta-row">
            <Link href="/services" className="text-link">See how we work <ArrowIcon size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Why CoNext</span>
              <h2>Ideas deserve more than good intentions.</h2>
            </div>
            <p>
              Most ideas stall between inspiration and execution. CoNext exists to close that gap — with a partner who collaborates honestly and delivers with purpose.
            </p>
          </div>
          <div className="card-grid">
            {valueProps.map((item) => (
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
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Who we serve</span>
              <h2>Built for creators and co-builders.</h2>
            </div>
            <p>
              CoNext works with anyone who has an idea worth pursuing — and wants a capable partner to help bring it to life.
            </p>
          </div>
          <div className="card-grid two">
            {audiences.map((item) => (
              <article className="audience-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link href={item.href} className="text-link">{item.cta} <ArrowIcon size={16} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-blue">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">What people say</span>
              <h2>Real collaboration. Real results.</h2>
            </div>
            <p>Partners and creators who chose CoNext to connect their ideas to what comes next.</p>
          </div>
          <div className="quote-grid">
            {testimonials.map((item) => (
              <blockquote className="quote-card" key={item.name}>
                <p>&ldquo;{item.quote}&rdquo;</p>
                <footer>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <span className="eyebrow">CoNext</span>
            <h2>Your idea. Our way forward.</h2>
            <p>Whether you&apos;re ready to submit an idea or explore a co-innovation partnership, the next step starts with a conversation.</p>
          </div>
          <div className="cta-actions">
            <Link className="button" href="/contact">Submit your idea <ArrowIcon /></Link>
            <Link className="button button-ghost-on-dark" href="/contact">Start building</Link>
          </div>
        </div>
      </section>
    </>
  );
}
