import { UserProfile } from "../../types"
import Icon from "../common/Icon"
import Button from "../common/Button"
import Avatar from "../common/Avatar"
import NavItem from "./NavItem"

export function Sidebar({
  user,
  activeView,
  onSelectView,
  showMobileNav,
  onCloseMobileNav,
  savedCount,
  collectionsCount,
  unreadCount,
  queueCount,
  onStartUpload,
}: {
  user: UserProfile
  activeView: string
  onSelectView: (view: string) => void
  showMobileNav: boolean
  onCloseMobileNav: () => void
  savedCount: number
  collectionsCount: number
  unreadCount: number
  queueCount: number
  onStartUpload: () => void
}) {
  const isModerator = user.role === "moderator"
  const initials = user.avatarInitials || user.name.slice(0, 2).toUpperCase()

  return (
    <aside className={`sidebar ${showMobileNav ? "mobile-open" : ""}`}>
      <div className="brand">
        <span className="brand-mark">
          <Icon name="shelves" size={22} />
        </span>
        <strong className="brand-name">OpenShelf</strong>
        <button
          aria-label="Close menu"
          className="close-mobile"
          onClick={onCloseMobileNav}
          type="button"
        >
          <Icon name="close" />
        </button>
      </div>

      <button
        className="sidebar-user"
        onClick={() => onSelectView("Profile")}
        type="button"
      >
        <Avatar initials={initials} />
        <div>
          <strong>{user.name}</strong>
          <span>{isModerator ? "Moderator" : "Learner"}</span>
        </div>
        <Icon name="chevron" size={15} />
      </button>

      <nav className="nav-group">
        <small>EXPLORE</small>
        <NavItem
          active={activeView === "Discover"}
          icon="compass"
          label="Discover"
          onClick={() => onSelectView("Discover")}
        />
        <NavItem
          active={activeView === "Browse subjects"}
          icon="layers"
          label="Browse subjects"
          onClick={() => onSelectView("Browse subjects")}
        />
        <NavItem
          active={activeView === "My Library"}
          count={savedCount}
          icon="bookmark"
          label="My Library"
          onClick={() => onSelectView("My Library")}
        />
        <NavItem
          active={activeView === "Collections"}
          count={collectionsCount}
          icon="collection"
          label="Collections"
          onClick={() => onSelectView("Collections")}
        />
      </nav>

      <nav className="nav-group">
        <small>CONTRIBUTE</small>
        <NavItem
          active={activeView === "My Contributions"}
          icon="archive"
          label="My contributions"
          onClick={() => onSelectView("My Contributions")}
        />
        <NavItem
          active={activeView === "Community"}
          icon="message"
          label="Community"
          onClick={() => onSelectView("Community")}
        />
        <NavItem
          active={activeView === "Notifications"}
          count={unreadCount || undefined}
          icon="bell"
          label="Notifications"
          onClick={() => onSelectView("Notifications")}
        />
      </nav>

      {isModerator && (
        <nav className="nav-group">
          <small>MANAGE</small>
          <NavItem
            active={activeView === "Moderation"}
            count={queueCount}
            icon="shield"
            label="Moderation"
            onClick={() => onSelectView("Moderation")}
          />
          <NavItem
            active={activeView === "Insights"}
            icon="chart"
            label="Platform health"
            onClick={() => onSelectView("Insights")}
          />
        </nav>
      )}

      <div className="sidebar-bottom">
        <Button className="share-button" icon="plus" onClick={onStartUpload}>
          Share a resource
        </Button>
        <NavItem
          active={activeView === "Settings"}
          icon="settings"
          label="Settings"
          onClick={() => onSelectView("Settings")}
        />
      </div>
    </aside>
  )
}
export default Sidebar
