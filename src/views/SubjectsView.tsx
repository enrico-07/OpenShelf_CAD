import { Item, SubjectInfo } from "../types"
import { Icon } from "../components/common/Icon"

export function SubjectsView({
  subjects,
  published,
  followedSubjects,
  onToggleSubject,
  onSelectSubject,
}: {
  subjects: SubjectInfo[]
  published: Item[]
  followedSubjects: string[]
  onToggleSubject: (name: string) => void
  onSelectSubject: (name: string) => void
}) {
  return (
    <div className="subject-grid">
      {subjects.map(([symbol, name, tone]) => {
        const count = published.filter((item) => item.subject === name).length
        const on = followedSubjects.includes(name)
        return (
          <article className={`subject-card ${tone}`} key={name}>
            <span className="subject-symbol">
              <Icon name={symbol} size={22} />
            </span>
            <strong>{name}</strong>
            <small>
              {count > 0
                ? `${count} resource${count === 1 ? "" : "s"}`
                : "No resources yet · Be the first to share"}
            </small>
            <div className="subject-actions">
              <button onClick={() => onSelectSubject(name)} type="button">
                Browse <Icon name="arrow" size={15} />
              </button>
              <button
                className={on ? "on" : ""}
                onClick={() => onToggleSubject(name)}
                type="button"
              >
                <Icon name={on ? "check" : "plus"} size={15} />{" "}
                {on ? "Following" : "Follow"}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
export default SubjectsView
