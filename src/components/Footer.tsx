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
          <p className="footer-copy">{site.brandStatement}</p>
          <p className="footer-tagline">{site.tagline}</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/products">Products</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h3>Reach us</h3>
          <a href={`mailto:${site.email}`} className="contact-line"><MailIcon size={17}/>{site.email}</a>
          <span className="contact-line">
            <PhoneIcon size={17}/>
            {site.phones.map((phone, index) => (
              <span key={phone}>
                {index > 0 && ", "}
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
              </span>
            ))}
          </span>
          <span className="contact-line"><PinIcon size={17}/>{site.location}</span>
          <a href={site.linkedin} className="contact-line" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        <span>Ideas deserve execution. We connect them to what comes next.</span>
      </div>
    </footer>
  );
}
