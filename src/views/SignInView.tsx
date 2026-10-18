import { useState } from "react"
import { Icon } from "../components/common/Icon"
import { Button } from "../components/common/Button"
import { ThemeToggle } from "../components/common/ThemeToggle"

export function SignIn({
  onSignIn,
  theme,
}: {
  onSignIn: (name: string, role: "learner" | "moderator") => void
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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      onSignIn(
        name.trim() || (role === "moderator" ? "Moderator" : "New Learner"),
        role,
      )
    }, 400)
  }

  const handleQuickDemo = (demoRole: "learner" | "moderator") => {
    setIsSubmitting(true)
    const demoName = demoRole === "moderator" ? "Moderator" : "Learner"
    setTimeout(() => {
      onSignIn(demoName, demoRole)
    }, 300)
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
            <div
              className="auth-pitch-card"
              style={{
                background: "var(--ink-surface)",
                border: "1px solid var(--ink-border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                color: "var(--ink-text)",
                boxShadow: "var(--shadow-md)",
                maxWidth: "340px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                  color: "var(--accent-text)",
                }}
              >
                <Icon name="upload" size={18} />
                <strong style={{ fontSize: "var(--fs-sm)" }}>
                  Start Your Library
                </strong>
              </div>
              <p
                style={{
                  fontSize: "var(--fs-sm)",
                  color: "var(--ink-text-2)",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Upload notes, create custom collections, browse subjects, or
                join as a community moderator.
              </p>
            </div>
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
            placeholder="••••••••"
            required
            type="password"
          />
        </label>

        <div className="role-toggle">
          <span>Account role</span>
          <div className="segmented">
            {(["learner", "moderator"] as const).map((item) => (
              <button
                className={role === item ? "active" : ""}
                key={item}
                onClick={() => setRole(item)}
                type="button"
              >
                {item === "learner" ? "Learner" : "Moderator"}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="primary-button wide-button"
          icon={isSubmitting ? "clock" : "arrow"}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Signing in..."
            : mode === "in"
              ? "Sign in"
              : "Create account"}
        </Button>

        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            type="button"
            className="secondary-button"
            style={{ flex: 1, minHeight: "36px", fontSize: "var(--fs-sm)" }}
            onClick={() => handleQuickDemo("learner")}
            disabled={isSubmitting}
          >
            <Icon name="user" size={15} /> Learner Access
          </button>
          <button
            type="button"
            className="secondary-button"
            style={{ flex: 1, minHeight: "36px", fontSize: "var(--fs-sm)" }}
            onClick={() => handleQuickDemo("moderator")}
            disabled={isSubmitting}
          >
            <Icon name="shield" size={15} /> Moderator Access
          </button>
        </div>

        <p className="auth-switch">
          {mode === "in" ? "New to OpenShelf?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "in" ? "up" : "in")}
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
