import { Item, UserProfile } from "../types"
import { Button } from "../components/common/Button"
import { SectionHead } from "../components/common/SectionHead"
import { ResourceCard } from "../components/cards/ResourceCard"
import { Icon } from "../components/common/Icon"

export function ProfileView({
  user,
  mine,
  savedCount,
  collectionsCount,
  followingCount,
  followedSubjects,
  onEditProfile,
  saved,
  selectedId,
  onOpenResource,
  onToggleSave,
}: {
  user: UserProfile
  mine: Item[]
  savedCount: number
  collectionsCount: number
  followingCount: number
  followedSubjects: string[]
  onEditProfile: () => void
  saved: number[]
  selectedId: number
  onOpenResource: (id: number) => void
  onToggleSave: (id: number) => void
}) {
  const isModerator = user.role === "moderator"
  const initials = user.avatarInitials || user.name.slice(0, 2).toUpperCase()
  const approvedMine = mine.filter((item) => item.status === "approved")

  return (
    <>
      <div className="profile-hero">
        <span className="avatar big">{initials}</span>
        <div>
          <h2>{user.name}</h2>
          <p>
            {isModerator ? "Community Moderator" : "Learner & Contributor"} ·
            Active Member
          </p>
          <div className="tag-row">
            {followedSubjects.length > 0 ? (
              followedSubjects.map((s) => <span key={s}>{s}</span>)
            ) : (
              <span className="muted" style={{ fontStyle: "italic" }}>
                No subjects followed yet
              </span>
            )}
          </div>
        </div>
        <Button
          className="secondary-button"
          icon="settings"
          onClick={onEditProfile}
        >
          Edit profile
        </Button>
      </div>

      <div className="stat-row">
        <span>
          <strong>{mine.length}</strong>
          <small>Shared</small>
        </span>
        <span>
          <strong>{savedCount}</strong>
          <small>Saved</small>
        </span>
        <span>
          <strong>{collectionsCount}</strong>
          <small>Collections</small>
        </span>
        <span>
          <strong>{followingCount}</strong>
          <small>Following</small>
        </span>
      </div>

      <SectionHead title="Shared by you" />
      {approvedMine.length ? (
        <div className="resource-grid">
          {approvedMine.map((resource) => (
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
            <Icon name="upload" size={28} />
          </span>
          <h2>No contributions published yet</h2>
          <p>
            Share your lecture notes, cheat sheets, or curated reading lists to
            help learners and build your contributor profile.
          </p>
        </div>
      )}
    </>
  )
}
export default ProfileView
