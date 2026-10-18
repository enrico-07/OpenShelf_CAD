import { useState, useMemo } from "react"
import { Item, Version, Feedback } from "../../types"
import Icon from "../common/Icon"
import Button from "../common/Button"
import Stars from "../common/Stars"
import Avatar from "../common/Avatar"
import ResourceCover from "../cover/ResourceCover"

export function DetailDrawer({
  open,
  onClose,
  selected,
  selectedVersions,
  selectedFeedback,
  saved,
  onToggleSave,
  following,
  onToggleFollow,
  detailTab,
  onSelectDetailTab,
  onRate,
  userRating,
  comment,
  onCommentChange,
  onSubmitFeedback,
  onHelpfulFeedback,
  onReplyFeedback,
  onOpenReport,
  onOpenCollect,
  onOpenReader,
  onOpenVersions,
  onStartUploadRevision,
  onSelectTag,
  onDownload,
}: {
  open: boolean
  onClose: () => void
  selected: Item
  selectedVersions: Version[]
  selectedFeedback: Feedback[]
  saved: boolean
  onToggleSave: () => void
  following: boolean
  onToggleFollow: () => void
  detailTab: "overview" | "feedback" | "history"
  onSelectDetailTab: (tab: "overview" | "feedback" | "history") => void
  onRate: (rating: number) => void
  userRating: number
  comment: string
  onCommentChange: (val: string) => void
  onSubmitFeedback: () => void
  onHelpfulFeedback: (feedbackId: number) => void
  onReplyFeedback: (feedbackId: number, text: string) => void
  onOpenReport: () => void
  onOpenCollect: () => void
  onOpenReader: () => void
  onOpenVersions: () => void
  onStartUploadRevision: () => void
  onSelectTag: (tag: string) => void
  onDownload: () => void
}) {
  const [feedbackSort, setFeedbackSort] = useState<"helpful" | "newest">(
    "helpful",
  )
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")

  const statusLabel = {
    approved: "Approved",
    pending: "Pending review",
    rejected: "Rejected",
    reported: "Reported",
  }

  const sortedFeedback = useMemo(() => {
    const list = [...selectedFeedback]
    if (feedbackSort === "helpful") {
      return list.sort((a, b) => b.helpful - a.helpful)
    }
    return list.sort((a, b) => b.id - a.id)
  }, [selectedFeedback, feedbackSort])

  const handleSendReply = (feedbackId: number) => {
    if (!replyText.trim()) return
    onReplyFeedback(feedbackId, replyText.trim())
    setReplyText("")
    setActiveReplyId(null)
  }

  if (!selected) {
    return null
  }

  return (
    <aside className={`detail-panel ${open ? "open" : ""}`}>
      <div className="detail-top">
        <span className="detail-kicker">Preview</span>
        <div className="detail-top-actions">
          <button
            aria-label="Report resource"
            className="icon-button small"
            onClick={onOpenReport}
            title="Report"
            type="button"
          >
            <Icon name="flag" size={17} />
          </button>
          <button
            aria-label="Close preview"
            className="icon-button small detail-close"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={17} />
          </button>
        </div>
      </div>

      <ResourceCover resource={selected} />

      <div className="detail-heading">
        <span className={`status ${selected.status}`}>
          {selected.status === "approved" && <Icon name="check" size={13} />}{" "}
          {selected.status === "approved"
            ? "Community verified"
            : statusLabel[selected.status]}
        </span>
        <h2>{selected.title}</h2>
        <p>
          by <strong>{selected.author}</strong> · Updated {selected.updated}
        </p>
      </div>

      <div className="detail-tabs">
        {(["overview", "feedback", "history"] as const).map((tab) => (
          <button
            className={detailTab === tab ? "active" : ""}
            key={tab}
            onClick={() => onSelectDetailTab(tab)}
            type="button"
          >
            {tab === "overview"
              ? "Overview"
              : tab === "feedback"
                ? `Feedback ${selectedFeedback.length}`
                : "History"}
          </button>
        ))}
      </div>

      {detailTab === "overview" && (
        <>
          <div className="detail-stats">
            <span>
              <strong>{selected.pages}</strong>
              <small>pages</small>
            </span>
            <span>
              <strong>{selected.rating || "–"}</strong>
              <small>rating</small>
            </span>
            <span>
              <strong>{selectedVersions.length}</strong>
              <small>versions</small>
            </span>
          </div>

          <p className="detail-description">{selected.description}</p>

          <div className="tag-row">
            {selected.tags.map((tag) => (
              <button key={tag} onClick={() => onSelectTag(tag)} type="button">
                {tag}
              </button>
            ))}
          </div>

          <div className="detail-actions">
            <Button
              className="primary-button open-button"
              icon="book"
              onClick={onOpenReader}
            >
              Open resource
            </Button>
            <button
              aria-label="Add to collection"
              className="square-button"
              onClick={onOpenCollect}
              title="Add to collection"
              type="button"
            >
              <Icon name="collection" />
            </button>
            <button
              aria-label={saved ? "Remove from library" : "Save to library"}
              className={`square-button ${saved ? "saved" : ""}`}
              onClick={onToggleSave}
              type="button"
            >
              <Icon filled={saved} name="bookmark" />
            </button>
          </div>

          <div className="detail-secondary">
            <button
              className={following ? "on" : ""}
              onClick={onToggleFollow}
              type="button"
            >
              <Icon name={following ? "check" : "bell"} size={17} />{" "}
              {following ? "Following" : "Follow updates"}
            </button>
            <button onClick={onDownload} type="button">
              <Icon name="download" size={17} /> Download
            </button>
          </div>

          <div className="license-note">
            <Icon name="shield" size={17} />
            <span>
              <strong>{selected.license}</strong>
              <small>
                Attribution: {selected.author} and{" "}
                {Math.max(selectedVersions.length - 1, 0)} revision contributors
              </small>
            </span>
          </div>
        </>
      )}

      {detailTab === "feedback" && (
        <div className="feedback-panel">
          <div className="rate-box">
            <span>Your rating</span>
            <Stars onRate={onRate} size={20} value={userRating} />
          </div>
          <textarea
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Share something useful for other learners..."
            rows={3}
            value={comment}
          />
          <Button
            className="primary-button wide-button"
            icon="message"
            onClick={onSubmitFeedback}
          >
            Post feedback
          </Button>

          {/* Feedback Sorting Header */}
          <div className="feedback-header-controls">
            <span>
              <strong>{selectedFeedback.length}</strong> Community comments
            </span>
            <div className="feedback-sort-toggle">
              <button
                className={feedbackSort === "helpful" ? "active" : ""}
                onClick={() => setFeedbackSort("helpful")}
                type="button"
              >
                Top Helpful
              </button>
              <button
                className={feedbackSort === "newest" ? "active" : ""}
                onClick={() => setFeedbackSort("newest")}
                type="button"
              >
                Newest
              </button>
            </div>
          </div>

          {sortedFeedback.length ? (
            sortedFeedback.map((entry) => (
              <div className="mini-feedback-thread" key={entry.id}>
                <div className="mini-feedback">
                  <div>
                    <Avatar initials={entry.initials} />
                    <strong>{entry.author}</strong>
                    <Stars size={11} value={entry.rating} />
                  </div>
                  <p>{entry.text}</p>
                  <div className="feedback-action-row">
                    <small>{entry.when}</small>
                    <span className="dot" />
                    <button
                      className="helpful-btn"
                      onClick={() => onHelpfulFeedback(entry.id)}
                      type="button"
                    >
                      <Icon name="heart" size={13} /> Helpful ({entry.helpful})
                    </button>
                    <span className="dot" />
                    <button
                      className="reply-btn"
                      onClick={() =>
                        setActiveReplyId(
                          activeReplyId === entry.id ? null : entry.id,
                        )
                      }
                      type="button"
                    >
                      <Icon name="message" size={13} /> Reply
                    </button>
                  </div>
                </div>

                {/* Nested Threaded Replies */}
                {entry.replies && entry.replies.length > 0 && (
                  <div className="feedback-replies-list">
                    {entry.replies.map((reply) => (
                      <div className="feedback-reply-item" key={reply.id}>
                        <Avatar initials={reply.initials} />
                        <div className="reply-body">
                          <div className="reply-author-line">
                            <strong>{reply.author}</strong>
                            {reply.role === "author" && (
                              <span className="author-badge">Author</span>
                            )}
                            <small>{reply.when}</small>
                          </div>
                          <p>{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Box */}
                {activeReplyId === entry.id && (
                  <div className="feedback-reply-input-box">
                    <input
                      autoFocus
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendReply(entry.id)
                      }}
                      placeholder={`Reply to ${entry.author}...`}
                      value={replyText}
                    />
                    <button
                      className="reply-submit-btn"
                      onClick={() => handleSendReply(entry.id)}
                      type="button"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="muted-dark">No feedback yet. Be the first to help.</p>
          )}

          <button className="report-link" onClick={onOpenReport} type="button">
            <Icon name="flag" size={15} /> Report this resource
          </button>
        </div>
      )}

      {detailTab === "history" && (
        <div className="version-section">
          <div className="version-heading">
            <strong>Version history</strong>
            <button onClick={onOpenVersions} type="button">
              View all
            </button>
          </div>
          {selectedVersions.slice(0, 4).map((version, index) => (
            <div
              className={`version-item ${index === 0 ? "current" : ""}`}
              key={version.number}
            >
              <span>{index === 0 && <Icon name="check" size={14} />}</span>
              <div>
                <strong>
                  Version {version.number}.0 {index === 0 && <i>Current</i>}
                </strong>
                <small>{version.note}</small>
                <p>
                  {version.author} · {version.when}
                </p>
              </div>
            </div>
          ))}
          <Button
            className="revision-button"
            icon="plus"
            onClick={onStartUploadRevision}
          >
            Suggest an improvement
          </Button>
        </div>
      )}
    </aside>
  )
}
export default DetailDrawer
