import NavItem from "./NavItem"
import Icon from "../common/Icon"

export function MobileBottomNav({
  activeView,
  onSelectView,
  onStartUpload,
}: {
  activeView: string
  onSelectView: (view: string) => void
  onStartUpload: () => void
}) {
  return (
    <nav className="mobile-bottom-nav">
      <NavItem
        active={activeView === "Discover"}
        icon="compass"
        label="Discover"
        onClick={() => onSelectView("Discover")}
      />
      <NavItem
        active={activeView === "My Library"}
        icon="bookmark"
        label="Library"
        onClick={() => onSelectView("My Library")}
      />
      <button className="mobile-add" onClick={onStartUpload} type="button">
        <Icon name="plus" />
      </button>
      <NavItem
        active={activeView === "Collections"}
        icon="collection"
        label="Collections"
        onClick={() => onSelectView("Collections")}
      />
      <NavItem
        active={activeView === "Profile"}
        icon="user"
        label="Profile"
        onClick={() => onSelectView("Profile")}
      />
    </nav>
  )
}
export default MobileBottomNav
