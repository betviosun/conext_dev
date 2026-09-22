import Image from "next/image";
import Link from "next/link";
import { MailIcon, PhoneIcon, PinIcon } from "./Icons";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/brand/conext-logo.png" alt="CoNext" width={230} height={77} className="footer-logo" />
          <p className="footer-tagline">{site.tagline}</p>
        </div>
        <div>
          <h3>Company</h3>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/partnership">Partnership</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`mailto:${site.email}`} className="contact-line"><MailIcon size={17}/>{site.email}</a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="contact-line"><PhoneIcon size={17}/>{site.phone}</a>
          <span className="contact-line"><PinIcon size={17}/>{site.location}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
      </div>
    </footer>
  );
}
