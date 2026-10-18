import { Note } from "../types"
import { SectionHead } from "../components/common/SectionHead"
import { Icon } from "../components/common/Icon"

export function NotificationsView({
  notes,
  unreadCount,
  onMarkAllRead,
  onReadNote,
}: {
  notes: Note[]
  unreadCount: number
  onMarkAllRead: () => void
  onReadNote: (id: number) => void
}) {
  return (
    <div className="table-card">
      <SectionHead
        action={
          <button className="text-button" onClick={onMarkAllRead} type="button">
            Mark all read
          </button>
        }
        meta={`${unreadCount} unread`}
        title="All updates"
      />
      {notes.length > 0 ? (
        notes.map((note) => (
          <button
            className={`notification wide ${note.read ? "" : "unread"}`}
            key={note.id}
            onClick={() => onReadNote(note.id)}
            type="button"
          >
            <span className={`notification-icon ${note.tone}`}>
              <Icon name={note.icon} size={17} />
            </span>
            <div>
              <strong>{note.title}</strong>
              <p>{note.body}</p>
              <small>{note.when}</small>
            </div>
          </button>
        ))
      ) : (
        <div
          className="empty-state"
          style={{ margin: "24px 0", border: "none" }}
        >
          <span>
            <Icon name="bell" size={28} />
          </span>
          <h2>All caught up</h2>
          <p>
            You have no new notifications. When you follow resources or
            subjects, updates will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
export default NotificationsView
