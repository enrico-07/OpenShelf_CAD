import { useState } from "react"
import { UserProfile, NotificationPreferences, ThemePref } from "../types"
import { SectionHead } from "../components/common/SectionHead"
import { Button } from "../components/common/Button"
import { Icon } from "../components/common/Icon"
import { licenses } from "../data/seedData"

export function SettingsView({
  theme,
  prefs,
  onTogglePref,
  user,
  onUpdateUserName,
  onSaveSettings,
  onUpgradeToModerator,
  onSignOut,
}: {
  theme: {
    pref: ThemePref
    resolved: "light" | "dark"
    setPref: (p: ThemePref) => void
  }
  prefs: NotificationPreferences
  onTogglePref: (key: keyof NotificationPreferences) => void
  user: UserProfile
  onUpdateUserName: (name: string) => void
  onSaveSettings: () => void
  onUpgradeToModerator?: (passkey: string) => Promise<boolean>
  onSignOut: () => void
}) {
  const [passkey, setPasskey] = useState("")
  const [passkeyMsg, setPasskeyMsg] = useState<{
    type: "error" | "success"
    text: string
  } | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passkey.trim() || !onUpgradeToModerator) return
    setIsUpgrading(true)
    setPasskeyMsg(null)
    const success = await onUpgradeToModerator(passkey.trim())
    setIsUpgrading(false)
    if (success) {
      setPasskeyMsg({
        type: "success",
        text: "Successfully upgraded to Community Moderator!",
      })
      setPasskey("")
    } else {
      setPasskeyMsg({
        type: "error",
        text: "Invalid Moderator Security Key. Access denied.",
      })
    }
  }

  return (
    <div className="settings">
      <section className="table-card settings-wide">
        <SectionHead title="Theme" />
        <div className="theme-options">
          {([
            ["light", "sun", "Light", "Light content, dark sidebar"],
            ["dark", "moon", "Dark", "Dark throughout"],
            ["system", "monitor", "System", "Follows your device"],
          ] as const).map(([value, icon, label, sub]) => (
            <button
              aria-pressed={theme.pref === value}
              className={`theme-option ${value} ${
                theme.pref === value ? "active" : ""
              }`}
              key={value}
              onClick={() => theme.setPref(value)}
              type="button"
            >
              <span className="theme-preview">
                <i />
                <i />
                <i />
              </span>
              <span className="theme-option-copy">
                <Icon name={icon} size={16} />
                <strong>{label}</strong>
              </span>
              <small>{sub}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="table-card">
        <SectionHead title="Email notifications" />
        {([
          [
            "email",
            "Updates to resources I follow",
            "New versions and important changes",
          ],
          [
            "digest",
            "Weekly digest",
            "A Monday summary of new resources in your subjects",
          ],
          [
            "moderation",
            "Moderation outcomes",
            "When your submissions are approved or rejected",
          ],
          [
            "feedback",
            "Feedback on my resources",
            "Ratings and comments from learners",
          ],
        ] as const).map(([key, title, sub]) => (
          <label className="switch-row" key={key}>
            <span>
              <strong>{title}</strong>
              <small>{sub}</small>
            </span>
            <input
              checked={prefs[(key as keyof NotificationPreferences)]}
              onChange={() =>
                onTogglePref(key as keyof NotificationPreferences)
              }
              type="checkbox"
            />
            <i />
          </label>
        ))}
      </section>

      <section className="table-card">
        <SectionHead title="Profile & security" />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
            padding: "10px 14px",
            background: "var(--surface-sunken)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
          }}
        >
          <Icon
            name={
              user.role === "moderator"
                ? "shield"
                : user.role === "guest"
                  ? "compass"
                  : "user"
            }
            size={20}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
              {user.email || "No email assigned"}
            </div>
            <div
              style={{
                fontSize: "var(--fs-xs)",
                color: "var(--text-3)",
                textTransform: "capitalize",
              }}
            >
              Active Role:{" "}
              <strong
                style={{
                  color:
                    user.role === "moderator"
                      ? "var(--accent-text)"
                      : "inherit",
                }}
              >
                {user.role === "moderator"
                  ? "Community Moderator"
                  : user.role === "guest"
                    ? "Anonymous Guest (Read-Only)"
                    : "Learner & Contributor"}
              </strong>
            </div>
          </div>
        </div>

        {user.role === "guest" && (
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--fs-xs)",
              color: "var(--text-2)",
              marginBottom: "16px",
            }}
          >
            You are browsing in guest mode. Sign out and create an account to
            unlock permanent cloud storage and resource publishing.
          </div>
        )}

        <label className="form-field">
          <span>Display name</span>
          <input
            onChange={(e) => onUpdateUserName(e.target.value)}
            value={user.name}
          />
        </label>

        <label className="form-field">
          <span>Default license for uploads</span>
          <select defaultValue={licenses[0]}>
            {licenses.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>

        {user.role !== "moderator" && onUpgradeToModerator && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px",
              background: "var(--surface-sunken)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <Icon name="shield" size={16} />
              <strong style={{ fontSize: "var(--fs-sm)" }}>
                Institutional Moderator Authorization
              </strong>
            </div>
            <p
              style={{
                fontSize: "var(--fs-xs)",
                color: "var(--text-2)",
                margin: "0 0 10px",
              }}
            >
              Have an institutional moderation key? Enter it below to unlock the
              community review queue.
            </p>

            {passkeyMsg && (
              <div
                style={{
                  color: passkeyMsg.type === "success" ? "#22c55e" : "#ef4444",
                  fontSize: "var(--fs-xs)",
                  marginBottom: "8px",
                }}
              >
                {passkeyMsg.text}
              </div>
            )}

            <form
              onSubmit={handleUpgrade}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="password"
                placeholder="Moderator Key (Demo: OPENSHELF_MOD_2026)"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  fontSize: "var(--fs-xs)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "var(--surface-color)",
                  color: "var(--text-color)",
                }}
              />
              <Button
                className="secondary-button"
                icon={isUpgrading ? "clock" : "shield"}
                type="submit"
                disabled={isUpgrading || !passkey.trim()}
              >
                {isUpgrading ? "Verifying..." : "Upgrade"}
              </Button>
            </form>
          </div>
        )}

        <div className="row-actions" style={{ marginTop: "20px" }}>
          <Button className="secondary-button" onClick={onSaveSettings}>
            Save changes
          </Button>
          <Button className="reject-button" icon="logout" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </section>
    </div>
  )
}
export default SettingsView
