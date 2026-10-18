import { Item, Collection } from "../types"
import { ResourceCover } from "../components/cover/ResourceCover"
import { ResourceCard } from "../components/cards/ResourceCard"
import { Icon } from "../components/common/Icon"
import { Button } from "../components/common/Button"
import { SectionHead } from "../components/common/SectionHead"

export function CollectionsView({
  collections,
  items,
  openCollection,
  onOpenCollection,
  onCloseCollection,
  onDeleteCollection,
  onStartNewCollection,
  saved,
  selectedId,
  onOpenResource,
  onToggleSave,
}: {
  collections: Collection[]
  items: Item[]
  openCollection: number | null
  onOpenCollection: (id: number) => void
  onCloseCollection: () => void
  onDeleteCollection: (id: number) => void
  onStartNewCollection: () => void
  saved: number[]
  selectedId: number
  onOpenResource: (id: number) => void
  onToggleSave: (id: number) => void
}) {
  const current = collections.find((c) => c.id === openCollection)

  if (current) {
    const collectionItems = items.filter((item) =>
      current.ids.includes(item.id),
    )

    return (
      <>
        <button className="back-link" onClick={onCloseCollection} type="button">
          <Icon name="chevron_left" size={16} /> All collections
        </button>

        <SectionHead
          action={
            <Button
              className="secondary-button"
              icon="close"
              onClick={() => onDeleteCollection(current.id)}
            >
              Delete
            </Button>
          }
          meta={`${current.ids.length} resources`}
          title={current.name}
        />
        <p className="muted lead">{current.description}</p>

        {collectionItems.length ? (
          <div className="resource-grid">
            {collectionItems.map((resource) => (
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
              <Icon name="folder" size={28} />
            </span>
            <h2>No resources in this collection</h2>
            <p>
              Add resources by opening a resource and clicking the collection
              icon.
            </p>
          </div>
        )}
      </>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="empty-state">
        <span>
          <Icon name="folder" size={28} />
        </span>
        <h2>No collections yet</h2>
        <p>
          Organize resources into thematic bundles for courses, study groups, or
          personal revision.
        </p>
        <Button
          className="primary-button"
          icon="plus"
          onClick={onStartNewCollection}
        >
          Create your first collection
        </Button>
      </div>
    )
  }

  return (
    <div className="collection-grid">
      {collections.map((c) => {
        const covers = items
          .filter((item) => c.ids.includes(item.id))
          .slice(0, 3)
        return (
          <button
            className="collection-card"
            key={c.id}
            onClick={() => onOpenCollection(c.id)}
            type="button"
          >
            <div className="collection-stack">
              {covers.length ? (
                covers.map((item) => (
                  <ResourceCover compact key={item.id} resource={item} />
                ))
              ) : (
                <span className="collection-empty">
                  <Icon name="folder" size={28} />
                </span>
              )}
            </div>
            <strong>{c.name}</strong>
            <small>
              {c.ids.length} resources · {c.description}
            </small>
          </button>
        )
      })}
      <button
        className="collection-card new"
        onClick={onStartNewCollection}
        type="button"
      >
        <span>
          <Icon name="plus" size={26} />
        </span>
        <strong>New collection</strong>
        <small>For a course, topic or project</small>
      </button>
    </div>
  )
}
export default CollectionsView
