import { Item, Status } from "../types"
import { ResourceCover } from "../components/cover/ResourceCover"
import { Button } from "../components/common/Button"
import { Icon } from "../components/common/Icon"

export function ModerationView({
  isModerator,
  items,
  modTab,
  onSelectModTab,
  onOpenResource,
  onOpenReader,
  onModerate,
  onSwitchToModerator,
}: {
  isModerator: boolean
  items: Item[]
  modTab: Status
  onSelectModTab: (tab: Status) => void
  onOpenResource: (id: number) => void
  onOpenReader?: (id: number) => void
  onModerate: (id: number, status: Status) => void
  onSwitchToModerator: () => void
}) {
  const statusLabel: Record<Status, string> = {
    approved: "Approved",
    pending: "Pending review",
    rejected: "Rejected",
    reported: "Reported",
  }

  if (!isModerator) {
    return (
      <div className="empty-state">
        <span>
          <Icon name="shield" size={28} />
        </span>
        <h2>Moderator access required</h2>
        <p>
          Your account role does not include moderation permissions. Sign in as
          a moderator to review content.
        </p>
        <Button className="primary-button" onClick={onSwitchToModerator}>
          Switch to moderator role
        </Button>
      </div>
    )
  }

  const queue = items.filter((item) => item.status === modTab)

  return (
    <div className="moderation-panel">
      <div className="moderation-summary">
        <span>
          <strong>{items.filter((i) => i.status === "pending").length}</strong>
          <small>Pending</small>
        </span>
        <span>
          <strong>{items.filter((i) => i.status === "reported").length}</strong>
          <small>Reported</small>
        </span>
        <span>
          <strong>4h</strong>
          <small>Average response</small>
        </span>
      </div>

      <div className="segmented tabs">
        {(["pending", "reported", "approved", "rejected"] as Status[]).map(
          (tab) => (
            <button
              className={modTab === tab ? "active" : ""}
              key={tab}
              onClick={() => onSelectModTab(tab)}
              type="button"
            >
              {statusLabel[tab]}{" "}
              <b>{items.filter((i) => i.status === tab).length}</b>
            </button>
          ),
        )}
      </div>

      {queue.length ? (
        queue.map((resource) => (
          <div className="review-row" key={resource.id}>
            <ResourceCover compact resource={resource} />
            <div className="review-copy">
              <span className={`status ${resource.status}`}>
                {statusLabel[resource.status]}
              </span>
              <strong>{resource.title}</strong>
              <small>
                {resource.reportReason
                  ? `Reason: ${resource.reportReason}`
                  : `By ${resource.author} · ${resource.license}`}
              </small>
            </div>
            <div className="row-actions">
              <Button
                className="secondary-button"
                onClick={() =>
                  onOpenReader
                    ? onOpenReader(resource.id)
                    : onOpenResource(resource.id)
                }
              >
                Preview
              </Button>
              {resource.status !== "approved" && (
                <Button
                  className="approve-button"
                  icon="check"
                  onClick={() => onModerate(resource.id, "approved")}
                >
                  {resource.status === "reported" ? "Keep" : "Approve"}
                </Button>
              )}
              {resource.status !== "rejected" && (
                <Button
                  className="reject-button"
                  icon="close"
                  onClick={() => onModerate(resource.id, "rejected")}
                >
                  {resource.status === "reported" ? "Remove" : "Reject"}
                </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-inline">
          <Icon name="check" size={18} /> Queue is clear. Nice work.
        </div>
      )}
    </div>
  )
}
export default ModerationView
