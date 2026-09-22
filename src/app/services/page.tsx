import { PageHero } from "@/components/PageHero";
import { CodeIcon, GlobeIcon, PeopleIcon, ShieldIcon } from "@/components/Icons";

export const metadata = { title: "Services" };
const rows = [
  [<GlobeIcon key="g"/>, "Global talent partnerships", "Partner discovery, role definition, cross-border coordination, and long-term relationship support for software-focused opportunities."],
  [<CodeIcon key="c"/>, "Technology delivery support", "Software engineering coordination, solution preparation, product demonstrations, technical documentation, and delivery planning."],
  [<PeopleIcon key="p"/>, "Communication & market support", "Meeting preparation, talking points, market research, business communication, and authorized local representation."],
  [<ShieldIcon key="s"/>, "Operational governance", "Role clarity, documented commercial terms, participation rules, handoff processes, and transparent collaboration standards."]
];
export default function ServicesPage(){return <><PageHero eyebrow="Services" title="Practical support across talent, technology, and market operations." text="Choose a focused engagement or combine services into a structured partnership."/><section className="section"><div className="container service-list">{rows.map(([icon,title,text])=><article key={String(title)}><div className="icon-box">{icon}</div><div><h2>{title}</h2><p>{text}</p></div></article>)}</div></section></>}
