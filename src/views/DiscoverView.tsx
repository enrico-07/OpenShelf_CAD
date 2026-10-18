import { Item } from "../types"
import { ResourceCard } from "../components/cards/ResourceCard"
import {
  ResourceSkeleton,
  FeaturedSkeleton,
} from "../components/common/Skeleton"
import { Icon } from "../components/common/Icon"
import { Button } from "../components/common/Button"
import { SectionHead } from "../components/common/SectionHead"
import { subjects } from "../data/seedData"

export function DiscoverView({
  visibleResources,
  saved,
  selectedId,
  onOpenResource,
  onOpenReader,
  onToggleSave,
  query,
  filter,
  onFilterChange,
  subject,
  onSubjectChange,
  format,
  onFormatChange,
  sort,
  onSortChange,
  showFilters,
  onToggleFilters,
  onResetFilters,
  featuredItem,
  onSelectView,
  followedSubjects,
  onToggleSubject,
  published,
  selectedTags,
  onToggleTag,
  isLoading,
}: {
  visibleResources: Item[]
  saved: number[]
  selectedId: number
  onOpenResource: (id: number) => void
  onOpenReader?: (id: number) => void
  onToggleSave: (id: number) => void
  query: string
  filter: string
  onFilterChange: (filter: string) => void
  subject: string
  onSubjectChange: (subj: string) => void
  format: string
  onFormatChange: (fmt: string) => void
  sort: string
  onSortChange: (sort: string) => void
  showFilters: boolean
  onToggleFilters: () => void
  onResetFilters: () => void
  featuredItem: Item
  onSelectView: (view: string) => void
  followedSubjects: string[]
  onToggleSubject: (name: string) => void
  published: Item[]
  selectedTags?: string[]
  onToggleTag?: (tag: string) => void
  isLoading?: boolean
}) {
  const filterOptions = [
    "All resources",
    "Study guides",
    "Revision notes",
    "Reading lists",
    "Following",
    "Most saved",
  ]

  const popularTags = [
    "Algorithms",
    "Diagrams",
    "Beginner",
    "Exam prep",
    "Calculus",
    "Solutions",
    "Memory",
    "Templates",
  ]

  const grid = isLoading ? (
    <div className="resource-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <ResourceSkeleton key={i} />
      ))}
    </div>
  ) : visibleResources.length ? (
    <div className="resource-grid">
      {visibleResources.map((resource) => (
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
        <Icon name="shelves" size={28} />
      </span>
      <h2>
        {published.length === 0 ? "Your shelf is ready" : "Nothing found"}
      </h2>
      <p>
        {published.length === 0
          ? "There are no shared resources yet. Be the first to publish a study guide, revision note, or reading list."
          : "Try a different search query, clear your active filters, or browse by subject."}
      </p>
      {published.length === 0 ? (
        <Button
          className="primary-button"
          icon="upload"
          onClick={() => onSelectView("My Contributions")}
        >
          Share your first resource
        </Button>
      ) : (
        <Button className="primary-button" onClick={onResetFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )

  const subjectCards = (
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
                : "No resources yet"}
            </small>
            <div className="subject-actions">
              <button
                onClick={() => {
                  onSubjectChange(name)
                  onSelectView("Discover")
                  if (!showFilters) onToggleFilters()
                }}
                type="button"
              >
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

  return (
    <>
      {isLoading ? (
        <FeaturedSkeleton />
      ) : !query && featuredItem ? (
        <section className="featured">
          <div className="featured-copy">
            <span className="featured-label">Featured this week</span>
            <h2>{featuredItem.title}</h2>
            <p>{featuredItem.description}</p>
            <div className="featured-meta">
              <span>
                <Icon filled name="star" size={16} /> {featuredItem.rating}
              </span>
              <span>{featuredItem.saves.toLocaleString()} saves</span>
              <span>{featuredItem.author}</span>
            </div>
            <div className="featured-actions">
              <Button
                className="primary-button"
                icon="book"
                onClick={() => {
                  if (onOpenReader) {
                    onOpenReader(featuredItem.id)
                  } else {
                    onOpenResource(featuredItem.id)
                  }
                }}
              >
                Open resource
              </Button>
              <Button
                className="secondary-button"
                icon="bookmark"
                onClick={() => onToggleSave(featuredItem.id)}
              >
                {saved.includes(featuredItem.id) ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
          <div className="featured-cover">
            <ResourceCard
              onOpen={() => onOpenResource(featuredItem.id)}
              onSave={() => onToggleSave(featuredItem.id)}
              resource={featuredItem}
              saved={saved.includes(featuredItem.id)}
              selected={selectedId === featuredItem.id}
            />
          </div>
        </section>
      ) : !query && published.length === 0 ? (
        <section
          className="featured"
          style={{
            background:
              "linear-gradient(135deg, var(--card-bg), var(--chip-bg))",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="featured-copy">
            <span
              className="featured-label"
              style={{ color: "var(--accent-text)" }}
            >
              Welcome to OpenShelf
            </span>
            <h2>Your community learning shelf is ready</h2>
            <p>
              OpenShelf is clean and ready for your learning materials. Upload
              your study notes, explore academic subjects, curate collections,
              or collaborate with learners.
            </p>
            <div className="featured-actions">
              <Button
                className="primary-button"
                icon="upload"
                onClick={() => onSelectView("My Contributions")}
              >
                Upload your first resource
              </Button>
              <Button
                className="secondary-button"
                icon="school"
                onClick={() => onSelectView("Browse subjects")}
              >
                Explore subjects
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <SectionHead
        action={
          <div className="header-actions">
            <select
              className="sort-select"
              onChange={(e) => onSortChange(e.target.value)}
              value={sort}
            >
              <option>Most relevant</option>
              <option>Highest rated</option>
              <option>Most saved</option>
            </select>
            <button
              className={`filter-button ${showFilters ? "on" : ""}`}
              onClick={onToggleFilters}
              type="button"
            >
              <Icon name="filter" size={17} /> Filters{" "}
              {(subject ||
                format !== "Any format" ||
                (selectedTags && selectedTags.length > 0)) && (
                <span>
                  {Number(!!subject) +
                    Number(format !== "Any format") +
                    (selectedTags?.length || 0)}
                </span>
              )}
            </button>
          </div>
        }
        title={query ? `Results for “${query}”` : "Recommended for you"}
      />

      {/* Multi-Tag Pill Bar */}
      <div className="tag-filter-bar">
        <span className="tag-filter-label">Quick topics:</span>
        <div className="tag-pills-list">
          {popularTags.map((tag) => {
            const isSelected = selectedTags?.includes(tag)
            return (
              <button
                className={`tag-pill ${isSelected ? "selected" : ""}`}
                key={tag}
                onClick={() => onToggleTag?.(tag)}
                type="button"
              >
                {isSelected && <Icon name="check" size={13} />}
                <span>{tag}</span>
              </button>
            )
          })}
          {selectedTags && selectedTags.length > 0 && (
            <button
              className="clear-tags-btn"
              onClick={onResetFilters}
              type="button"
            >
              Reset tags
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <label className="form-field">
            <span>Subject</span>
            <select
              onChange={(e) => onSubjectChange(e.target.value)}
              value={subject}
            >
              <option value="">All subjects</option>
              {subjects.map(([, name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>File type</span>
            <select
              onChange={(e) => onFormatChange(e.target.value)}
              value={format}
            >
              {["Any format", "PDF", "DOCX", "Link", "Slides"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button
            className="text-button"
            onClick={onResetFilters}
            type="button"
          >
            Reset
          </button>
        </div>
      )}

      <div className="filter-row">
        {filterOptions.map((item) => (
          <button
            className={filter === item ? "active" : ""}
            key={item}
            onClick={() => onFilterChange(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      {grid}

      {!query && (
        <>
          <SectionHead
            action={
              <button
                className="text-button"
                onClick={() => onSelectView("Browse subjects")}
                type="button"
              >
                All subjects <Icon name="arrow" size={14} />
              </button>
            }
            title="Find your next subject"
          />
          {subjectCards}
        </>
      )}
    </>
  )
}
export default DiscoverView
