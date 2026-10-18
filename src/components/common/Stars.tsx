import Icon from "./Icon"

export function Stars({
  value,
  onRate,
  size = 15,
}: {
  value: number
  onRate?: (n: number) => void
  size?: number
}) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          aria-label={`${n} stars`}
          className={n <= Math.round(value) ? "on" : ""}
          disabled={!onRate}
          key={n}
          onClick={() => onRate?.(n)}
          type="button"
        >
          <Icon filled={n <= Math.round(value)} name="star" size={size} />
        </button>
      ))}
    </span>
  )
}
export default Stars
