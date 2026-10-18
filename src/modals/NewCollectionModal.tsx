import { FormEvent, useState } from "react"
import { Item } from "../types"
import { Modal } from "../components/common/Modal"
import { Button } from "../components/common/Button"

export function NewCollectionModal({
  selected,
  onClose,
  onCreateCollection,
}: {
  selected?: Item
  onClose: () => void
  onCreateCollection: (name: string, description: string) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreateCollection(name.trim(), description.trim())
  }

  return (
    <Modal kicker="Collections" onClose={onClose} title="New collection">
      <form onSubmit={handleSubmit}>
        <div className="upload-body">
          <label className="form-field">
            <span>Name</span>
            <input
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CS201 final exam"
              required
              value={name}
            />
          </label>
          <label className="form-field">
            <span>Description</span>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this collection covers"
              rows={3}
              value={description}
            />
          </label>
          {selected && (
            <p className="muted">“{selected.title}” will be added first.</p>
          )}
        </div>
        <div className="modal-footer">
          <Button className="secondary-button" onClick={onClose}>
            Cancel
          </Button>
          <Button className="primary-button" icon="check" type="submit">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default NewCollectionModal
