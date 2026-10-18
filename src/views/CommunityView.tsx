import { Item, Feedback } from "../types"
import { FeedbackCard } from "../components/cards/FeedbackCard"
import { SectionHead } from "../components/common/SectionHead"
import { Avatar } from "../components/common/Avatar"
import { Icon } from "../components/common/Icon"

export type CommunityFeedbackItem = Feedback & {
  resource?: Item
}

export function CommunityView({
  allFeedback,
  onOpenResource,
}: {
  allFeedback: CommunityFeedbackItem[]
  onOpenResource: (id: number) => void
}) {
  return (
    <div className="two-col">
      <div className="feed">
        <SectionHead title="Recent feedback" />
        {allFeedback.length > 0 ? (
          allFeedback.map((entry) => (
            <FeedbackCard
              entry={entry}
              key={entry.id}
              onOpenResource={onOpenResource}
            />
          ))
        ) : (
          <div
            className="empty-state"
            style={{ margin: "16px 0", border: "none" }}
          >
            <span>
              <Icon name="message" size={28} />
            </span>
            <h2>No community reviews yet</h2>
            <p>
              Feedback, questions, and discussion threads will appear here as
              learners rate and review resources.
            </p>
          </div>
        )}
      </div>

      <aside className="side-card">
        <h3>Community guidelines</h3>
        <p className="side-meta">Peer review standards</p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            margin: "14px 0",
            fontSize: "var(--fs-sm)",
            color: "var(--text-2)",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <Icon name="check" size={16} />
            <span>
              Be constructive and cite specific corrections or additions.
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Icon name="check" size={16} />
            <span>
              Share study guides, summaries, and lecture notes under open
              licenses.
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Icon name="check" size={16} />
            <span>
              Report copyrighted exams or unverified materials for moderator
              review.
            </span>
          </div>
        </div>
        <div className="guideline">
          <Icon name="shield" size={18} />
          <p>
            Keep feedback kind and specific. Use <strong>Report</strong> on any
            resource that is misleading or shared without permission.
          </p>
        </div>
      </aside>
    </div>
  )
}
export default CommunityView
