import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";

const stages = [
  {
    id: "01",
    title: "Scrape",
    detail: "Headless collection with adaptive throttling and captcha awareness.",
  },
  {
    id: "02",
    title: "Validate",
    detail: "Schema enforcement, deduplication, and enrichment at scale.",
  },
  {
    id: "03",
    title: "Deliver",
    detail: "Chunked CSVs, metadata reports, and webhook notifications.",
  },
];

const metrics = [
  {
    label: "Throughput",
    value: "120+ products/min",
    note: "Dynamic throttling keeps success rates high.",
  },
  {
    label: "Scale",
    value: "1M+ listings",
    note: "Distributed queues for horizontal growth.",
  },
  {
    label: "Accuracy",
    value: "98.6% extraction",
    note: "Validation gate prevents missing critical fields.",
  },
  {
    label: "Uptime",
    value: "24h stealth mode",
    note: "Proxy rotation + resilient retry strategy.",
  },
];

const schemaFields = [
  "product_id",
  "product_url",
  "title",
  "description",
  "main_category",
  "sub_category",
  "price",
  "original_price",
  "currency",
  "shipping_cost",
  "shipping_time_estimate",
  "vendor/seller_name",
  "vendor_rating",
  "product_rating",
  "review_count",
  "images_urls",
  "variant_options",
  "stock_status",
  "minimum_order_quantity",
  "weight",
  "dimensions",
  "sku",
  "date_scraped",
  "platform_source",
];

const architecture = [
  {
    title: "Collection Layer",
    points: [
      "Playwright + Scrapy hybrid pipelines",
      "Rotating proxy pools (residential + datacenter)",
      "User-agent + fingerprint randomization",
    ],
  },
  {
    title: "Resilience Layer",
    points: [
      "Exponential backoff retries",
      "CAPTCHA detection with pause/solve hooks",
      "Robots.txt compliance with override switch",
    ],
  },
  {
    title: "Data Layer",
    points: [
      "Pipe-delimited UTF-8 CSV with BOM",
      "Validation + dedupe at write time",
      "Metadata & summary stats per run",
    ],
  },
  {
    title: "Control Plane",
    points: [
      "YAML-driven configuration",
      "Queue-backed scheduling (Redis/RabbitMQ)",
      "Webhook + API triggers",
    ],
  },
];

const outputTabs = [
  {
    id: "csv",
    title: "CSV Output",
    description: "Pipe-delimited, UTF-8 with BOM, 100MB chunking, schema safe.",
    code: [
      "product_id|product_url|title|price|currency|images_urls|date_scraped|platform_source",
      "CJ-493034|https://cjdropshipping.com/...|Wireless Earbuds|29.99|USD|https://...|2024-06-12|CJ",
      "ALI-193883|https://aliexpress.com/...|Smart LED Strip|12.40|USD|https://...|2024-06-12|AliExpress",
    ],
  },
  {
    id: "config",
    title: "Config Sample",
    description: "YAML configuration powering selectors, limits, and anti-bot strategy.",
    code: [
      "scraping_config:",
      "  target_sites:",
      "    - url_patterns: ['cjdropshipping.com']",
      "      rate_limit: 6",
      "      proxy_rotation: true",
      "      javascript_render: true",
      "  resilience:",
      "    max_retries: 5",
      "    timeout_seconds: 30",
      "    captcha_handling: 'pause'",
    ],
  },
  {
    id: "metrics",
    title: "Run Summary",
    description: "Structured logging for compliance, reliability, and alerting.",
    code: [
      "{",
      "  \"run_id\": \"2024-06-12T18:32:12Z\",",
      "  \"products_scraped\": 10024,",
      "  \"success_rate\": 0.986,",
      "  \"captcha_events\": 2,",
      "  \"average_latency_ms\": 840",
      "}",
    ],
  },
];

const safeguards = [
  "Robots.txt compliance with optional override",
  "Rate-limiting guardrails and adaptive throttling",
  "PII detection with configurable redaction",
  "Data retention policies with automatic purge",
  "Audit logs for every request & extraction",
];

const milestones = [
  {
    title: "Phase 1 · MVP",
    target: "Core scraping + CSV output",
    status: "In progress",
  },
  {
    title: "Phase 2 · Anti-Detection",
    target: "Proxy, fingerprinting, retry strategy",
    status: "Queued",
  },
  {
    title: "Phase 3 · Scale",
    target: "Distributed queues + 1M listings",
    status: "Queued",
  },
  {
    title: "Phase 4 · Monitoring",
    target: "Real-time logs + alerts + dashboards",
    status: "Queued",
  },
  {
    title: "Phase 5 · UI & API",
    target: "Web console, triggers, and webhooks",
    status: "Queued",
  },
];

