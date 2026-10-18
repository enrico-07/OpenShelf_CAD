import { ReactNode } from "react"
import Icon from "./Icon"

export function Modal({
  title,
  kicker,
  onClose,
  children,
  wide,
  extraWide,
  className,
}: {
  title: string
  kicker: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  extraWide?: boolean
  className?: string
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`upload-modal ${wide ? "wide" : ""} ${
          extraWide ? "extra-wide" : ""
        } ${className || ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">{kicker}</span>
            <h2>{title}</h2>
          </div>
          <button onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
export default Modal
