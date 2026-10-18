import { Router } from "express"
import {
  authRateLimiter,
  uploadRateLimiter,
  actionRateLimiter,
} from "../security/rateLimiters.ts"
import {
  loginUser,
  registerUser,
  getCurrentUser,
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
  getPresignedDownloadUrl,
  getCollections,
  createCollection,
  getNotes,
  markNoteRead,
} from "../controllers/resourceController.ts"
import {
  submitReport,
  getModerationQueue,
  moderateResource,
} from "../controllers/moderationController.ts"
import { requireRole } from "../security/middleware.ts"

const router = Router()

/** System Health Check (Safe - reveals no secrets or sensitive stack) */
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: "OpenShelf Secure API",
  })
})

/** Authentication Endpoints with Auth Rate Limiting */
router.post("/auth/login", authRateLimiter, loginUser)
router.post("/auth/register", authRateLimiter, registerUser)
router.get("/auth/me", getCurrentUser)

/** Resource Endpoints */
router.get("/resources", getResources)
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

/** Notifications */
router.get("/notes", getNotes)
router.put("/notes/:id/read", markNoteRead)

export default router
