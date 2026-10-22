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
  headphones: "headphones",
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
  pause: "pause",
  play: "play_arrow",
  plus: "add",
  psychology: "psychology",
  science: "science",
  school: "school",
  search: "search",
  settings: "settings",
  shelves: "shelves",
  shield: "shield",
  star: "star",
  stop: "stop",
  sun: "light_mode",
  translate: "translate",
  upload: "upload",
  user: "person",
  users: "group",
  versions: "history",
  volume: "volume_up",
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
      className={`icon material-symbols-rounded ${filled ? "filled" : ""} ${
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
