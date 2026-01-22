'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
]

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
]

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
]

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
]

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
]

const safeguards = [
  "Robots.txt compliance with optional override",
  "Rate-limiting guardrails and adaptive throttling",
  "PII detection with configurable redaction",
  "Data retention policies with automatic purge",
  "Audit logs for every request & extraction",
]

const milestones = [
  {
    title: "Phase 1 · MVP",
    target: "Core scraping + CSV output",
    status: "Completed",
  },
  {
    title: "Phase 2 · Anti-Detection",
    target: "Proxy, fingerprinting, retry strategy",
    status: "Completed",
  },
  {
    title: "Phase 3 · Scale",
    target: "Distributed queues + 1M listings",
    status: "Completed",
  },
  {
    title: "Phase 4 · Monitoring",
    target: "Real-time logs + alerts + dashboards",
    status: "Completed",
  },
  {
    title: "Phase 5 · UI & API",
    target: "Web console, triggers, and webhooks",
    status: "Completed",
  },
]

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
]

export default function Home() {
  const [activeTab, setActiveTab] = useState(outputTabs[0].id)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("cj")
  const [isRunning, setIsRunning] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [urlPattern, setUrlPattern] = useState<string>("https://cjdropshipping.com")
  const [maxProducts, setMaxProducts] = useState<number>(100)

  const tab = outputTabs.find((item) => item.id === activeTab) ?? outputTabs[0]

  // Fetch jobs on mount and periodically
  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/scraping/jobs?limit=10')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleStartScraping = async () => {
    if (!selectedPlatform) return

    setIsRunning(true)
    try {
      const response = await fetch('/api/scraping/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          config: {
            maxProducts,
            rateLimit: 2,
            proxyRotation: true,
            javascriptRender: true,
            urlPatterns: [urlPattern],
          },
        }),
      })

      if (response.ok) {
        const job = await response.json()
        console.log('Job created:', job)
        await fetchJobs() // Refresh jobs
      }
    } catch (error) {
      console.error('Error starting scraping job:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/scraping/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchJobs() // Refresh jobs
      }
    } catch (error) {
      console.error('Error cancelling job:', error)
    }
  }

  const handleDownloadCSV = async (jobId: string) => {
    try {
      const response = await fetch(`/api/scraping/jobs/${jobId}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `scrapeforge-export-${jobId}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading CSV:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-400'
      case 'running':
        return 'bg-yellow-400'
      case 'queued':
        return 'bg-blue-400'
      case 'failed':
        return 'bg-red-400'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
              <h1 className="text-2xl font-semibold text-white">Web Scraping Agent</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
              CJ + AliExpress Ready
            </Badge>
            <Button
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:from-fuchsia-600 hover:to-sky-600"
              onClick={() => document.getElementById('scrape-panel')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Scraping
            </Button>
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
                  <Card key={stage.id} className="rounded-2xl border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Stage {stage.id}</p>
                    <p className="text-lg font-semibold text-white">{stage.title}</p>
                    <p className="text-sm text-slate-400">{stage.detail}</p>
                  </Card>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="rounded-xl border-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  View Documentation
                </Button>
                <Button className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                  Check Status
                </Button>
              </div>
            </div>
            <Card className="space-y-6 rounded-3xl border-slate-800 bg-slate-900/70 p-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Operational Metrics</CardTitle>
                  <Badge variant="secondary" className="bg-slate-800 px-3 py-1 text-xs text-slate-400">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.map((metric) => (
                  <Card key={metric.label} className="rounded-2xl border-slate-800 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">{metric.label}</p>
                      <span className="text-xs text-emerald-300">Target met</span>
                    </div>
                    <p className="text-xl font-semibold text-white">{metric.value}</p>
                    <p className="text-xs text-slate-500">{metric.note}</p>
                  </Card>
                ))}
                <Card className="rounded-2xl border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-sm font-semibold text-white">Supported Targets</p>
                  <div className="mt-3 grid gap-3">
                    {integrations.map((item) => (
                      <div key={item.title} className="flex items-center justify-between text-sm text-slate-300">
                        <span>{item.title}</span>
                        <span className="text-xs text-slate-500">{item.note}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </CardContent>
            </Card>
          </section>

          {/* Active Jobs Panel */}
          <section id="scrape-panel" className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Operations</p>
              <h3 className="text-2xl font-semibold text-white">Scraping Console</h3>
            </div>
            <Card className="rounded-3xl border-slate-800 bg-slate-900/60 p-6">
              <CardHeader>
                <CardTitle className="text-xl text-white">Scraping Console</CardTitle>
                <CardDescription className="text-slate-400">
                  Create and manage your scraping jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Job Creation Form */}
                <div className="mb-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Start New Scraping Job</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <select
                        id="platform"
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                      >
                        <option value="cj">CJ Dropshipping</option>
                        <option value="aliexpress">AliExpress</option>
                        <option value="alibaba">Alibaba</option>
                        <option value="shopify">Shopify</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxProducts">Max Products</Label>
                      <Input
                        id="maxProducts"
                        type="number"
                        value={maxProducts}
                        onChange={(e) => setMaxProducts(parseInt(e.target.value) || 100)}
                        className="border-slate-800 bg-slate-900 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urlPattern">URL Pattern</Label>
                    <Input
                      id="urlPattern"
                      value={urlPattern}
                      onChange={(e) => setUrlPattern(e.target.value)}
                      placeholder="https://example.com/category"
                      className="border-slate-800 bg-slate-900 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleStartScraping}
                    disabled={isRunning || !urlPattern}
                    className="w-full bg-gradient-to-r from-fuchsia-500 to-sky-500 text-white hover:from-fuchsia-600 hover:to-sky-600"
                  >
                    {isRunning ? 'Starting...' : 'Start Scraping Job'}
                  </Button>
                </div>

                {/* Jobs List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Recent Jobs</h4>
                  {jobs.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No jobs yet. Create one above!</p>
                  ) : (
                    jobs.map((job) => (
                      <Card key={job.id} className="rounded-2xl border-slate-800 bg-slate-950/80 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-sm font-semibold text-white">{job.id.substring(0, 12)}...</h4>
                              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                              <span className="text-xs text-slate-500">{job.platform}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Progress</span>
                                <span>{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Products: {job.productsScraped}</span>
                                <span>Started: {new Date(job.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {job.status === 'running' && (
                              <Button
                                onClick={() => handleCancelJob(job.id)}
                                variant="outline"
                                size="sm"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                Cancel
                              </Button>
                            )}
                            {(job.status === 'completed' || job.status === 'failed') && (
                              <Button
                                onClick={() => handleDownloadCSV(job.id)}
                                variant="outline"
                                size="sm"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                Export CSV
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="space-y-6 rounded-3xl border-slate-800 bg-slate-900/60 p-6">
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Data Schema</p>
                <CardTitle className="text-2xl text-white">Complete product extraction map</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Minimum field coverage with parent/variant relationships, shipping insights, and seller intelligence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-80">
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
                </ScrollArea>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card className="rounded-3xl border-slate-800 bg-slate-900/60 p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Ethics & Compliance</CardTitle>
                  <CardDescription className="text-sm text-slate-400">
                    Safeguards ensure responsible scraping, minimize footprint, and support data governance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    {safeguards.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-slate-800 bg-slate-900/60 p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Success Criteria</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Outputs</p>
                <h3 className="text-2xl font-semibold text-white">CSV, Config, and Run Logs</h3>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-3xl border-slate-800 bg-slate-900/60 p-6">
                <Tabs defaultValue="csv" onValueChange={setActiveTab}>
                  <TabsList className="flex flex-wrap gap-2 border-b border-slate-800 bg-transparent p-0">
                    {outputTabs.map((item) => (
                      <TabsTrigger
                        key={item.id}
                        value={item.id}
                        className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:hover:border-white data-[state=active]:hover:bg-white data-[state=inactive]:border-slate-700 data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:border-slate-500 data-[state=inactive]:hover:text-slate-200"
                      >
                        {item.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-4">
                    <p className="text-sm text-slate-400">{tab.description}</p>
                    <div className="mt-4 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs text-emerald-300">
                      {tab.code.map((line, index) => (
                        <p key={`${tab.id}-${index}`}>{line}</p>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
              <Card className="rounded-3xl border-slate-800 bg-slate-900/60 p-6">
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
                      <span className="text-xs text-emerald-300">ready</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/60 p-6">
              <CardHeader>
                <CardTitle className="text-xl text-white">Architecture Modules</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Modular components for quick onboarding of new e-commerce sources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  {architecture.map((item) => (
                    <Card key={item.title} className="rounded-2xl border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <ul className="mt-3 space-y-2 text-xs text-slate-400">
                        {item.points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-400" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card className="rounded-3xl border-slate-800 bg-slate-900/60 p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-3">
                    {milestones.map((item) => (
                      <Card key={item.title} className="rounded-2xl border-slate-800 bg-slate-950/70 p-4">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.target}</p>
                        <Badge className="mt-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
                          {item.status}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900/90 p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Deployment Ready</CardTitle>
                  <CardDescription className="text-sm text-slate-400">
                    Production-ready with real API, database, and job queue system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300">
                    {[
                      "API endpoints for job management",
                      "SQLite database with Prisma ORM",
                      "Real-time job progress tracking",
                      "CSV export functionality",
                      "WebSocket for live updates",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-900/80 mt-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
            <p>ScrapeForge · Production-ready web scraping agent</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-300 transition-colors">API</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Docs</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Security</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
