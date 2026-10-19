import { Router } from "express"
import {
  authRateLimiter,
  uploadRateLimiter,
  actionRateLimiter,
} from "../security/rateLimiters.ts"
import {
  loginUser,
  registerUser,
  confirmUser,
  getCurrentUser,
  upgradeRole,
} from "../controllers/authController.ts"
import {
  getResources,
  getResourceById,
  uploadResource,
  uploadRevision,
  getVersions,
  getFeedback,
  submitFeedback,
  replyFeedback,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  getCollections,
  createCollection,
  getNotes,
  markNoteRead,
  subscribeToNotifications,
} from "../controllers/resourceController.ts"
import {
  submitReport,
  getModerationQueue,
  moderateResource,
} from "../controllers/moderationController.ts"
import { requireRole } from "../security/middleware.ts"
import { getTelemetrySummary } from "../aws/cloudwatchClient.ts"

const router = Router()

/** System Health & CloudWatch Telemetry Check */
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: "OpenShelf Secure API",
  })
})

router.get("/telemetry/metrics", async (_req, res) => {
  const telemetry = await getTelemetrySummary()
  res.status(200).json({
    success: true,
    data: telemetry,
  })
})

/** Authentication Endpoints with Auth Rate Limiting */
router.post("/auth/login", authRateLimiter, loginUser)
router.post("/auth/register", authRateLimiter, registerUser)
router.post("/auth/confirm", authRateLimiter, confirmUser)
router.post("/auth/upgrade-role", actionRateLimiter, upgradeRole)
router.get("/auth/me", getCurrentUser)

/** Resource Endpoints */
router.get("/resources", getResources)
router.get("/resources/upload-url", uploadRateLimiter, getPresignedUploadUrl)
router.get("/resources/:id", getResourceById)
router.post("/resources", uploadRateLimiter, uploadResource)
router.post("/resources/:id/revisions", uploadRateLimiter, uploadRevision)
router.get("/resources/:id/download-url", getPresignedDownloadUrl)

/** Versions & Feedback */
router.get("/resources/:id/versions", getVersions)
router.get("/resources/:id/feedback", getFeedback)
router.post("/resources/:id/feedback", actionRateLimiter, submitFeedback)
router.post("/resources/:id/feedback/:feedbackId/reply", actionRateLimiter, replyFeedback)

/** Reporting */
router.post("/resources/:id/report", actionRateLimiter, submitReport)

/** Moderation (Protected by Moderator Role) */
router.get("/moderation/queue", requireRole("moderator"), getModerationQueue)
router.post("/moderation/:id", requireRole("moderator"), moderateResource)

/** Collections */
router.get("/collections", getCollections)
router.post("/collections", actionRateLimiter, createCollection)

/** Notifications & Amazon SNS */
router.get("/notes", getNotes)
router.put("/notes/:id/read", markNoteRead)
router.post("/notifications/subscribe", actionRateLimiter, subscribeToNotifications)

export default router
