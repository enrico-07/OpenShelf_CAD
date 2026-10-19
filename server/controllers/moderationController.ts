import type { Response } from "express"
import type { AuthenticatedRequest } from "../security/middleware.ts"
import { sanitizeText, validateReportInput } from "../security/validation.ts"
import { dynamoDbService } from "../services/dynamoDbService.ts"
import { notifyModerationAction } from "../aws/snsClient.ts"
import type { Status } from "../types.ts"

export const submitReport = async (req: AuthenticatedRequest, res: Response) => {
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

  const cleanReason = sanitizeText(req.body.reason)
  const cleanDetails = sanitizeText(req.body.details || "")
  const fullReason = cleanDetails ? `${cleanReason}: ${cleanDetails}` : cleanReason

  const updated = await dynamoDbService.updateResourceStatus(resourceId, "reported", fullReason)
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Resource not found.",
    })
  }

  return res.status(200).json({
    success: true,
    message: "Report received. A community moderator will review the resource.",
  })
}

export const getModerationQueue = async (req: AuthenticatedRequest, res: Response) => {
  // Only moderators can access the full queue
  if (!req.user || req.user.role !== "moderator") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Access restricted to platform moderators.",
    })
  }

  const allItems = await dynamoDbService.getResources({ isModerator: true })
  const queue = allItems.filter(
    (it) => it.status === "pending" || it.status === "reported"
  )

  return res.status(200).json({
    success: true,
    data: queue,
    counts: {
      pending: allItems.filter((i) => i.status === "pending").length,
      reported: allItems.filter((i) => i.status === "reported").length,
      approved: allItems.filter((i) => i.status === "approved").length,
      rejected: allItems.filter((i) => i.status === "rejected").length,
    },
  })
}

export const moderateResource = async (req: AuthenticatedRequest, res: Response) => {
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

  const updated = await dynamoDbService.updateResourceStatus(resourceId, status)
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Resource not found.",
    })
  }

  // Dispatch Amazon SNS moderation notification
  notifyModerationAction(
    updated.title,
    status as "approved" | "rejected" | "reported",
    sanitizeText(req.body.note || updated.reportReason || "")
  ).catch((err) => console.warn(`[SNS] Background moderation alert error: ${err.message}`))

  return res.status(200).json({
    success: true,
    message: `Resource marked as ${status}.`,
    data: updated,
  })
}
