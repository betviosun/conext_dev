import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ArrowIcon, CodeIcon, GlobeIcon, PeopleIcon } from "@/components/Icons";

export const metadata = {
  title: "Products",
  description: "Products built by CoNext — ideas turned into reality through collaboration and execution."
};

const products = [
  {
    icon: <PeopleIcon />,
    label: "Platform",
    title: "CoNext Partnership Hub",
    image: "/brand/product-partnership-hub.png",
    imageAlt: "CoNext Partnership Hub dashboard showing ideas and partnerships",
    description:
      "The central platform where ideas, partnerships, and opportunities connect. Built to give creators and businesses a clear path from submission to co-creation — with transparent roles, documented scope, and forward motion at every stage.",
    highlights: ["Idea intake & review workflows", "Partnership and project coordination", "Secure communication and handoffs"],
    status: "Live"
  },
  {
    icon: <CodeIcon />,
    label: "AI",
    title: "CoNext Assistant",
    image: "/brand/product-assistant.png",
    imageAlt: "CoNext Assistant chat experience on the website",
    description:
      "An intelligent assistant embedded across the CoNext experience — helping visitors explore services, understand how idea realization works, and connect with the right next step. Built in production with real evals, safety guardrails, and live human handoff.",
    highlights: ["Context-aware guidance", "Live support escalation", "Continuous improvement from real conversations"],
    status: "Live"
  },
  {
    icon: <GlobeIcon />,
    label: "Talent",
    title: "CoNext Live Jobs",
    image: "/brand/product-live-jobs.png",
    imageAlt: "CoNext Live Jobs hiring board with open engineering roles",
    description:
      "A real-time hiring platform connecting CoNext and partner organizations with engineers who ship in production. From AI and platform roles to mobile and full-stack — built for teams that move ideas forward, not just talk about them.",
    highlights: ["Live role listings", "Streamlined applications", "Production-focused hiring pipeline"],
    status: "Live",
    href: "/live-jobs"
  }
];

const pipeline = [
  {
    title: "Partner co-builds",
    text: "Products developed alongside business partners — from validated concepts through launch and ongoing iteration. Each engagement follows CoNext's co-creation model with shared scope and transparent outcomes."
  },
  {
    title: "Creator-led launches",
    text: "Ideas submitted by individuals that CoNext helped shape, build, and bring to market. Every product in our pipeline started as someone's vision of what comes next."
  }
];

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Ideas we turned into what's next."
        text="CoNext doesn't just talk about idea realization — we build. These are the products born from our own co-creation model and the partnerships we bring to life."
        image={{
          src: "/brand/products-hero.png",
          alt: "CoNext digital products displayed across laptop, tablet, and phone"
        }}
      />

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">What we build</span>
              <h2>Products that connect people to forward motion.</h2>
            </div>
            <p>
              Every CoNext product follows the same principle: connect an idea to execution, collaboration to results, and today to what comes next.
            </p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.title}>
                <div className="product-card-media">
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    width={640}
                    height={480}
                    sizes="(max-width: 900px) 100vw, 360px"
                    className="product-card-image"
                  />
                </div>
                <div className="product-card-body">
                  <div className="product-card-head">
                    <div className="icon-box">{product.icon}</div>
                    <span className="product-status">{product.status}</span>
                  </div>
                  <span className="product-label">{product.label}</span>
                  <h2>{product.title}</h2>
                  <p>{product.description}</p>
                  <ul className="product-highlights">
                    {product.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {product.href ? (
                    <Link href={product.href} className="text-link">
                      View product <ArrowIcon size={16} />
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">In the pipeline</span>
              <h2>More ideas becoming products.</h2>
            </div>
            <p>
              CoNext is actively co-building with partners and creators. These are the kinds of products moving from concept to launch through our realization process.
            </p>
          </div>
          <div className="card-grid two">
            {pipeline.map((item) => (
              <article className="audience-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-blue">
        <div className="container split">
          <div>
            <span className="eyebrow">Your idea could be next</span>
            <h2>We build products — and we build them with you.</h2>
            <p className="lead">
              Have a product idea you want to bring to life? CoNext provides the co-creation process, execution team, and forward momentum to turn it into something real.
            </p>
          </div>
          <ol className="steps">
            <li><span>01</span><div><strong>Share your concept</strong><p>Tell us what you want to build and who it serves.</p></div></li>
            <li><span>02</span><div><strong>Co-create the product plan</strong><p>Scope, timeline, roles, and success metrics — defined together.</p></div></li>
            <li><span>03</span><div><strong>Build and launch</strong><p>From MVP to market with CoNext as your realization partner.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <h2>Ready to build what comes next?</h2>
            <p>Tell us about your product idea — or explore how CoNext can co-create with your team.</p>
          </div>
          <Link className="button" href="/contact">Start building <ArrowIcon /></Link>
        </div>
      </section>
    </>
  );
}
