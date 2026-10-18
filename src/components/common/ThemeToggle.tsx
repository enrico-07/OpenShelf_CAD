import Icon from "./Icon"

export function ThemeToggle({
  resolved,
  onToggle,
}: {
  resolved: "light" | "dark"
  onToggle: () => void
}) {
  const label =
    resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"
  return (
    <button
      aria-label={label}
      className="icon-button theme-toggle"
      onClick={onToggle}
      title={label}
      type="button"
    >
      <Icon name={resolved === "dark" ? "sun" : "moon"} />
    </button>
  )
}
export default ThemeToggle
