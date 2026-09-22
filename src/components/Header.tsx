import Image from "next/image";
import Link from "next/link";

const nav = [
  ["About", "/about"],
  ["Services", "/services"],
  ["Partnership", "/partnership"],
  ["Contact", "/contact"]
] as const;

export function Header() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="brand" aria-label="CoNext home">
          <Image src="/brand/conext-logo.png" alt="CoNext" width={270} height={90} priority />
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <Link href="/contact" className="button button-small">Start a conversation</Link>
      </div>
    </header>
  );
}
