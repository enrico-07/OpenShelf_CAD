export function ResourceSkeleton() {
  return (
    <article className="resource-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-cover" />
      <div className="card-copy">
        <div className="card-label-row">
          <div
            className="skeleton skeleton-text"
            style={{ width: "35%", height: "12px" }}
          />
          <div className="skeleton skeleton-btn" />
        </div>
        <div
          className="skeleton skeleton-text"
          style={{ width: "85%", height: "18px", margin: "8px 0 6px" }}
        />
        <div
          className="skeleton skeleton-text"
          style={{ width: "65%", height: "14px", marginBottom: "14px" }}
        />
        <div className="author-row">
          <div className="skeleton skeleton-avatar" />
          <div
            className="skeleton skeleton-text"
            style={{ width: "40%", height: "12px" }}
          />
        </div>
        <div
          className="card-footer"
          style={{ borderTop: "none", paddingTop: "8px" }}
        >
          <div
            className="skeleton skeleton-text"
            style={{ width: "25%", height: "12px" }}
          />
          <div
            className="skeleton skeleton-text"
            style={{ width: "30%", height: "12px" }}
          />
        </div>
      </div>
    </article>
  )
}

export function FeaturedSkeleton() {
  return (
    <div className="featured skeleton-featured" aria-hidden="true">
      <div>
        <div
          className="skeleton skeleton-text"
          style={{ width: "120px", height: "14px", marginBottom: "12px" }}
        />
        <div
          className="skeleton skeleton-text"
          style={{ width: "80%", height: "26px", marginBottom: "12px" }}
        />
        <div
          className="skeleton skeleton-text"
          style={{ width: "95%", height: "14px", marginBottom: "8px" }}
        />
        <div
          className="skeleton skeleton-text"
          style={{ width: "70%", height: "14px", marginBottom: "18px" }}
        />
        <div className="featured-actions">
          <div
            className="skeleton"
            style={{
              width: "130px",
              height: "40px",
              borderRadius: "var(--radius)",
            }}
          />
          <div
            className="skeleton"
            style={{
              width: "110px",
              height: "40px",
              borderRadius: "var(--radius)",
            }}
          />
        </div>
      </div>
      <div className="featured-cover">
        <div
          className="skeleton"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "180px",
            borderRadius: "var(--radius-lg)",
          }}
        />
      </div>
    </div>
  )
}
export default ResourceSkeleton
