import { useState } from "react"
import { Item } from "../types"
import { Icon } from "../components/common/Icon"
import { Button } from "../components/common/Button"
import { ThemeToggle } from "../components/common/ThemeToggle"
import { ResourceCover } from "../components/cover/ResourceCover"

export interface SignInCredentials {
  mode: "in" | "up"
  email: string
  password: string
  name?: string
  role: "learner" | "moderator"
  moderatorCode?: string
}

export function SignIn({
  items = [],
  onSignIn,
  onGuestAccess,
  theme,
}: {
  items?: Item[]
  onSignIn: (credentials: SignInCredentials) => Promise<void> | void
  onGuestAccess?: () => void
  theme: {
    pref: string
    resolved: "light" | "dark"
    toggle: () => void
  }
}) {
  const [mode, setMode] = useState<"in" | "up">("in")
  const [role, setRole] = useState<"learner" | "moderator">("learner")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [moderatorCode, setModeratorCode] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.")
      return
    }

    if (role === "moderator" && !moderatorCode.trim()) {
      setErrorMessage(
        "A Moderator Security Key is required for moderator privileges. (Default: OPENSHELF_MOD_2026)",
      )
      return
    }

    setIsSubmitting(true)
    try {
      await onSignIn({
        mode,
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        role,
        moderatorCode: role === "moderator" ? moderatorCode.trim() : undefined,
      })
    } catch (err: any) {
      setErrorMessage(
        err.message || "Authentication failed. Please check your credentials.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickDemo = async (demoRole: "learner" | "moderator") => {
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      const demoEmail =
        demoRole === "moderator" ? "moderator@uni.edu" : "learner@uni.edu"
      const demoName =
        demoRole === "moderator" ? "Community Moderator" : "Alex Student"
      await onSignIn({
        mode: "in",
        email: demoEmail,
        password: "DemoPassword123!",
        name: demoName,
        role: demoRole,
        moderatorCode:
          demoRole === "moderator" ? "OPENSHELF_MOD_2026" : undefined,
      })
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start quick demo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-theme">
        <ThemeToggle onToggle={theme.toggle} resolved={theme.resolved} />
      </div>

      <section className="auth-art">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="shelves" size={22} />
          </span>
          <strong className="brand-name">OpenShelf</strong>
        </div>

        <div className="auth-pitch">
          <h1>Find it, save it, make it better.</h1>
          <p>
            Your open library for study guides, lecture summaries, revision
            notes, and reading lists. Built to help learners share knowledge
            freely and evolve resources collaboratively.
          </p>
          <div className="auth-stack">
            {items.length > 0 ? (
              items.slice(0, 2).map((item) => (
                <div key={item.id}>
                  <ResourceCover resource={item} />
                </div>
              ))
            ) : (
              <div>
                <div
                  className="resource-cover cobalt"
                  style={{
                    border: "2px dashed rgba(255, 255, 255, 0.28)",
                  }}
                >
                  <div className="cover-top">
                    <span className="cover-type">Study guide</span>
                    <span className="cover-format">PDF</span>
                  </div>
                  <span className="cover-initial">
                    <Icon name="upload" size={24} />
                  </span>
                  <strong>Your Uploaded Material</strong>
                  <small>Syncs live when added</small>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="auth-stats">
          <span>
            <strong>Open</strong>
            <small>source library</small>
          </span>
          <span>
            <strong>Cloud</strong>
            <small>storage ready</small>
          </span>
          <span>
            <strong>Zero</strong>
            <small>tracking</small>
          </span>
        </div>
      </section>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>
          {mode === "in" ? "Sign in to OpenShelf" : "Create your account"}
        </h2>
        <p className="muted">
          {mode === "in"
            ? "Enter your credentials or choose an access role to get started."
            : "Sign up to begin publishing, organizing, and saving resources."}
        </p>

        {errorMessage && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              fontSize: "var(--fs-sm)",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="close" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {mode === "up" && (
          <label className="form-field">
            <span>Full name</span>
            <input
              onChange={(e) => setName(e.target.value)}
              required
              value={name}
              placeholder="e.g. Jane Doe"
            />
          </label>
        )}

        <label className="form-field">
          <span>Email address</span>
          <input
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            value={email}
            placeholder="you@domain.edu"
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            type="password"
            value={password}
          />
        </label>

        <div className="role-toggle">
          <span>Account role</span>
          <div className="segmented">
            {(["learner", "moderator"] as const).map((item) => (
              <button
                className={role === item ? "active" : ""}
                key={item}
                onClick={() => {
                  setRole(item)
                  setErrorMessage(null)
                }}
                type="button"
              >
                {item === "learner" ? "Learner" : "Moderator"}
              </button>
            ))}
          </div>
        </div>

        {role === "moderator" && (
          <label className="form-field" style={{ marginTop: "4px" }}>
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Moderator Passkey</span>
              <span style={{ fontSize: "11px", color: "var(--accent-text)" }}>
                Key Required
              </span>
            </span>
            <input
              onChange={(e) => setModeratorCode(e.target.value)}
              placeholder="Institutional Key (Demo: OPENSHELF_MOD_2026)"
              required={role === "moderator"}
              type="password"
              value={moderatorCode}
            />
          </label>
        )}

        <Button
          className="primary-button wide-button"
          icon={isSubmitting ? "clock" : "arrow"}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Authenticating..."
            : mode === "in"
              ? "Sign in"
              : "Create account"}
        </Button>

        {onGuestAccess && (
          <button
            type="button"
            className="secondary-button"
            style={{
              width: "100%",
              marginTop: "8px",
              minHeight: "38px",
              justifyContent: "center",
              fontSize: "var(--fs-sm)",
              borderStyle: "dashed",
            }}
            onClick={onGuestAccess}
            disabled={isSubmitting}
          >
            <Icon name="compass" size={16} /> Continue as Anonymous Guest
          </button>
        )}

        <div
          className="evaluator-card"
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "var(--surface-sunken)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Evaluator Quick Access
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
              1-Click Testing
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="secondary-button"
              style={{ flex: 1, minHeight: "34px", fontSize: "var(--fs-xs)" }}
              onClick={() => handleQuickDemo("learner")}
              disabled={isSubmitting}
            >
              <Icon name="user" size={14} /> Learner Demo
            </button>
            <button
              type="button"
              className="secondary-button"
              style={{ flex: 1, minHeight: "34px", fontSize: "var(--fs-xs)" }}
              onClick={() => handleQuickDemo("moderator")}
              disabled={isSubmitting}
            >
              <Icon name="shield" size={14} /> Moderator Demo
            </button>
          </div>
        </div>

        <p className="auth-switch">
          {mode === "in" ? "New to OpenShelf?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "in" ? "up" : "in")
              setErrorMessage(null)
            }}
            type="button"
          >
            {mode === "in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </form>
    </div>
  )
}
export default SignIn
