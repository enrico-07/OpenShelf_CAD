import { IconName } from "../../types"

export const iconGlyphs = {
  archive: "inventory_2",
  arrow: "arrow_forward",
  bell: "notifications",
  book: "menu_book",
  bookmark: "bookmark",
  calculate: "calculate",
  chart: "monitoring",
  check: "check",
  chevron: "chevron_right",
  chevron_left: "chevron_right",
  clock: "schedule",
  close: "close",
  code: "code",
  collection: "collections_bookmark",
  compass: "explore",
  download: "download",
  filter: "tune",
  flag: "flag",
  folder: "folder",
  heart: "thumb_up",
  history: "history_edu",
  layers: "category",
  logout: "logout",
  mail: "mail",
  menu: "menu",
  message: "forum",
  monitor: "desktop_windows",
  moon: "dark_mode",
  more: "more_horiz",
  plus: "add",
  psychology: "psychology",
  science: "science",
  school: "school",
  search: "search",
  settings: "settings",
  shelves: "shelves",
  shield: "shield",
  star: "star",
  sun: "light_mode",
  upload: "upload",
  user: "person",
  users: "group",
  versions: "history",
} as const

export function Icon({
  name,
  size = 20,
  filled = false,
  className = "",
}: {
  name: IconName
  size?: number
  filled?: boolean
  className?: string
}) {
  const isChevronLeft = name === "chevron_left"
  return (
    <span
      aria-hidden="true"
      className={`icon ${filled ? "filled" : ""} ${
        isChevronLeft ? "icon-chevron-left" : ""
      } ${className}`}
      data-name={name}
      style={{
        fontSize: size,
        ...(isChevronLeft
          ? {
              transform: "scaleX(-1)",
              display: "inline-block",
            }
          : {}),
      }}
    >
      {iconGlyphs[name]}
    </span>
  )
}
export default Icon
