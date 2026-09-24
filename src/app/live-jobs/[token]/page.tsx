import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/Icons";
import { JobApplyButton } from "@/components/JobApplyModal";
import { getJobByToken, liveJobs } from "@/config/jobs";
import { site } from "@/config/site";

type Props = { params: Promise<{ token: string }> };

export function generateStaticParams() {
  return liveJobs.map((job) => ({ token: job.token }));
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const job = getJobByToken(token);
  if (!job) return { title: "Job not found" };
  return {
    title: job.title,
    description: job.summary
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { token } = await params;
  const job = getJobByToken(token);
  if (!job) notFound();

  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <div className="job-hero-top">
            <Link href="/live-jobs" className="job-back-link">
              ← Back to Live Jobs
            </Link>
            <span className="job-live-badge">
              <span className="job-live-dot" aria-hidden="true" />
              Live
            </span>
          </div>
          <h1>{job.title}</h1>
          <p className="job-salary job-salary-hero">{job.salary}</p>
          <p className="job-meta job-meta-hero">
            {site.name} · {job.location} · {job.type} · Ref {job.token}
          </p>
          <p>{job.summary}</p>
          <ul className="job-tags job-tags-hero">
            {job.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className="job-hero-actions">
            <JobApplyButton jobToken={job.token} jobTitle={job.title}>
              Apply for this role <ArrowIcon />
            </JobApplyButton>
            <Link className="button button-ghost" href="/contact">
              Ask a question
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow job-detail">
          <div className="job-detail-block">
            <span className="eyebrow">About the role</span>
            <p className="lead">{job.overview}</p>
          </div>

          <div className="job-detail-block">
            <h2>Key responsibilities</h2>
            <ul className="job-detail-list">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="job-detail-block">
            <h2>What we need</h2>
            <ul className="job-detail-list">
              {job.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
