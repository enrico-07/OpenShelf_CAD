import crypto from "node:crypto"
import type { Response } from "express"
import type { AuthenticatedRequest } from "../security/middleware.ts"
import {
  sanitizeText,
  validateResourceInput,
  validateFeedbackInput,
  isValidUrl,
} from "../security/validation.ts"
import { config } from "../security/config.ts"
import { dynamoDbService } from "../services/dynamoDbService.ts"
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
} from "../aws/s3Client.ts"
import {
  notifyResourceRevision,
  subscribeEmailToTopic,
} from "../aws/snsClient.ts"
import { awsConfig } from "../aws/config.ts"
import type {
  Item,
  Version,
  Feedback,
  Note,
  Collection,
  Status,
} from "../types.ts"

export const getResources = async (req: AuthenticatedRequest, res: Response) => {
  const query = sanitizeText(req.query.q || "")
  const subject = sanitizeText(req.query.subject || "")
  const format = sanitizeText(req.query.format || "")
  const statusFilter = sanitizeText(req.query.status || "")
  const isModerator = Boolean(req.user && req.user.role === "moderator")

  const filtered = await dynamoDbService.getResources({
    query,
    subject,
    format,
    status: statusFilter,
    isModerator,
  })

  return res.status(200).json({
    success: true,
    data: filtered,
    total: filtered.length,
  })
}

export const getResourceById = async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Resource ID must be an integer.",
    })
  }

  const resource = await dynamoDbService.getResourceById(id)
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Resource not found.",
    })
  }

  return res.status(200).json({
    success: true,
    data: resource,
  })
}

/**
 * Returns a pre-signed S3 PUT URL for direct browser uploads
 */
export const getPresignedUploadUrl = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const resourceId = parseInt(String(req.query.resourceId || Date.now()), 10)
  const versionNum = parseInt(String(req.query.version || "1"), 10)
  const rawFilename = sanitizeText(String(req.query.filename || "document.pdf"))
  const contentType = sanitizeText(String(req.query.contentType || "application/pdf"))

  // Extension validation
  const extMatch = rawFilename.match(/\.[a-zA-Z0-9]+$/)
  const ext = extMatch ? extMatch[0].toLowerCase() : ".pdf"
  const allowed = [".pdf", ".doc", ".docx", ".ppt", ".pptx"]
  if (!allowed.includes(ext)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: `Unsupported file extension '${ext}'. Allowed: ${allowed.join(", ")}`,
    })
  }

  const s3Key = `resources/${resourceId}/v${versionNum}${ext}`
  const result = await generatePresignedUploadUrl(s3Key, contentType)

  return res.status(200).json({
    success: true,
    data: {
      uploadUrl: result.url,
      s3Key: result.s3Key,
      bucket: result.bucket,
      expiresInSeconds: result.expiresInSeconds,
      isSimulation: result.isMock,
    },
  })
}

export const uploadResource = async (req: AuthenticatedRequest, res: Response) => {
  const validation = validateResourceInput(req.body)
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      messages: validation.errors,
    })
  }

  const user = req.user
  const authorName = user?.name || "Open Contributor"
  const initials = authorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  const cleanTitle = sanitizeText(req.body.title)
  const cleanSubject = sanitizeText(req.body.subject)
  const cleanType = sanitizeText(req.body.type || "Study guide")
  const cleanDesc = sanitizeText(req.body.description || "")
  const cleanTags = Array.isArray(req.body.tags)
    ? req.body.tags.map((t: any) => sanitizeText(t)).filter(Boolean)
    : []
  const cleanLicense = sanitizeText(req.body.license || "Creative Commons BY 4.0")
  const cleanLink = req.body.link && isValidUrl(req.body.link) ? req.body.link.trim() : undefined

  const newId = Date.now()
  const s3Path = `s3://${awsConfig.s3.bucketName}/resources/${newId}/v1.pdf`

  const newItem: Item = {
    id: newId,
    title: cleanTitle,
    subject: cleanSubject,
    type: cleanType,
    author: authorName,
    initials,
    rating: 0,
    saves: 0,
    format: cleanLink ? "Link" : "PDF",
    updated: "Just now",
    description: cleanDesc,
    tags: cleanTags,
    color: req.body.color || "cobalt",
    pages: Math.max(1, Math.min(parseInt(req.body.pages || "12", 10), 500)),
    versions: 1,
    status: "pending", // Lands in moderation queue first
    license: cleanLicense,
    attribution: sanitizeText(req.body.attribution || "Contributor original work"),
    link: cleanLink,
    file: cleanLink ? undefined : s3Path,
    mine: true,
  }

  await dynamoDbService.putResource(newItem)

  const initialVersion: Version = {
    number: 1,
    note: "Initial upload",
    author: authorName,
    when: "Just now",
    file: s3Path,
    size: "1.5 MB",
  }

  await dynamoDbService.putVersion(newId, initialVersion)

  // Add system note
  await dynamoDbService.putNote({
    id: Date.now(),
    tone: "blue",
    icon: "upload",
    title: "Submission received",
    body: `Your resource "${cleanTitle}" has been queued for moderator review.`,
    when: "Just now",
    read: false,
  })

  return res.status(201).json({
    success: true,
    data: newItem,
  })
}

