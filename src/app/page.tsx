import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, CodeIcon, GlobeIcon, PeopleIcon, ShieldIcon } from "@/components/Icons";

const services = [
  { icon: <GlobeIcon/>, title: "Global Talent Partnerships", text: "Structured partnerships that connect qualified professionals, software teams, and market opportunities across regions." },
  { icon: <CodeIcon/>, title: "Technology Delivery", text: "Practical software capability across product development, engineering support, technical preparation, and project delivery." },
  { icon: <PeopleIcon/>, title: "Market & Communication Support", text: "Authorized business representation, meeting preparation, communication support, and cross-border coordination." },
  { icon: <ShieldIcon/>, title: "Transparent Operations", text: "Clear roles, documented commercial terms, identity integrity, and responsible participation in every engagement." }
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
            <span className="eyebrow">Philippines · United States · Global</span>
            <h1>Connecting talent, technology, and opportunity.</h1>
            <p><strong>CoNext</strong> connects talented people, technology, and opportunities across borders to create meaningful partnerships and long-term growth. We believe the right connection can open new possibilities and help build a brighter tomorrow.</p>
            <div className="hero-actions">
              <Link className="button" href="/partnership">Explore partnership <ArrowIcon/></Link>
              <Link className="button button-ghost" href="/contact">Talk with our team</Link>
            </div>
            <div className="hero-points">
              <span>Clear responsibilities</span><span>Transparent compensation</span><span>Long-term collaboration</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><strong>Philippines based</strong><span>Built for international collaboration</span></div>
          <div><strong>Software focused</strong><span>Technology and digital talent markets</span></div>
          <div><strong>Partnership first</strong><span>Commercial terms agreed before work begins</span></div>
          <div><strong>Identity integrity</strong><span>Participants act only in their authorized role</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">What we do</span><h2>Built for modern cross-border work.</h2></div>
            <p>We combine talent, software expertise, and market coordination so each party knows what they own, what they deliver, and how value is shared.</p>
          </div>
          <div className="card-grid">
            {services.map((s) => <article className="service-card" key={s.title}><div className="icon-box">{s.icon}</div><h3>{s.title}</h3><p>{s.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section section-blue">
        <div className="container split">
          <div>
            <span className="eyebrow">Our approach</span>
            <h2>Simple structure. Clear expectations.</h2>
            <p className="lead">Every engagement starts by defining the real role of each participant. We then document scope, communication responsibilities, technical ownership, and compensation before execution begins.</p>
            <Link href="/partnership" className="text-link">See our partnership model <ArrowIcon size={16}/></Link>
          </div>
          <ol className="steps">
            <li><span>01</span><div><strong>Discover</strong><p>Understand the opportunity, people, technical scope, and market context.</p></div></li>
            <li><span>02</span><div><strong>Agree</strong><p>Define roles, authority, commercial terms, and measurable outcomes.</p></div></li>
            <li><span>03</span><div><strong>Prepare</strong><p>Build the materials, product knowledge, technical context, and communication plan.</p></div></li>
            <li><span>04</span><div><strong>Deliver</strong><p>Execute transparently, review results, and improve the partnership over time.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container compliance-panel">
          <div className="compliance-mark"><ShieldIcon size={36}/></div>
          <div>
            <span className="eyebrow">Responsible collaboration</span>
            <h2>Trust is part of the product.</h2>
            <p>CoNext is designed around transparent participation. We do not support identity substitution, deceptive verification, or undisclosed proxy interviewing. Each person participates under their own identity and authorized role, with client or employer expectations made clear.</p>
          </div>
          <Link className="button button-ghost" href="/about">Our principles</Link>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div><span className="eyebrow">CoNext</span><h2>Let’s build a brighter tomorrow.</h2><p>Have a project, partnership idea, or market opportunity? Start with a short conversation.</p></div>
          <Link className="button" href="/contact">Start a conversation <ArrowIcon/></Link>
        </div>
      </section>
    </>
  );
}
