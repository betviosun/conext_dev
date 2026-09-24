import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { jobPath, liveJobs } from "@/config/jobs";

export const metadata = { title: "Live Jobs" };

export default function LiveJobsPage() {
  return (
    <>
      <PageHero
        eyebrow="Live Jobs"
        title="We are hiring AI engineers who ship in production."
        text="CoNext is building serious AI, mobile, and platform capability for global software partnerships. These roles are for engineers who ship production software — not slide decks."
      />
      <section className="section">
        <div className="container jobs-list">
          {liveJobs.map((job) => (
            <article key={job.token} className="job-card">
              <div className="job-card-head">
                <div>
                  <span className="job-live-badge">
                    <span className="job-live-dot" aria-hidden="true" />
                    Live
                  </span>
                  <h2>
                    <Link href={jobPath(job.token)}>{job.title}</Link>
                  </h2>
                  <p className="job-salary">{job.salary}</p>
                  <p className="job-meta">
                    {job.location} · {job.type}
                  </p>
                </div>
                <Link className="button button-small" href={jobPath(job.token)}>
                  View role <ArrowIcon />
                </Link>
              </div>
              <p>{job.summary}</p>
              <ul className="job-tags">
                {job.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container narrow jobs-cta">
          <span className="eyebrow">Strong profile, different focus?</span>
          <h2>We still want to hear from you.</h2>
          <p>
            If you are a strong AI engineer with production experience in agents, evals, fine-tuning, or ML infrastructure, reach out even if no title is a perfect match.
          </p>
          <Link className="button" href="/contact">
            Contact our team <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