const integrations = [
  {
    title: "CJ Dropshipping",
    note: "Catalog + variants + shipping matrix",
  },
  {
    title: "AliExpress",
    note: "Dynamic content + seller analytics",
  },
  {
    title: "Alibaba",
    note: "B2B bulk listings support",
  },
  {
    title: "Shopify",
    note: "Custom storefront connectors",
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState(outputTabs[0].id);
  const tab = useMemo(
    () => outputTabs.find((item) => item.id === activeTab) ?? outputTabs[0],
    [activeTab]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-[140px]" />
          <div className="absolute bottom-[-200px] right-[-120px] h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-[140px]" />
        </div>

        <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 text-fuchsia-200 shadow-lg shadow-fuchsia-500/10">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m6.364-1.364-2.121 2.121M21 12h-3M18.364 18.364l-2.121-2.121M12 18v3M7.757 16.243l-2.121 2.121M6 12H3m4.636-5.364L5.515 4.515" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">ScrapeForge</p>
              <h1 className="text-2xl font-semibold text-white">Web Scraping Agent Blueprint</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
              CJ + AliExpress Ready
            </span>
            <button className="rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30">
              Deploy Agent
            </button>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Intelligent Scraping Engine
              </div>
              <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Large-scale e-commerce extraction, resilient to anti-bot defenses.
              </h2>
              <p className="text-lg text-slate-300">
                ScrapeForge orchestrates multi-site scraping with adaptive rate limiting, proxy rotation, and
                structured validation. It outputs CSV-ready product catalogs with full variant hierarchies,
                shipping insights, and seller intelligence.
              </p>
              <div className="flex flex-wrap gap-3">
                {stages.map((stage) => (
                  <div key={stage.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Stage {stage.id}</p>
                    <p className="text-lg font-semibold text-white">{stage.title}</p>
                    <p className="text-sm text-slate-400">{stage.detail}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900">
                  Download Spec PDF
                </button>
                <button className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white">
                  Run Test Mode
                </button>
              </div>
            </div>
            <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Operational Metrics</h3>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">Live model</span>
              </div>
              <div className="grid gap-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">{metric.label}</p>
                      <span className="text-xs text-emerald-300">Target met</span>
                    </div>
                    <p className="text-xl font-semibold text-white">{metric.value}</p>
                    <p className="text-xs text-slate-500">{metric.note}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-sm font-semibold text-white">Supported Targets</p>
                <div className="mt-3 grid gap-3">
                  {integrations.map((item) => (
                    <div key={item.title} className="flex items-center justify-between text-sm text-slate-300">
                      <span>{item.title}</span>
                      <span className="text-xs text-slate-500">{item.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Data Schema</p>
                <h3 className="text-2xl font-semibold text-white">Complete product extraction map</h3>
                <p className="text-sm text-slate-400">
                  Minimum field coverage with parent/variant relationships, shipping insights, and seller intelligence.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {schemaFields.map((field) => (
                  <div
                    key={field}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300"
                  >
                    {field}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-xl font-semibold text-white">Ethics & Compliance</h3>
                <p className="text-sm text-slate-400">
                  Safeguards ensure responsible scraping, minimize footprint, and support data governance.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {safeguards.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-xl font-semibold text-white">Success Criteria</h3>
                <div className="mt-4 space-y-3">
                  {[
                    "Scrape 1,000+ products from CJ & AliExpress per run",
                    "Handle IP blocks & CAPTCHAs gracefully",
                    "95%+ uptime across consecutive runs",
                    "<2% missing optional fields in CSV",
                    "24h stealth operation",
                  ].map((goal) => (
                    <div key={goal} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Outputs</p>
                <h3 className="text-2xl font-semibold text-white">CSV, Config, and Run Logs</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {outputTabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                      activeTab === item.id
                        ? "border-white bg-white text-slate-900"
                        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    )}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-sm text-slate-400">{tab.description}</p>
                <div className="mt-4 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs text-emerald-300">
                  {tab.code.map((line, index) => (
                    <p key={`${tab.id}-${index}`}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <h4 className="text-lg font-semibold text-white">Operational Checklist</h4>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {[
                    "Headless browser support for JS-heavy pages",
                    "Cookie/session persistence",
                    "Blocking pattern detection + mitigation",
                    "Distributed scheduling + queue control",
                    "Webhook notifications on completion",
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                      <span>{item}</span>
                      <span className="text-xs text-slate-500">ready</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-xl font-semibold text-white">Architecture Modules</h3>
              <p className="text-sm text-slate-400">
                Modular components for quick onboarding of new e-commerce sources.
              </p>
              <div className="mt-4 space-y-4">
                {architecture.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <ul className="mt-3 space-y-2 text-xs text-slate-400">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-400" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-xl font-semibold text-white">Milestones</h3>
                <div className="mt-4 space-y-3">
                  {milestones.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.target}</p>
                      <span className="mt-2 inline-flex rounded-full bg-slate-800 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900/90 p-6">
                <h3 className="text-xl font-semibold text-white">Deployment Readiness</h3>
                <p className="text-sm text-slate-400">
                  Docker-ready, cloud-optimized, API-triggered. Scale on demand with queue workers.
                </p>
                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  {[
                    "Docker containerization",
                    "AWS/GCP/Azure compatible",
                    "Schedule-based execution",
                    "API endpoint for triggers",
                    "Webhook notifications",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-900/80">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
            <p>ScrapeForge · Intelligent web scraping agent specification</p>
            <div className="flex items-center gap-6">
              <span>Docs</span>
              <span>API</span>
              <span>Security</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
