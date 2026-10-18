import { Item } from "../types"
import { ResourceCard } from "../components/cards/ResourceCard"
import { Icon } from "../components/common/Icon"
import { Button } from "../components/common/Button"
import { SectionHead } from "../components/common/SectionHead"

export function LibraryView({
  savedResources,
  saved,
  selectedId,
  onOpenResource,
  onToggleSave,
  onBrowseMore,
}: {
  savedResources: Item[]
  saved: number[]
  selectedId: number
  onOpenResource: (id: number) => void
  onToggleSave: (id: number) => void
  onBrowseMore: () => void
}) {
  return (
    <>
      <SectionHead
        meta={`${savedResources.length} saved resources`}
        title="Your saved materials"
      />

      {savedResources.length ? (
        <div className="resource-grid">
          {savedResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              onOpen={() => onOpenResource(resource.id)}
              onSave={() => onToggleSave(resource.id)}
              resource={resource}
              saved={saved.includes(resource.id)}
              selected={selectedId === resource.id}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>
            <Icon name="bookmark" size={28} />
          </span>
          <h2>Your library is empty</h2>
          <p>
            Bookmark resources while exploring so you can easily reference them
            later.
          </p>
          <Button className="primary-button" onClick={onBrowseMore}>
            Explore resources
          </Button>
        </div>
      )}
    </>
  )
}
export default LibraryView
