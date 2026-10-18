import { ReactNode } from "react"
import { IconName } from "../../types"
import Icon from "./Icon"

export function Button({
  children,
  className = "",
  icon,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode
  className?: string
  icon?: IconName
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}) {
  return (
    <button
      className={`button ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}
export default Button
