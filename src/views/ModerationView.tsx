import { useState } from "react"
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
  onUpgradeWithPasskey,
}: {
  isModerator: boolean
  items: Item[]
  modTab: Status
  onSelectModTab: (tab: Status) => void
  onOpenResource: (id: number) => void
  onOpenReader?: (id: number) => void
  onModerate: (id: number, status: Status) => void
  onUpgradeWithPasskey?: (passkey: string) => Promise<boolean>
}) {
  const [passkeyInput, setPasskeyInput] = useState("")
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const statusLabel: Record<Status, string> = {
    approved: "Approved",
    pending: "Pending review",
    rejected: "Rejected",
    reported: "Reported",
  }

  if (!isModerator) {
    return (
      <div
        className="empty-state"
        style={{ maxWidth: "440px", margin: "40px auto" }}
      >
        <span>
          <Icon name="shield" size={28} />
        </span>
        <h2>Moderator authorization required</h2>
        <p>
          The community moderation queue is restricted to verified moderators.
          Enter your institutional security passkey to unlock permissions.
        </p>

        {passkeyError && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "var(--fs-sm)",
              marginBottom: "12px",
            }}
          >
            {passkeyError}
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!onUpgradeWithPasskey) return
            setPasskeyError(null)
            setIsVerifying(true)
            const success = await onUpgradeWithPasskey(passkeyInput.trim())
            setIsVerifying(false)
            if (!success) {
              setPasskeyError(
                "Invalid Moderator Security Passkey. Access denied.",
              )
            }
          }}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          <input
            type="password"
            placeholder="Enter key (Demo: OPENSHELF_MOD_2026)"
            value={passkeyInput}
            onChange={(e) => setPasskeyInput(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              background: "var(--surface-color)",
              color: "var(--text-color)",
            }}
          />
          <Button
            className="primary-button"
            icon={isVerifying ? "clock" : "shield"}
            type="submit"
            disabled={isVerifying || !passkeyInput.trim()}
          >
            {isVerifying ? "Verifying key..." : "Verify & Unlock Moderation"}
          </Button>
        </form>
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
