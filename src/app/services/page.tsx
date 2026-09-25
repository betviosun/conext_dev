import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ArrowIcon, CodeIcon, GlobeIcon, PeopleIcon, ShieldIcon } from "@/components/Icons";

export const metadata = {
  title: "Services",
  description: "Idea intake, co-development, execution, and ongoing support — CoNext brings ideas to life at every stage."
};

const services = [
  {
    icon: <GlobeIcon />,
    title: "Idea intake & validation",
    description:
      "Every partnership starts with understanding. We review your idea with care — assessing feasibility, market fit, and the best path to realization. You get honest feedback and a clear recommendation, not a sales pitch.",
    benefit: "Start with clarity instead of guesswork.",
    cta: "Submit your idea",
    href: "/contact"
  },
  {
    icon: <PeopleIcon />,
    title: "Co-development & partnership",
    description:
      "For ideas that need more than execution — they need a co-builder. We structure co-development partnerships with defined roles, shared ownership, and aligned incentives so everyone moves forward together.",
    benefit: "Build with a partner, not just a vendor.",
    cta: "Explore our products",
    href: "/products"
  },
  {
    icon: <CodeIcon />,
    title: "Execution & delivery",
    description:
      "Design, engineering, product management, and go-to-market coordination — delivered with transparency and regular progress updates. CoNext turns validated ideas into working products and live offerings.",
    benefit: "Go from concept to live with confidence.",
    cta: "Start building",
    href: "/contact"
  },
  {
    icon: <ShieldIcon />,
    title: "Ongoing support & scaling",
    description:
      "Launch is the beginning, not the end. We provide iteration support, growth planning, and the operational backbone to help your idea scale — whether that means new features, new markets, or new partnerships.",
    benefit: "Keep moving forward after launch.",
    cta: "Talk with our team",
    href: "/contact"
  }
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Everything it takes to bring ideas to life."
        text="CoNext offers end-to-end idea realization — from the first conversation through build, launch, and what comes next. Choose one service or combine them into a full partnership."
        image={{
          src: "/brand/services-realization.png",
          alt: "Illustration of an idea moving through collaboration into a launched product"
        }}
      />

      <section className="section">
        <div className="container service-list">
          {services.map((service) => (
            <article key={service.title}>
              <div className="icon-box">{service.icon}</div>
              <div>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
                <p className="service-benefit"><strong>Benefit:</strong> {service.benefit}</p>
                <Link href={service.href} className="text-link">{service.cta} <ArrowIcon size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <h2>Not sure where to start?</h2>
            <p>Tell us about your idea and we will recommend the right path forward.</p>
          </div>
          <Link className="button" href="/contact">Start a conversation <ArrowIcon /></Link>
        </div>
      </section>
    </>
  );
}
