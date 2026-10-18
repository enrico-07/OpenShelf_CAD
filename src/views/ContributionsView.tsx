import { Item, Version } from "../types"
import { ResourceCover } from "../components/cover/ResourceCover"
import { Button } from "../components/common/Button"
import { Icon } from "../components/common/Icon"

export function ContributionsView({
  mine,
  versions,
  onOpenResource,
  onStartUpload,
}: {
  mine: Item[]
  versions: Record<number, Version[]>
  onOpenResource: (id: number) => void
  onStartUpload: (revisionOf?: number) => void
}) {
  const statusLabel = {
    approved: "Approved",
    pending: "Pending review",
    rejected: "Rejected",
    reported: "Reported",
  }

  return (
    <>
      <div className="stat-row">
        <span>
          <strong>{mine.length}</strong>
          <small>Resources shared</small>
        </span>
        <span>
          <strong>
            {mine.reduce((sum, item) => sum + item.saves, 0).toLocaleString()}
          </strong>
          <small>Total saves</small>
        </span>
        <span>
          <strong>
            {mine.reduce(
              (sum, item) => sum + (versions[item.id]?.length ?? 0),
              0,
            )}
          </strong>
          <small>Versions</small>
        </span>
        <span>
          <strong>
            {mine.filter((item) => item.status === "pending").length}
          </strong>
          <small>Awaiting review</small>
        </span>
      </div>

      <div className="table-card">
        {mine.length > 0 ? (
          mine.map((item) => (
            <div className="review-row" key={item.id}>
              <ResourceCover compact resource={item} />
              <div className="review-copy">
                <span className={`status ${item.status}`}>
                  {statusLabel[item.status]}
                </span>
                <strong>{item.title}</strong>
                <small>
                  v{versions[item.id]?.[0]?.number ?? item.versions} ·{" "}
                  {item.license} · Updated {item.updated}
                </small>
              </div>
              <div className="row-actions">
                <Button
                  className="secondary-button"
                  onClick={() => onOpenResource(item.id)}
                >
                  View
                </Button>
                {item.status === "approved" && (
                  <Button
                    className="secondary-button"
                    icon="plus"
                    onClick={() => onStartUpload(item.id)}
                  >
                    New version
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div
            className="empty-state"
            style={{ margin: "16px 0", border: "none" }}
          >
            <span>
              <Icon name="upload" size={28} />
            </span>
            <h2>No contributions yet</h2>
            <p>
              Upload your study guides, lecture summaries, or practice sets to
              share with other learners.
            </p>
            <Button
              className="primary-button"
              icon="upload"
              onClick={() => onStartUpload()}
            >
              Upload your first resource
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
export default ContributionsView
