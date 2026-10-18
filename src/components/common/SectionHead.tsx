import { ReactNode } from "react"

export function SectionHead({
  meta,
  title,
  action,
}: {
  meta?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="section-header">
      <div className="section-title">
        <h2>{title}</h2>
        {meta && <span className="section-meta">{meta}</span>}
      </div>
      {action}
    </div>
  )
}
export default SectionHead
