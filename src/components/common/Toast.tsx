import Icon from "./Icon"

export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="toast">
      <span>
        <Icon name="check" size={16} />
      </span>
      {message}
    </div>
  )
}
export default Toast
