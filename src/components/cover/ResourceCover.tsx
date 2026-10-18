import { Resource } from "../../types"

export function ResourceCover({
  resource,
  compact = false,
}: {
  resource: Resource
  compact?: boolean
}) {
  return (
    <div
      className={`resource-cover ${resource.color} ${compact ? "compact" : ""}`}
    >
      <div className="cover-top">
        <span className="cover-type">{resource.type}</span>
        <span className="cover-format">{resource.format}</span>
      </div>
      <span className="cover-initial">{resource.subject.slice(0, 1)}</span>
      <strong>{resource.title}</strong>
      <small>
        {resource.pages} pages · v{resource.versions}
      </small>
    </div>
  )
}
export default ResourceCover
