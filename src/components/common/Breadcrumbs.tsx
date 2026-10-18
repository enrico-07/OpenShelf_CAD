import Icon from "./Icon"

export type BreadcrumbItem = {
  label: string
  view?: string
}

export function Breadcrumbs({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[]
  onNavigate?: (view: string) => void
}) {
  if (items.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-nav">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li className="breadcrumb-item" key={item.label}>
              {index > 0 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  <Icon name="chevron" size={13} />
                </span>
              )}
              {isLast || !item.view ? (
                <span
                  className="breadcrumb-current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  className="breadcrumb-link"
                  onClick={() => onNavigate?.(item.view!)}
                >
                  {item.label}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
export default Breadcrumbs
