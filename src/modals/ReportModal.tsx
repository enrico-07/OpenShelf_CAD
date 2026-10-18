import { useState } from "react"
import { Modal } from "../components/common/Modal"
import { Button } from "../components/common/Button"

export function ReportModal({
  onClose,
  onSubmitReport,
}: {
  onClose: () => void
  onSubmitReport: (reason: string, details: string) => void
}) {
  const [reportReason, setReportReason] = useState("Misleading or incorrect")
  const [details, setDetails] = useState("")

  const reasons = [
    "Misleading or incorrect",
    "Shared without permission",
    "Inappropriate content",
    "Spam or duplicate",
  ]

  return (
    <Modal
      kicker="Reports are reviewed by moderators"
      onClose={onClose}
      title="Report this resource"
    >
      <div className="upload-body">
        {reasons.map((reason) => (
          <label
            className={`radio-row ${reportReason === reason ? "on" : ""}`}
            key={reason}
          >
            <input
              checked={reportReason === reason}
              name="reason"
              onChange={() => setReportReason(reason)}
              type="radio"
            />
            {reason}
          </label>
        ))}
        <label className="form-field">
          <span>Details (optional)</span>
          <textarea
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            value={details}
          />
        </label>
      </div>
      <div className="modal-footer">
        <Button className="secondary-button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="reject-button"
          icon="shield"
          onClick={() => onSubmitReport(reportReason, details)}
        >
          Submit report
        </Button>
      </div>
    </Modal>
  )
}
export default ReportModal
