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
  onSignOut: () => void
}) {
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
        <div className="row-actions">
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
