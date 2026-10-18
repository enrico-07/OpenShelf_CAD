import { RefObject, useState } from "react"
import { UserProfile } from "../../types"
import Icon from "../common/Icon"
import Button from "../common/Button"
import Avatar from "../common/Avatar"
import ThemeToggle from "../common/ThemeToggle"

export function Topbar({
  query,
  onQueryChange,
  onClearQuery,
  searchRef,
  onOpenMobileNav,
  theme,
  showNotifications,
  onToggleNotifications,
  unreadCount,
  onStartUpload,
  onSelectSuggestion,
  user,
  onSelectView,
  onSignOut,
  detailOpen,
  onToggleDetail,
}: {
  query: string
  onQueryChange: (val: string) => void
  onClearQuery: () => void
  searchRef: RefObject<HTMLInputElement | null>
  onOpenMobileNav: () => void
  theme: {
    resolved: "light" | "dark"
    toggle: () => void
  }
  showNotifications: boolean
  onToggleNotifications: () => void
  unreadCount: number
  onStartUpload: () => void
  onSelectSuggestion?: (text: string) => void
  user?: UserProfile | null
  onSelectView?: (view: string) => void
  onSignOut?: () => void
  detailOpen?: boolean
  onToggleDetail?: () => void
}) {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const quickSuggestions = [
    { label: "Data Structures", type: "Topic", icon: "code" as const },
    { label: "Organic Chemistry", type: "Subject", icon: "science" as const },
    { label: "Calculus II", type: "Topic", icon: "calculate" as const },
    { label: "Exam prep", type: "Tag", icon: "bookmark" as const },
    { label: "Beginner", type: "Level", icon: "school" as const },
  ]

  const filteredSuggestions = query.trim()
    ? quickSuggestions.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()),
      )
    : quickSuggestions

  return (
    <header className="topbar">
      <button
        aria-label="Open menu"
        className="icon-button menu-button"
        onClick={onOpenMobileNav}
        type="button"
      >
        <Icon name="menu" />
      </button>

      <div className="search-field-container">
        <label className="search-field">
          <Icon name="search" size={20} />
          <input
            aria-label="Search resources"
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search guides, notes, subjects, tags... (⌘K)"
            ref={searchRef}
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="clear-search"
              onClick={onClearQuery}
              type="button"
            >
              <Icon name="close" size={14} />
            </button>
          ) : (
            <kbd>⌘K</kbd>
          )}
        </label>

        {showSearchDropdown && (
          <div className="search-dropdown-menu">
            <div className="dropdown-heading">
              <span>{query ? "Matching suggestions" : "Popular searches"}</span>
            </div>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((item) => (
                <button
                  className="search-suggestion-item"
                  key={item.label}
                  onClick={() => {
                    onQueryChange(item.label)
                    onSelectSuggestion?.(item.label)
                    setShowSearchDropdown(false)
                  }}
                  type="button"
                >
                  <Icon name={item.icon} size={15} />
                  <span className="suggestion-label">{item.label}</span>
                  <small className="suggestion-type">{item.type}</small>
                </button>
              ))
            ) : (
              <div className="search-no-match">
                Press Enter to search for &quot;{query}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      <div className="top-actions" style={{ position: "relative" }}>
        <ThemeToggle onToggle={theme.toggle} resolved={theme.resolved} />
        <button
          aria-label="Open notifications"
          className={`icon-button ${showNotifications ? "active" : ""}`}
          onClick={onToggleNotifications}
          type="button"
        >
          <Icon name="bell" />
          {unreadCount > 0 && <i className="badge-dot" />}
        </button>
        {onToggleDetail && (
          <button
            aria-label={
              detailOpen ? "Hide preview sidebar" : "Show preview sidebar"
            }
            className={`icon-button ${detailOpen ? "active" : ""}`}
            onClick={onToggleDetail}
            title={detailOpen ? "Hide preview sidebar" : "Show preview sidebar"}
            type="button"
          >
            <Icon name="monitor" size={17} />
          </button>
        )}
        <Button
          className="primary-button top-upload"
          icon="upload"
          onClick={onStartUpload}
        >
          Share resource
        </Button>

        {user && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="topbar-user-badge"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-label="User menu"
            >
              <Avatar
                initials={
                  user.avatarInitials || user.name.slice(0, 2).toUpperCase()
                }
              />
              <span className="hidden sm:inline">
                {user.name.split(" ")[0]}
              </span>
              <Icon name="chevron" size={14} />
            </button>

            {showUserMenu && (
              <div className="topbar-user-menu">
                <div className="user-menu-header">
                  <strong>{user.name}</strong>
                  <small>
                    {user.role === "moderator" ? "Moderator" : user.email}
                  </small>
                </div>
                <button
                  type="button"
                  className="user-menu-item"
                  onClick={() => {
                    onSelectView?.("Profile")
                    setShowUserMenu(false)
                  }}
                >
                  <Icon name="user" size={16} />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  className="user-menu-item"
                  onClick={() => {
                    onSelectView?.("Settings")
                    setShowUserMenu(false)
                  }}
                >
                  <Icon name="settings" size={16} />
                  <span>Settings & Theme</span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    className="user-menu-item danger"
                    onClick={() => {
                      setShowUserMenu(false)
                      onSignOut()
                    }}
                  >
                    <Icon name="logout" size={16} />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
export default Topbar
