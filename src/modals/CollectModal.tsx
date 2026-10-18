import { Collection, Item } from "../types"
import { Modal } from "../components/common/Modal"
import { Button } from "../components/common/Button"
import { Icon } from "../components/common/Icon"

export function CollectModal({
  selected,
  collections,
  onClose,
  onToggleCollectionResource,
  onOpenNewCollection,
}: {
  selected: Item
  collections: Collection[]
  onClose: () => void
  onToggleCollectionResource: (collectionId: number, resourceId: number) => void
  onOpenNewCollection: () => void
}) {
  return (
    <Modal kicker={selected.title} onClose={onClose} title="Add to collection">
      <div className="upload-body">
        {collections.map((c) => {
          const on = c.ids.includes(selected.id)
          return (
            <button
              className={`radio-row ${on ? "on" : ""}`}
              key={c.id}
              onClick={() => onToggleCollectionResource(c.id, selected.id)}
              type="button"
            >
              <Icon name={on ? "check" : "folder"} size={17} />{" "}
              <span>
                {c.name}
                <small>{c.ids.length} resources</small>
              </span>
            </button>
          )
        })}
        <button
          className="text-button"
          onClick={onOpenNewCollection}
          type="button"
        >
          <Icon name="plus" size={15} /> Create a new collection
        </button>
      </div>
      <div className="modal-footer">
        <span />
        <Button className="primary-button" icon="check" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  )
}
export default CollectModal
