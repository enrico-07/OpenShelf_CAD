import type { Response } from "express"
import type { AuthenticatedRequest } from "../security/middleware.ts"
import { sanitizeText, validateReportInput } from "../security/validation.ts"
import { items } from "./resourceController.ts"
import type { Status } from "../types.ts"

export const submitReport = (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Invalid resource ID.",
    })
  }

  const validation = validateReportInput(req.body)
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      messages: validation.errors,
    })
  }

  const target = items.find((it) => it.id === resourceId)
  if (!target) {
    return res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Resource not found.",
    })
  }

  const cleanReason = sanitizeText(req.body.reason)
  const cleanDetails = sanitizeText(req.body.details || "")

  target.status = "reported"
  target.reportReason = cleanDetails ? `${cleanReason}: ${cleanDetails}` : cleanReason

  return res.status(200).json({
    success: true,
    message: "Report received. A community moderator will review the resource.",
  })
}

export const getModerationQueue = (req: AuthenticatedRequest, res: Response) => {
  // Only moderators can access the full queue
  if (!req.user || req.user.role !== "moderator") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Access restricted to platform moderators.",
    })
  }

  const queue = items.filter(
    (it) => it.status === "pending" || it.status === "reported",
  )

  return res.status(200).json({
    success: true,
    data: queue,
    counts: {
      pending: items.filter((i) => i.status === "pending").length,
      reported: items.filter((i) => i.status === "reported").length,
      approved: items.filter((i) => i.status === "approved").length,
      rejected: items.filter((i) => i.status === "rejected").length,
    },
  })
}

export const moderateResource = (req: AuthenticatedRequest, res: Response) => {
  // Enforce moderator authorization
  if (!req.user || req.user.role !== "moderator") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Moderation actions require moderator privileges.",
    })
  }

  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Invalid resource ID.",
    })
  }

  const status = req.body.status as Status
  if (!["approved", "rejected", "pending", "reported"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Status must be 'approved', 'rejected', 'pending', or 'reported'.",
    })
  }

  const target = items.find((it) => it.id === resourceId)
  if (!target) {
    return res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Resource not found.",
    })
  }

  target.status = status
  if (status === "approved") {
    target.reportReason = undefined
  }

  return res.status(200).json({
    success: true,
    message: `Resource marked as ${status}.`,
    data: target,
  })
}
