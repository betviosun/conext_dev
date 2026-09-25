import Image from "next/image";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text: string;
  image?: { src: string; alt: string };
};

export function PageHero({ eyebrow, title, text, image }: PageHeroProps) {
  return (
    <section className="page-hero page-hero-centered page-hero-compact">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {image ? (
        <div className="container page-hero-media">
          <Image
            src={image.src}
            alt={image.alt}
            width={1160}
            height={652}
            priority
            sizes="(max-width: 1180px) 100vw, 1160px"
            className="page-hero-photo"
          />
        </div>
      ) : null}
    </section>
  );
}
