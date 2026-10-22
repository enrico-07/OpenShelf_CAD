import { FormEvent, useState, useEffect, ChangeEvent } from "react"
import { Item, Version } from "../types"
import { Icon } from "../components/common/Icon"
import { Button } from "../components/common/Button"
import { subjects, licenses } from "../data/seedData"
import { sanitizeUrl } from "../utils/security"

export type DraftState = {
  title: string
  subject: string
  type: string
  description: string
  tags: string
  license: string
  attribution: string
  link: string
  file: string
  note: string
}

export type FileMeta = {
  name: string
  sizeFormatted: string
  sizeBytes: number
  type: string
  pageCount: number
}

export function UploadModal({
  draftParent,
  uploadStep,
  draft,
  onDraftChange,
  onStepChange,
  onClose,
  onSubmit,
  versions,
}: {
  draftParent?: Item
  uploadStep: number
  draft: DraftState
  onDraftChange: (updater: (prev: DraftState) => DraftState) => void
  onStepChange: (step: number) => void
  onClose: () => void
  onSubmit: (e: FormEvent, file?: File | null) => void
  versions: Record<number, Version[]>
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSimulatingS3Upload, setIsSimulatingS3Upload] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Automatically reset internal file selections whenever draft.file is emptied
  useEffect(() => {
    if (!draft.file) {
      setSelectedFile(null)
      setFileMeta(null)
      setFileError(null)
    }
  }, [draft.file])

  const maxSizeBytes = 25 * 1024 * 1024 // 25 MB limit
  const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"]

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      setFileError(
        `Invalid file format '${ext}'. Please select a PDF, DOCX, or PPTX file.`,
      )
      setFileMeta(null)
      return
    }

    if (file.size > maxSizeBytes) {
      setFileError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 25 MB.`,
      )
      setFileMeta(null)
      return
    }

    setFileError(null)
    const formatted =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`

    // Calculated / simulated page count based on size
    const estPages = Math.max(2, Math.round(file.size / (80 * 1024)))

    setFileMeta({
      name: file.name,
      sizeFormatted: formatted,
      sizeBytes: file.size,
      type: file.type || ext.replace(".", "").toUpperCase(),
      pageCount: estPages,
    })

    onDraftChange((d) => ({
      ...d,
      file: file.name,
      title:
        d.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
    }))
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (uploadStep === 1 && draft.link) {
      if (!sanitizeUrl(draft.link)) {
        setFileError(
          "External link must be a valid URL starting with https:// or http://",
        )
        return
      }
    }
    if (uploadStep < 3) {
      onStepChange(uploadStep + 1)
      return
    }

    // Step 3 submission: run visual S3 presigned upload progress simulation
    setIsSimulatingS3Upload(true)
    setUploadProgress(10)
    const timer = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            setIsSimulatingS3Upload(false)
            onSubmit(e, selectedFile)
          }, 350)
          return 100
        }
        return p + 25
      })
    }, 120)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="upload-modal" onSubmit={handleFormSubmit}>
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">
              {draftParent
                ? `Improving “${draftParent.title}”`
                : "Contribute to OpenShelf"}
            </span>
            <h2>
              {uploadStep === 1
                ? draftParent
                  ? "Upload the new version"
                  : "Share a resource"
                : uploadStep === 2
                  ? draftParent
                    ? "Describe your changes"
                    : "Add the details"
                  : "Review and submit to AWS S3"}
            </h2>
          </div>
          <button onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>

        <div className="stepper">
          {[1, 2, 3].map((step) => (
            <span className={uploadStep >= step ? "active" : ""} key={step}>
              <i>
                {uploadStep > step ? <Icon name="check" size={13} /> : step}
              </i>
              <small>
                {step === 1 ? "Resource" : step === 2 ? "Details" : "Review"}
              </small>
            </span>
          ))}
        </div>

        {uploadStep === 1 && (
          <div className="upload-body">
            <label
              className={`dropzone ${draft.file ? "has-file" : ""} ${
                fileError ? "error" : ""
              }`}
            >
              <input
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileSelect}
                type="file"
              />
              <span>
                <Icon name={draft.file ? "check" : "upload"} size={24} />
              </span>
              <strong>
                {draft.file || "Drop your learning resource here"}
              </strong>
              <p>
                {draft.file
                  ? "Ready to upload securely to S3 private bucket"
                  : "or browse from your computer"}
              </p>
              <small>PDF, DOCX, or PPTX · up to 25 MB</small>
            </label>

            {fileError && (
              <div className="upload-validation-error">
                <Icon name="close" size={16} /> {fileError}
              </div>
            )}

            {fileMeta && !fileError && (
              <div className="upload-file-meta-card">
                <div className="meta-row-header">
                  <strong>
                    <Icon name="check" size={16} /> File Validated Successfully
                  </strong>
                  <span className="meta-badge">Ready for S3</span>
                </div>
                <div className="meta-details-grid">
                  <span>
                    Name: <b>{fileMeta.name}</b>
                  </span>
                  <span>
                    Size: <b>{fileMeta.sizeFormatted}</b>
                  </span>
                  <span>
                    Format: <b>{fileMeta.type}</b>
                  </span>
                  <span>
                    Estimated Pages: <b>{fileMeta.pageCount} pages</b>
                  </span>
                </div>
              </div>
            )}

            {draft.file && (
              <button
                type="button"
                className="clear-selected-file-action"
                style={{
                  alignSelf: "center",
                  margin: "8px auto 0",
                  fontSize: "13px",
                  color: "var(--accent-color, #2563eb)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 500,
                }}
                onClick={() => {
                  setSelectedFile(null)
                  setFileMeta(null)
                  setFileError(null)
                  onDraftChange((d) => ({ ...d, file: "", title: "" }))
                }}
              >
                <Icon name="close" size={14} /> Choose a different file
              </button>
            )}

            {!draftParent && (
              <>
                <div className="or-divider">
                  <span>OR</span>
                </div>
                <label className="form-field">
                  <span>Share an external link</span>
                  <input
                    onChange={(e) =>
                      onDraftChange((d) => ({ ...d, link: e.target.value }))
                    }
                    placeholder="https://example.com/resource"
                    type="url"
                    value={draft.link}
                  />
                </label>
              </>
            )}
          </div>
        )}

        {uploadStep === 2 && (
          <div className="upload-body field-grid">
            {draftParent ? (
              <label className="form-field full">
                <span>Change note</span>
                <textarea
                  onChange={(e) =>
                    onDraftChange((d) => ({ ...d, note: e.target.value }))
                  }
                  placeholder="What did you improve? e.g. Added a section on tries with 4 new diagrams"
                  required
                  rows={4}
                  value={draft.note}
                />
              </label>
            ) : (
              <>
                <label className="form-field full">
                  <span>Resource title</span>
                  <input
                    onChange={(e) =>
                      onDraftChange((d) => ({ ...d, title: e.target.value }))
                    }
                    required
                    value={draft.title}
                  />
                </label>
                <label className="form-field">
                  <span>Subject</span>
                  <select
                    onChange={(e) =>
                      onDraftChange((d) => ({ ...d, subject: e.target.value }))
                    }
                    value={draft.subject}
                  >
                    {subjects.map(([, name]) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Resource type</span>
                  <select
                    onChange={(e) =>
                      onDraftChange((d) => ({ ...d, type: e.target.value }))
                    }
                    value={draft.type}
                  >
                    {[
                      "Study guide",
                      "Revision notes",
                      "Reading list",
                      "Tutorial",
                      "Practice set",
                      "Reference link",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field full">
                  <span>Description</span>
                  <textarea
                    onChange={(e) =>
                      onDraftChange((d) => ({
                        ...d,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    value={draft.description}
                  />
                </label>
                <label className="form-field full">
                  <span>Tags (comma separated)</span>
                  <input
                    onChange={(e) =>
                      onDraftChange((d) => ({ ...d, tags: e.target.value }))
                    }
                    value={draft.tags}
                  />
                </label>
                <label className="form-field">
                  <span>License</span>
                  <select
                    onChange={(e) =>
                      onDraftChange((d) => ({ ...d, license: e.target.value }))
                    }
                    value={draft.license}
                  >
                    {licenses.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Original source / attribution</span>
                  <input
                    onChange={(e) =>
                      onDraftChange((d) => ({
                        ...d,
                        attribution: e.target.value,
                      }))
                    }
                    placeholder="Your own work"
                    value={draft.attribution}
                  />
                </label>
              </>
            )}
          </div>
        )}

        {uploadStep === 3 && (
          <div className="upload-body review-card">
            <span className="review-icon">
              <Icon name={draftParent ? "versions" : "book"} size={24} />
            </span>
            <div>
              <span className="status pending">
                {draftParent
                  ? `Version ${(versions[draftParent.id]?.[0]?.number ?? 1) + 1}`
                  : "Ready for review"}
              </span>
              <h3>{draftParent ? draftParent.title : draft.title}</h3>
              <p>
                {draftParent
                  ? draft.note || "Community improvement"
                  : `${draft.subject} · ${draft.type} · ${draft.license}`}
              </p>
            </div>
            <div className="review-checks">
              <span>
                <Icon name="check" size={15} /> File size verified (
                {fileMeta ? fileMeta.sizeFormatted : "Standard payload"} &lt; 25
                MB)
              </span>
              <span>
                <Icon name="check" size={15} /> Presigned S3 destination
                allocated
              </span>
              <span>
                <Icon name="check" size={15} /> Community guidelines accepted
              </span>
            </div>

            {isSimulatingS3Upload && (
              <div className="s3-upload-progress-container">
                <div className="progress-header">
                  <span>Uploading to Amazon S3...</span>
                  <strong>{uploadProgress}%</strong>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <small className="progress-sub">
                  Destination:{" "}
                  <code>
                    s3://openshelf-learning-files/{draftParent?.id || "new"}/...
                  </code>
                </small>
              </div>
            )}

            <p className="review-note">
              <Icon name="clock" size={17} />{" "}
              {draftParent
                ? "Previous versions stay available in the history. Followers are notified via SNS."
                : "Most resources are reviewed by a community moderator within 24 hours."}
            </p>
          </div>
        )}

        <div className="modal-footer">
          <Button
            className="secondary-button"
            disabled={isSimulatingS3Upload}
            onClick={() =>
              uploadStep === 1 ? onClose() : onStepChange(uploadStep - 1)
            }
          >
            {uploadStep === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            className="primary-button"
            disabled={isSimulatingS3Upload}
            icon={uploadStep === 3 ? "check" : "arrow"}
            type="submit"
          >
            {isSimulatingS3Upload
              ? "Uploading to S3..."
              : uploadStep === 3
                ? draftParent
                  ? "Publish version"
                  : "Submit for review"
                : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  )
}
export default UploadModal
