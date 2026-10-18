import { useState, useEffect } from "react"
import { Item, Version } from "../types"
import { Modal } from "../components/common/Modal"
import { Button } from "../components/common/Button"
import { Icon } from "../components/common/Icon"

export function ResourceReaderModal({
  selected,
  selectedVersions,
  onClose,
}: {
  selected: Item
  selectedVersions: Version[]
  onClose: () => void
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [fullscreen, setFullscreen] = useState(false)
  const totalPages = selected.pages || 12
  const currentVersion = selectedVersions[0]?.number ?? 1

  // Keyboard navigation for reader: Left/Right arrows for page flips, +/- for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setCurrentPage((p) => Math.max(1, p - 1))
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setCurrentPage((p) => Math.min(totalPages, p + 1))
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        setZoomLevel((z) => Math.min(150, z + 10))
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        setZoomLevel((z) => Math.max(70, z - 10))
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault()
        setFullscreen((f) => !f)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [totalPages])

  // Mock page content generator based on resource subject and title
  const getPageContent = (page: number) => {
    switch (page) {
      case 1:
        return {
          heading: "Chapter 1: Foundational Concepts & Problem Scope",
          paragraphs: [
            `${selected.title} provides a systematic walkthrough tailored for ${selected.subject} learners.`,
            `This learning resource synthesizes core principles, standard academic conventions, and verified real-world applications. Authored by ${selected.author}, this document is maintained and updated via community version control.`,
            `Key learning outcomes include establishing verified definitions, mapping core algorithmic dependencies, and identifying standard pitfalls in exam questions.`,
          ],
          codeOrBox: `// Academic Domain & License Context\nconst resourceScope = {\n  domain: "${selected.subject}",\n  scope: "${selected.type}",\n  license: "${selected.license}",\n  verified: true\n};`,
        }
      case 2:
        return {
          heading: "Chapter 2: Core Methodology & Step-by-Step Breakdown",
          paragraphs: [
            "In this section, we examine the constituent parts and transition mechanisms. Understanding why certain rules apply depends strictly on following the sequential order of operations.",
            "Carefully cross-reference the references and formulas highlighted in the companion study guide.",
          ],
          codeOrBox: `[Step 1] Identify problem constraints -> [Step 2] Map key formulas -> [Step 3] Apply verification check.`,
        }
      default:
        return {
          heading: `Chapter ${page}: Practical Drills, Case Studies & Solutions`,
          paragraphs: [
            `Continuing the detailed analysis for Page ${page} of ${selected.title}.`,
            "Review the practice prompts below and verify your answers before comparing with the chapter rubric.",
          ],
          codeOrBox: `Practice Exercise ${page}.1:\nVerify constraints and formulate an optimal approach according to the methods established in Section 1.`,
        }
    }
  }

  const pageData = getPageContent(currentPage)

  return (
    <Modal
      className="reader-modal-dialog"
      extraWide
      kicker={`${selected.subject} · ${selected.format}`}
      onClose={onClose}
      title={selected.title}
    >
      <div
        className={`reader-interactive-container ${
          fullscreen ? "reader-fullscreen" : ""
        }`}
      >
        {/* Reader Toolbar */}
        <div className="reader-toolbar">
          <div className="reader-toolbar-left">
            <span className="reader-doc-badge">
              <Icon name="book" size={16} /> {selected.format} Document
            </span>
            <span className="reader-version-pill">v{currentVersion}.0</span>
          </div>

          {/* Corrected Flip Buttons: Left arrow on left, Right arrow on right */}
          <div className="reader-toolbar-center">
            <button
              aria-label="Previous page"
              className="reader-page-nav prev"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous page (Left Arrow)"
              type="button"
            >
              <Icon name="chevron_left" size={16} />
            </button>
            <span className="reader-page-indicator">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>
            <button
              aria-label="Next page"
              className="reader-page-nav next"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next page (Right Arrow)"
              type="button"
            >
              <Icon name="chevron" size={16} />
            </button>
          </div>

          <div className="reader-toolbar-right">
            <button
              className="reader-tool-btn"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              title="Zoom out (-)"
              type="button"
            >
              –
            </button>
            <span className="reader-zoom-text">{zoomLevel}%</span>
            <button
              className="reader-tool-btn"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              title="Zoom in (+)"
              type="button"
            >
              +
            </button>
            <button
              className="reader-tool-btn"
              onClick={() => setZoomLevel(100)}
              title="Reset Zoom to 100%"
              type="button"
            >
              1:1
            </button>
            <button
              className={`reader-tool-btn ${fullscreen ? "active" : ""}`}
              onClick={() => setFullscreen((f) => !f)}
              title={fullscreen ? "Exit full view (F)" : "Expand full view (F)"}
              type="button"
            >
              <Icon name="monitor" size={16} />
            </button>
          </div>
        </div>

        {/* Reader Document Canvas */}
        <div className="reader-canvas-viewport">
          <div
            className="reader-zoom-wrapper"
            style={{ zoom: `${zoomLevel}%` }}
          >
            <div className="reader-document-sheet">
              {/* Header / Watermark info */}
              <div className="reader-sheet-header">
                <span className="sheet-brand">OpenShelf Academic Edition</span>
                <span className="sheet-id">
                  ID: #{selected.id} · Rev {currentVersion}.0
                </span>
              </div>

              <div className="reader-sheet-body">
                <span className="reader-sheet-kicker">
                  {selected.subject} — {selected.type}
                </span>
                <h2 className="reader-sheet-title">{selected.title}</h2>
                <div className="reader-sheet-meta">
                  <span>
                    By <strong>{selected.author}</strong>
                  </span>
                  <span>•</span>
                  <span>License: {selected.license}</span>
                  <span>•</span>
                  <span>Verified Community Copy</span>
                </div>

                <hr className="reader-sheet-divider" />

                <div className="reader-sheet-content">
                  <h3 className="chapter-heading">{pageData.heading}</h3>
                  {pageData.paragraphs.map((p, idx) => (
                    <p className="reader-paragraph" key={idx}>
                      {p}
                    </p>
                  ))}

                  <div className="reader-callout-box">
                    <div className="callout-header">
                      <Icon name="code" size={16} /> Exemplar Reference & Schema
                    </div>
                    <pre className="callout-code">{pageData.codeOrBox}</pre>
                  </div>

                  <h4>Topic Key Points & Tags</h4>
                  <div className="reader-tag-chips">
                    {selected.tags.map((tag) => (
                      <span className="reader-chip" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sheet Footer */}
                <div className="reader-sheet-footer">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <span>OpenShelf Cloud Storage: S3 Controlled Read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reader Bottom Bar */}
        <div className="reader-bottom-bar">
          <span className="reader-meta-note">
            <Icon name="shield" size={14} /> Controlled access via AWS S3
            Presigned Document Stream · Shortcuts: ◄ ► (Pages) · +/- (Zoom) · F
            (Fullscreen)
          </span>
          <div className="reader-bottom-actions">
            <Button
              className="secondary-button"
              disabled={currentPage <= 1}
              icon="chevron_left"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              className="secondary-button"
              disabled={currentPage >= totalPages}
              icon="chevron"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next page
            </Button>
            <Button className="primary-button" icon="check" onClick={onClose}>
              Finished reading
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
export default ResourceReaderModal
