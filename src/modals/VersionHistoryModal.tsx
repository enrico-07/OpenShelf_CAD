import { useState } from "react"
import { Item, Version } from "../types"
import { Modal } from "../components/common/Modal"
import { Button } from "../components/common/Button"
import { Icon } from "../components/common/Icon"

export function VersionHistoryModal({
  selected,
  selectedVersions,
  onClose,
  onDownloadVersion,
}: {
  selected: Item
  selectedVersions: Version[]
  onClose: () => void
  onDownloadVersion: (versionNum: number) => void
}) {
  const [selectedForDiff, setSelectedForDiff] = useState<number>(
    selectedVersions[0]?.number ?? 1,
  )
  const [showDiffView, setShowDiffView] = useState(false)

  const activeVersion =
    selectedVersions.find((v) => v.number === selectedForDiff) ??
    selectedVersions[0]
  const previousVersion = selectedVersions.find(
    (v) => v.number === activeVersion?.number - 1,
  )

  return (
    <Modal
      kicker={selected.title}
      onClose={onClose}
      title="Full version history & change diffs"
      wide
    >
      <div className="version-modal-layout">
        {/* Toggle between timeline and diff comparison */}
        <div className="version-mode-tabs">
          <button
            className={`tab-btn ${!showDiffView ? "active" : ""}`}
            onClick={() => setShowDiffView(false)}
            type="button"
          >
            <Icon name="history" size={16} /> Version timeline (
            {selectedVersions.length})
          </button>
          <button
            className={`tab-btn ${showDiffView ? "active" : ""}`}
            onClick={() => setShowDiffView(true)}
            type="button"
          >
            <Icon name="layers" size={16} /> Visual change diff
          </button>
        </div>

        {!showDiffView ? (
          <div className="upload-body timeline">
            {selectedVersions.map((version, index) => (
              <div
                className={`timeline-row ${index === 0 ? "current" : ""}`}
                key={version.number}
              >
                <b>v{version.number}.0</b>
                <div>
                  <div className="timeline-title-row">
                    <strong>{version.note}</strong>
                    {index === 0 && <i className="status approved">Current</i>}
                    {version.size && (
                      <span className="version-size-tag">{version.size}</span>
                    )}
                  </div>
                  <small>
                    Authored by <strong>{version.author}</strong> ·{" "}
                    {version.when}
                  </small>
                  <code>{version.file}</code>
                </div>
                <div className="timeline-actions">
                  <button
                    className="diff-inspect-btn"
                    onClick={() => {
                      setSelectedForDiff(version.number)
                      setShowDiffView(true)
                    }}
                    title="Inspect changes in this version"
                    type="button"
                  >
                    Compare diff
                  </button>
                  <Button
                    className="secondary-button"
                    icon="download"
                    onClick={() => onDownloadVersion(version.number)}
                  >
                    Get
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="version-diff-container">
            <div className="diff-header-panel">
              <div className="diff-selector">
                <span>Inspecting changes for:</span>
                <select
                  onChange={(e) => setSelectedForDiff(Number(e.target.value))}
                  value={selectedForDiff}
                >
                  {selectedVersions.map((v) => (
                    <option key={v.number} value={v.number}>
                      Version {v.number}.0 — {v.note} ({v.when})
                    </option>
                  ))}
                </select>
              </div>
              <span className="diff-comparison-badge">
                Comparing v{activeVersion?.number}.0 with{" "}
                {previousVersion
                  ? `v${previousVersion.number}.0`
                  : "initial base"}
              </span>
            </div>

            <div className="diff-comparison-grid">
              {/* Left Column: Previous / Base */}
              <div className="diff-column previous">
                <div className="column-header">
                  <strong>
                    {previousVersion
                      ? `v${previousVersion.number}.0 (Previous)`
                      : "Base Baseline"}
                  </strong>
                  <span>
                    {previousVersion ? previousVersion.file : "Origin"}
                  </span>
                </div>
                <div className="diff-preview-box">
                  <p className="diff-meta">
                    Author: {previousVersion?.author || "Initial submitter"}
                  </p>
                  <p className="diff-summary-note">
                    {previousVersion?.note || "Original release"}
                  </p>
                  <div className="diff-line-list">
                    <div className="diff-line unchanged">
                      1. Standard syllabus overview
                    </div>
                    <div className="diff-line unchanged">
                      2. Basic definition table
                    </div>
                    {activeVersion?.diffSummary?.removed.map((rem, i) => (
                      <div className="diff-line removed" key={i}>
                        - {rem}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Active / Improved */}
              <div className="diff-column active">
                <div className="column-header">
                  <strong>
                    v{activeVersion?.number}.0 (Selected Revision)
                  </strong>
                  <span>{activeVersion?.file}</span>
                </div>
                <div className="diff-preview-box">
                  <p className="diff-meta">
                    Revision by: <strong>{activeVersion?.author}</strong>
                  </p>
                  <p className="diff-summary-note">
                    Commit Note: &quot;{activeVersion?.note}&quot;
                  </p>
                  <div className="diff-line-list">
                    <div className="diff-line unchanged">
                      1. Standard syllabus overview
                    </div>
                    <div className="diff-line unchanged">
                      2. Basic definition table
                    </div>
                    {activeVersion?.diffSummary?.added.map((add, i) => (
                      <div className="diff-line added" key={i}>
                        + {add}
                      </div>
                    ))}
                    {activeVersion?.diffSummary?.modified.map((mod, i) => (
                      <div className="diff-line modified" key={i}>
                        ~ {mod}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="diff-footer">
              <span className="diff-s3-hash">
                S3 ETag:{" "}
                <code>e8b4f10a720934c5689a9{activeVersion?.number}</code>
              </span>
              <Button
                className="primary-button"
                icon="download"
                onClick={() => onDownloadVersion(activeVersion?.number ?? 1)}
              >
                Download v{activeVersion?.number}.0
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
export default VersionHistoryModal
