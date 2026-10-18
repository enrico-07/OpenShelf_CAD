import { Feedback } from "../../types"
import Avatar from "../common/Avatar"
import Stars from "../common/Stars"
import Icon from "../common/Icon"

export type FeedbackCardProps = {
  entry: Feedback & {
    resource?: {
      id: number
      title: string
    }
  }
  onOpenResource?: (id: number) => void
}

export function FeedbackCard({ entry, onOpenResource }: FeedbackCardProps) {
  return (
    <article className="feedback-card">
      <Avatar initials={entry.initials} />
      <div>
        <div className="feedback-meta">
          <strong>{entry.author}</strong>
          <Stars value={entry.rating} size={13} />
          <small>{entry.when}</small>
        </div>
        <p>{entry.text}</p>
        {entry.resource && onOpenResource && (
          <button
            className="text-button"
            onClick={() => onOpenResource(entry.resource!.id)}
            type="button"
          >
            on {entry.resource.title} <Icon name="arrow" size={14} />
          </button>
        )}
      </div>
    </article>
  )
}
export default FeedbackCard
