export type JobListing = {
  token: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  summary: string;
  tags: string[];
  overview: string;
  responsibilities: string[];
  requirements: string[];
};

export const liveJobs: JobListing[] = [
  {
    token: "CNX-J240001",
    title: "Senior Generative AI Engineer",
    location: "Makati City, Philippines",
    type: "Full-time · Hybrid",
    salary: "₱120,000 – ₱175,000 / month",
    summary:
      "Own production LLM systems end to end — from RAG and agent orchestration to evals, latency tuning, and reliable deployment for CoNext's AI products and partner workflows.",
    tags: ["LLMs", "RAG", "Agents", "Python", "Production AI"],
    overview:
      "CoNext connects global software talent, technology, and partnership opportunities. We are hiring a senior engineer who has shipped real generative AI in production — not demos or one-off notebooks. You will lead how CoNext Assistant, internal automation, and partner-facing AI features are designed, evaluated, and operated. Success in this role means users get accurate, safe, and fast AI experiences while the team can iterate without breaking production.",
    responsibilities: [
      "Own the architecture for LLM-powered features across CoNext Assistant, live support flows, and internal tooling — from prompt design through deployment.",
      "Build and maintain RAG pipelines: document ingestion, chunking, embedding, retrieval tuning, and context assembly for business-specific knowledge.",
      "Implement agent workflows with tool use, structured outputs, guardrails, and fallbacks when models are uncertain or out of scope.",
      "Design evaluation suites — golden datasets, regression tests, hallucination checks, and latency/cost benchmarks — and run them before every meaningful release.",
      "Integrate OpenAI-compatible providers into PHP and Next.js services with clean APIs, rate limits, retries, and observability.",
      "Optimize token usage, caching, streaming responses, and batch jobs so AI features stay responsive under real traffic.",
      "Partner with product and delivery teams to translate partnership, hiring, and support use cases into scoped AI capabilities with clear ownership.",
      "Document prompt versions, model choices, failure modes, and runbooks so other engineers can operate and extend the systems you build."
    ],
    requirements: [
      "4+ years of software engineering experience with at least 2 years building production ML or LLM systems.",
      "Strong Python and experience shipping backend services (API design, async jobs, observability).",
      "Hands-on work with RAG, embeddings, prompt engineering, and at least one agent framework or custom orchestration layer.",
      "Experience running evals, measuring hallucination/error rates, and iterating until quality meets business thresholds.",
      "Comfort working in a hybrid setup from Metro Manila with clear written communication across time zones."
    ]
  },
  {
    token: "CNX-J240002",
    title: "AI Platform Engineer",
    location: "Makati City, Philippines",
    type: "Full-time · Hybrid",
    salary: "₱100,000 – ₱140,000 / month",
    summary:
      "Build and operate the platform layer behind CoNext AI — inference APIs, job queues, observability, and release tooling that keeps LLM features reliable at scale.",
    tags: ["MLOps", "Inference", "APIs", "Observability", "Infrastructure"],
    overview:
      "As CoNext grows AI across assistants, automation, and partner products, the platform must keep pace. This role is for an engineer who treats AI infrastructure like core product software: secure, measurable, and easy for application teams to build on. You will own the shared services, deployment patterns, and operational standards that let AI engineers ship quickly without compromising uptime, cost control, or data safety.",
    responsibilities: [
      "Design and operate AI serving infrastructure — HTTP APIs, background workers, and queue-based jobs for chat, embeddings, and batch inference.",
      "Standardize OpenAI-compatible client patterns across PHP and TypeScript codebases, including timeouts, retries, circuit breakers, and secret management.",
      "Implement structured logging, tracing, metrics, and alerting for LLM calls so failures, latency spikes, and cost overruns are visible immediately.",
      "Build internal tooling for prompt/config versioning, feature flags, and staged rollouts of model or provider changes.",
      "Maintain CI/CD pipelines for AI-related services, eval runs, and dependency updates with clear promotion steps from staging to production.",
      "Partner with security and ops on API key rotation, data retention, PII handling, and environment isolation for partner-facing workloads.",
      "Support vector index lifecycle — embedding refresh jobs, index health checks, and backup/recovery procedures.",
      "Improve developer experience with local dev setup, sandbox keys, and documentation so new engineers can integrate AI features in days, not weeks."
    ],
    requirements: [
      "4+ years of backend or platform engineering with experience operating production systems.",
      "Strong skills in at least two of: Python, TypeScript, Go, or PHP.",
      "Experience with Docker, cloud hosting, REST APIs, and background job processing.",
      "Hands-on work supporting ML or LLM features in production (not only traditional CRUD apps).",
      "Practical mindset for uptime, on-call readiness, and hybrid collaboration from Makati."
    ]
  },
  {
    token: "CNX-J240003",
    title: "Senior React Native Engineer",
    location: "Makati City, Philippines",
    type: "Full-time · Hybrid",
    salary: "₱95,000 – ₱130,000 / month",
    summary:
      "Lead cross-platform mobile delivery with React Native and Expo — partner apps, messaging, notifications, and polished iOS/Android experiences for CoNext users.",
    tags: ["React Native", "Expo", "TypeScript", "REST APIs", "iOS & Android"],
    overview:
      "CoNext's web platform is the hub for partnerships, jobs, and support — mobile extends that reach to partners and talent on the go. We need a senior React Native engineer who can own mobile from architecture through App Store and Play Store release. You will build apps that feel native, integrate cleanly with our APIs, and hold up under real-world network conditions, device fragmentation, and production support expectations.",
    responsibilities: [
      "Own the mobile application architecture — navigation, state management, module boundaries, and shared component patterns across iOS and Android.",
      "Build and ship features using React Native, Expo, and TypeScript: auth, job browsing, messaging, notifications, profile flows, and partner dashboards.",
      "Integrate REST APIs and real-time chat endpoints with robust error handling, token refresh, offline queues, and optimistic UI where appropriate.",
      "Implement push notifications, deep links, and in-app routing so users land on the right screen from email, SMS, or campaign links.",
      "Manage the release pipeline with EAS Build, TestFlight, internal testing tracks, and Google Play staged rollouts.",
      "Profile startup time, memory, frame rate, and network usage; fix crashes and device-specific issues before they affect users at scale.",
      "Collaborate with design on responsive layouts, accessibility, and consistent interaction patterns aligned with CoNext's web brand.",
      "Write release notes, setup guides, and coding standards so mobile development stays maintainable as the team and feature set grow."
    ],
    requirements: [
      "4+ years of software development experience with at least 2 apps shipped to App Store and Google Play.",
      "Strong TypeScript/JavaScript and hands-on React Native with Expo.",
      "Experience consuming REST APIs, handling auth tokens, and managing app state cleanly.",
      "Comfort with Git, code review, and hybrid collaboration from Metro Manila.",
      "Attention to detail on UX, loading states, error handling, and release quality."
    ]
  }
];

export function getJobByToken(token: string): JobListing | undefined {
  return liveJobs.find((job) => job.token === token);
}

export function jobPath(token: string): string {
  return `/live-jobs/${token}`;
}
