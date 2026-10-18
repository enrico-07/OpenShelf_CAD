import { IconName } from "../../types"
import Icon from "../common/Icon"

export function NavItem({
  active,
  icon,
  label,
  onClick,
  count,
}: {
  active?: boolean
  icon: IconName
  label: string
  onClick: () => void
  count?: number
}) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <Icon name={icon} />
      <span>{label}</span>
      {count !== undefined && <b>{count}</b>}
    </button>
  )
}
export default NavItem
