import { SectionHead } from "../components/common/SectionHead"
import { Icon } from "../components/common/Icon"

export function InsightsView() {
  return (
    <>
      <div className="stat-row">
        <span>
          <strong>99.94%</strong>
          <small>API availability</small>
          <em className="up">+0.02%</em>
        </span>
        <span>
          <strong>182ms</strong>
          <small>p95 latency</small>
          <em className="up">-14ms</em>
        </span>
        <span>
          <strong>0.3%</strong>
          <small>Error rate</small>
          <em className="down">+0.1%</em>
        </span>
        <span>
          <strong>27</strong>
          <small>Failed requests (24h)</small>
        </span>
      </div>

      <div className="two-col">
        <div className="chart-card">
          <SectionHead meta="Last 24 hours" title="Requests & latency" />
          <div className="bars">
            {[
              38, 42, 30, 24, 20, 26, 44, 61, 72, 80, 76, 68, 70, 74, 82, 90,
              86, 78, 64, 58, 52, 47, 41, 36,
            ].map((h, index) => (
              <i
                key={index}
                style={{ height: `${h}%` }}
                title={`${h * 12} requests`}
              />
            ))}
          </div>
          <div className="chart-axis">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>Now</span>
          </div>
        </div>

        <aside className="side-card">
          <h3>Alarms</h3>
          <p className="side-meta">CloudWatch signals</p>
          {[
            ["amber", "Upload latency above 2s", "Triggered 18 min ago"],
            ["green", "Error rate within threshold", "Healthy"],
            ["green", "Notification delivery", "99.8% delivered"],
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
        <SectionHead title="Scheduled & event tasks" />
        {[
          ["Weekly notification digest", "Mon 08:00", "Succeeded", "approved"],
          ["Orphaned upload cleanup", "Daily 02:00", "Succeeded", "approved"],
          ["Thumbnail generation", "On upload", "2 retries", "pending"],
          ["Report escalation check", "Hourly", "Failed once", "reported"],
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
