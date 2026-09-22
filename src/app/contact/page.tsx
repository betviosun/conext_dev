import { ContactPanel } from "@/components/ContactPanel";
import { PageHero } from "@/components/PageHero";
export const metadata = { title: "Contact" };
export default function ContactPage(){return <><PageHero eyebrow="Contact" title="Start with a straightforward conversation." text="Tell us what you need, where the opportunity is located, and what kind of collaboration you have in mind."/><section className="section"><div className="container"><ContactPanel/></div></section></>}