export const uploadRevision = async (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Invalid resource ID",
    })
  }

  const target = await dynamoDbService.getResourceById(resourceId)
  if (!target) {
    return res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Resource does not exist.",
    })
  }

  const cleanNote = sanitizeText(req.body.note || "Community improvements")
  const authorName = req.user?.name || "Community Contributor"

  const existing = await dynamoDbService.getVersions(resourceId)
  const newVersionNumber = (existing[0]?.number || target.versions) + 1
  const s3Path = `s3://${awsConfig.s3.bucketName}/resources/${resourceId}/v${newVersionNumber}.pdf`

  const newVer: Version = {
    number: newVersionNumber,
    note: cleanNote,
    author: authorName,
    when: "Just now",
    file: s3Path,
    size: "2.1 MB",
  }

  await dynamoDbService.putVersion(resourceId, newVer)

  target.versions = newVersionNumber
  target.updated = "Just now"
  await dynamoDbService.putResource(target)

  // Dispatch Amazon SNS notification to subscribers
  notifyResourceRevision(
    target.title,
    newVersionNumber,
    authorName,
    cleanNote,
    target.subject
  ).catch((err) => console.warn(`[SNS] Background notify error: ${err.message}`))

  return res.status(201).json({
    success: true,
    data: newVer,
  })
}

export const getVersions = async (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, error: "Invalid resource ID" })
  }

  const versionList = await dynamoDbService.getVersions(resourceId)
  return res.status(200).json({
    success: true,
    data: versionList,
  })
}

export const getFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, error: "Invalid resource ID" })
  }

  const feedbackList = await dynamoDbService.getFeedback(resourceId)
  return res.status(200).json({
    success: true,
    data: feedbackList,
  })
}

export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, error: "Invalid resource ID" })
  }

  const validation = validateFeedbackInput(req.body)
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      messages: validation.errors,
    })
  }

  const authorName = req.user?.name || "Anonymous Learner"
  const initials = authorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  const cleanComment = sanitizeText(req.body.text || "Rated this resource.")

  const newFeedback: Feedback = {
    id: Date.now(),
    author: authorName,
    initials,
    rating: req.body.rating || 5,
    text: cleanComment,
    when: "Just now",
    helpful: 0,
    replies: [],
  }

  await dynamoDbService.putFeedback(resourceId, newFeedback)

  // Recalculate average rating
  const allFeedback = await dynamoDbService.getFeedback(resourceId)
  const allRatings = allFeedback.map((f) => f.rating).filter(Boolean)
  if (allRatings.length > 0) {
    const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    const target = await dynamoDbService.getResourceById(resourceId)
    if (target) {
      target.rating = parseFloat(avg.toFixed(1))
      await dynamoDbService.putResource(target)
    }
  }

  return res.status(201).json({
    success: true,
    data: newFeedback,
  })
}

export const replyFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  const feedbackId = parseInt(req.params.feedbackId, 10)

  if (isNaN(resourceId) || isNaN(feedbackId)) {
    return res.status(400).json({ success: false, error: "Invalid resource or feedback ID" })
  }

  const text = sanitizeText(req.body.text)
  if (!text) {
    return res.status(400).json({ success: false, error: "Reply text is required" })
  }

  const authorName = req.user?.name || "Contributor"
  const initials = authorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  const reply = {
    id: Date.now(),
    author: authorName,
    initials,
    text,
    when: "Just now",
    role: req.user?.role || "learner",
  }

  const updatedFeedback = await dynamoDbService.addFeedbackReply(resourceId, feedbackId, reply)
  if (!updatedFeedback) {
    return res.status(404).json({ success: false, error: "Feedback comment not found" })
  }

  return res.status(201).json({
    success: true,
    data: reply,
  })
}

/**
 * Returns a pre-signed S3 GET URL for streaming/downloading educational files
 */
export const getPresignedDownloadUrl = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const resourceId = parseInt(req.params.id, 10)
  const versionNum = parseInt(String(req.query.version || "1"), 10)

  if (isNaN(resourceId) || isNaN(versionNum)) {
    return res.status(400).json({ success: false, error: "Invalid resource or version" })
  }

  const s3Key = `resources/${resourceId}/v${versionNum}.pdf`
  const result = await generatePresignedDownloadUrl(s3Key)

  return res.status(200).json({
    success: true,
    downloadUrl: result.url,
    s3Key: result.s3Key,
    expiresInSeconds: result.expiresInSeconds,
    isSimulation: result.isMock,
  })
}

export const getCollections = async (_req: AuthenticatedRequest, res: Response) => {
  const list = await dynamoDbService.getCollections()
  return res.status(200).json({
    success: true,
    data: list,
  })
}

export const createCollection = async (req: AuthenticatedRequest, res: Response) => {
  const name = sanitizeText(req.body.name)
  const description = sanitizeText(req.body.description || "")

  if (!name) {
    return res.status(400).json({ success: false, error: "Collection name is required" })
  }

  const newCol: Collection = {
    id: Date.now(),
    name,
    description,
    ids: Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [],
    tone: req.body.tone || "blue",
  }

  await dynamoDbService.putCollection(newCol)
  return res.status(201).json({ success: true, data: newCol })
}

export const getNotes = async (_req: AuthenticatedRequest, res: Response) => {
  const noteList = await dynamoDbService.getNotes()
  return res.status(200).json({
    success: true,
    data: noteList,
  })
}

export const markNoteRead = async (req: AuthenticatedRequest, res: Response) => {
  const noteId = parseInt(req.params.id, 10)
  await dynamoDbService.markNoteRead(noteId)
  return res.status(200).json({ success: true })
}

export const subscribeToNotifications = async (req: AuthenticatedRequest, res: Response) => {
  const email = sanitizeText(req.body.email || req.user?.email || "")
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "Valid email is required" })
  }

  const topicArn = awsConfig.sns.resourceUpdatesTopicArn
  const result = await subscribeEmailToTopic(topicArn, email)

  return res.status(200).json({
    success: true,
    message: result.isSimulation
      ? "Subscribed to OpenShelf updates (Simulation Mode)."
      : "Subscribed! Please check your email inbox to confirm the AWS SNS subscription.",
    data: result,
  })
}

