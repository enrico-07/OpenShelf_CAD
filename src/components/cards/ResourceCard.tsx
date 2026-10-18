import { Resource } from "../../types"
import ResourceCover from "../cover/ResourceCover"
import Avatar from "../common/Avatar"
import Icon from "../common/Icon"

export function ResourceCard({
  resource,
  selected,
  saved,
  onOpen,
  onSave,
}: {
  resource: Resource
  selected: boolean
  saved: boolean
  onOpen: () => void
  onSave: () => void
}) {
  return (
    <article className={`resource-card ${selected ? "selected" : ""}`}>
      <button className="card-open" onClick={onOpen} type="button">
        <ResourceCover resource={resource} />
      </button>
      <div className="card-copy">
        <div className="card-label-row">
          <span className="eyebrow">{resource.subject}</span>
          <button
            aria-label={saved ? "Remove from library" : "Save to library"}
            className={`save-button ${saved ? "saved" : ""}`}
            onClick={onSave}
            type="button"
          >
            <Icon filled={saved} name="bookmark" size={17} />
          </button>
        </div>
        <button className="title-link" onClick={onOpen} type="button">
          {resource.title}
        </button>
        <div className="author-row">
          <Avatar initials={resource.initials} />
          <span>{resource.author}</span>
          <span className="dot" />
          <span>{resource.updated}</span>
        </div>
        <div className="card-footer">
          <span>
            <Icon filled name="star" size={15} /> {resource.rating}
          </span>
          <span>{resource.saves.toLocaleString()} saves</span>
        </div>
      </div>
    </article>
  )
}
export default ResourceCard
