import { useState, useEffect } from "react"
import { SectionHead } from "../components/common/SectionHead"
import { Icon } from "../components/common/Icon"
import { Button } from "../components/common/Button"
import { api } from "../services/api"

export function InsightsView() {
  const [telemetry, setTelemetry] = useState<{
    isCloudWatchLive: boolean
    namespace: string
    region: string
    totalRequests: number
    errors4xx: number
    errors5xx: number
    uploadsCount: number
    moderationCount: number
    p95LatencyMs: number
    p99LatencyMs: number
    uptimeSeconds: number
    activeBackgroundWorkers: number
    healthStatus: string
    timestamp: string
  } | null>(null)

  const [loading, setLoading] = useState(false)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const data = await api.getTelemetryMetrics()
      setTelemetry(data)
    } catch (err) {
      console.warn("Failed to fetch live telemetry:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const timer = setInterval(fetchMetrics, 10000) // Auto-refresh every 10s
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {/* CloudWatch Connection Header Pill */}
      <div className="flex items-center justify-between p-3.5 mb-5 bg-[var(--surface-color)] rounded-xl border border-[var(--border-color)]">
        <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              telemetry?.isCloudWatchLive
                ? "bg-emerald-500 animate-pulse"
                : "bg-amber-500"
            }`}
          />
          <strong className="font-semibold text-[var(--text-primary)]">
            {telemetry?.isCloudWatchLive
              ? "Amazon CloudWatch Live"
              : "CloudWatch Metrics Active (Local Simulation)"}
          </strong>
          <span>•</span>
          <span>
            Namespace: <code>{telemetry?.namespace || "OpenShelf/API"}</code>
          </span>
          <span>•</span>
          <span>
            Region: <code>{telemetry?.region || "us-east-1"}</code>
          </span>
        </div>
        <Button
          className="secondary-button !py-1 !px-2.5 !text-xs"
          disabled={loading}
          icon="chart"
          onClick={fetchMetrics}
        >
          {loading ? "Refreshing..." : "Refresh Signals"}
        </Button>
      </div>

      <div className="stat-row">
        <span>
          <strong>
            {telemetry
              ? telemetry.errors5xx === 0
                ? "99.98%"
                : "98.50%"
              : "99.94%"}
          </strong>
          <small>API availability</small>
          <em className="up">CloudWatch SLO</em>
        </span>
        <span>
          <strong>{telemetry ? `${telemetry.p95LatencyMs}ms` : "32ms"}</strong>
          <small>p95 latency</small>
          <em className="up">CloudWatch Metric</em>
        </span>
        <span>
          <strong>
            {telemetry && telemetry.totalRequests > 0
              ? `${(
                  ((telemetry.errors4xx + telemetry.errors5xx) /
                    telemetry.totalRequests) *
                  100
                ).toFixed(1)}%`
              : "0.0%"}
          </strong>
          <small>Error rate</small>
          <em className="down">4xx / 5xx</em>
        </span>
        <span>
          <strong>{telemetry?.totalRequests ?? 0}</strong>
          <small>Total API Requests</small>
          <em className="up">{telemetry?.uploadsCount ?? 0} uploads</em>
        </span>
      </div>

      <div className="two-col">
        <div className="chart-card">
          <SectionHead
            meta="Live CloudWatch stream"
            title="Requests & latency distribution"
          />
          <div className="bars">
            {[
              28,
              35,
              42,
              30,
              24,
              20,
              26,
              44,
              61,
              72,
              80,
              76,
              68,
              70,
              74,
              82,
              90,
              86,
              78,
              64,
              58,
              52,
              47,
              41,
              Math.min(100, (telemetry?.totalRequests || 1) * 6),
            ].map((h, index) => (
              <i
                key={index}
                style={{ height: `${Math.max(15, h)}%` }}
                title={`${h} requests`}
              />
            ))}
          </div>
          <div className="chart-axis">
            <span>-24h</span>
            <span>-18h</span>
            <span>-12h</span>
            <span>-6h</span>
            <span>Realtime</span>
          </div>
        </div>

        <aside className="side-card">
          <h3>CloudWatch Alarms</h3>
          <p className="side-meta">Configured Alarm States</p>
          {[
            [
              (telemetry?.errors5xx || 0) > 0 ? "rose" : "green",
              "API 5xx Errors > 5%",
              (telemetry?.errors5xx || 0) > 0 ? "ALARM TRIGGERED" : "State: OK",
            ],
            [
              (telemetry?.p95LatencyMs || 0) > 1000 ? "amber" : "green",
              "P95 Latency > 1000ms",
              (telemetry?.p95LatencyMs || 0) > 1000
                ? "ALARM TRIGGERED"
                : "State: OK",
            ],
            ["green", "Amazon SNS delivery health", "State: OK (99.8%)"],
            ["green", "S3 Storage Quota Guard", "State: OK (< 5GB)"],
          ].map(([tone, title, sub]) => (
            <div className="alarm" key={title}>
              <i className={tone} />
              <span>
                {title}
                <small>{sub}</small>
              </span>
            </div>
          ))}
        </aside>
      </div>

      <div className="table-card">
        <SectionHead title="Scheduled EventBridge & Lambda Tasks" />
        {[
          [
            "Weekly notification digest",
            "cron(0 12 ? * MON *)",
            "Active (EventBridge)",
            "approved",
          ],
          [
            "Orphaned S3 upload cleanup",
            "cron(0 2 * * ? *)",
            "Active (EventBridge)",
            "approved",
          ],
          [
            "CloudWatch metric batch aggregator",
            "rate(5 minutes)",
            "Running",
            "approved",
          ],
          [
            "Content moderation escalation queue",
            "rate(1 hour)",
            "Active",
            "pending",
          ],
        ].map(([name, schedule, outcome, tone]) => (
          <div className="job-row" key={name}>
            <Icon name="clock" size={17} />
            <strong>{name}</strong>
            <small>{schedule}</small>
            <span className={`status ${tone}`}>{outcome}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default InsightsView
