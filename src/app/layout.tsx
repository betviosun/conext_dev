import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssistWidget } from "@/components/AssistWidget";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.shortName}` },
  description: site.description,
  metadataBase: new URL(site.website),
  openGraph: {
    title: site.name,
    description: site.description,
    images: ["/brand/conext-handshake-hero.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <AssistWidget />
      </body>
    </html>
  );
}
