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
import type {
  Item,
  Version,
  Feedback,
  Note,
  Collection,
  Status,
} from "../types.ts"

// Initial data storage seeded with platform resources
let items: Item[] = [
  {
    id: 1,
    title: "Introduction to Operating Systems & Concurrency",
    subject: "Computer Science",
    type: "Study guide",
    author: "Alex Kim",
    initials: "AK",
    rating: 4.8,
    saves: 1420,
    format: "PDF",
    updated: "2 days ago",
    description: "Threads, mutexes, deadlocks, and virtual memory paging with diagrams and practice exam questions.",
    tags: ["OS", "Concurrency", "C", "Threads"],
    color: "cobalt",
    pages: 24,
    versions: 3,
    featured: true,
    status: "approved",
    license: "Creative Commons BY 4.0",
    mine: true,
  },
  {
    id: 2,
    title: "Linear Algebra & Matrix Decompositions",
    subject: "Mathematics",
    type: "Revision notes",
    author: "Dr. Elena Rostova",
    initials: "ER",
    rating: 4.9,
    saves: 980,
    format: "PDF",
    updated: "1 week ago",
    description: "Eigenvalues, SVD, Jordan canonical forms, and orthogonal projections explained with geometric intuition.",
    tags: ["Matrices", "Eigenvalues", "SVD"],
    color: "violet",
    pages: 18,
    versions: 2,
    featured: true,
    status: "approved",
    license: "Creative Commons BY-NC 4.0",
  },
  {
    id: 3,
    title: "Organic Reaction Mechanisms Quick Reference",
    subject: "Chemistry",
    type: "Study guide",
    author: "Maya Chen",
    initials: "MC",
    rating: 4.6,
    saves: 650,
    format: "PDF",
    updated: "3 weeks ago",
    description: "Sn1, Sn2, E1, E2 mechanisms with curly arrow conventions, solvent effects, and stereochemistry outcomes.",
    tags: ["Organic", "Reactions", "Mechanisms"],
    color: "tangerine",
    pages: 14,
    versions: 1,
    status: "approved",
    license: "Creative Commons BY 4.0",
  },
  {
    id: 6,
    title: "Biochemical Pathways & Cellular Respiration",
    subject: "Chemistry",
    type: "Reading list",
    author: "Anonymous Contributor",
    initials: "AC",
    rating: 3.8,
    saves: 120,
    format: "PDF",
    updated: "Just now",
    description: "Unverified summary of glycolysis, Krebs cycle, and oxidative phosphorylation.",
    tags: ["Biology", "Biochemistry"],
    color: "tangerine",
    pages: 8,
    versions: 1,
    status: "reported",
    reportReason: "Shared without permission",
    license: "Creative Commons BY 4.0",
  },
]

let versions: Record<number, Version[]> = {
  1: [
    {
      number: 3,
      note: "Added memory paging and TLB walkthrough with updated memory layout diagrams",
      author: "Alex Kim",
      when: "2 days ago",
      file: "s3://openshelf-files/1/v3.pdf",
      size: "2.4 MB",
    },
    {
      number: 2,
      note: "Expanded deadlocks prevention algorithms and added Dining Philosophers simulation",
      author: "Alex Kim",
      when: "2 weeks ago",
      file: "s3://openshelf-files/1/v2.pdf",
      size: "2.1 MB",
    },
    {
      number: 1,
      note: "Initial upload: processes, threads, synchronization primitives",
      author: "Alex Kim",
      when: "1 month ago",
      file: "s3://openshelf-files/1/v1.pdf",
      size: "1.8 MB",
    },
  ],
  2: [
    {
      number: 2,
      note: "Corrected singular value proofs and clarified pseudo-inverse formula",
      author: "Dr. Elena Rostova",
      when: "1 week ago",
      file: "s3://openshelf-files/2/v2.pdf",
      size: "1.9 MB",
    },
    {
      number: 1,
      note: "Initial version covering vector spaces, rank-nullity, and Gram-Schmidt",
      author: "Dr. Elena Rostova",
      when: "3 weeks ago",
      file: "s3://openshelf-files/2/v1.pdf",
      size: "1.6 MB",
    },
  ],
  3: [
    {
      number: 1,
      note: "Initial compilation of reaction conditions and mechanisms",
      author: "Maya Chen",
      when: "3 weeks ago",
      file: "s3://openshelf-files/3/v1.pdf",
      size: "1.2 MB",
    },
  ],
  6: [
    {
      number: 1,
      note: "Initial upload",
      author: "Anonymous Contributor",
      when: "Just now",
      file: "s3://openshelf-files/6/v1.pdf",
      size: "0.8 MB",
    },
  ],
}

let feedback: Record<number, Feedback[]> = {
  1: [
    {
      id: 101,
      author: "Jordan Lee",
      initials: "JL",
      rating: 5,
      text: "The diagram explaining condition variables and semaphores saved my OS midterm grade. Extremely well structured!",
      when: "1 day ago",
      helpful: 14,
      replies: [
        {
          id: 1011,
          author: "Alex Kim",
          initials: "AK",
          text: "Thanks Jordan! Working on adding spinlocks comparison in v4.",
          when: "1 day ago",
          role: "author",
        },
      ],
    },
    {
      id: 102,
      author: "Sam Rivera",
      initials: "SR",
      rating: 5,
      text: "Comprehensive notes and practical exam drill questions included at the end of each chapter.",
      when: "3 days ago",
      helpful: 8,
    },
  ],
}

let notes: Note[] = [
  {
    id: 1,
    tone: "blue",
    icon: "versions",
    title: "New revision available",
    body: "Alex Kim published Version 3 of Introduction to Operating Systems.",
    when: "2 days ago",
    read: false,
  },
  {
    id: 2,
    tone: "green",
    icon: "check",
    title: "Resource verified",
    body: "Your submission Linear Algebra Revision Notes has been community verified.",
    when: "1 week ago",
    read: true,
  },
]

let collections: Collection[] = [
  {
    id: 1,
    name: "CS Core Curriculum",
    description: "Foundational materials covering operating systems, algorithms, and networks.",
    ids: [1],
    tone: "blue",
  },
  {
    id: 2,
    name: "Math & Analytics",
    description: "Essential linear algebra, calculus, and probability guides.",
    ids: [2],
    tone: "violet",
  },
]

export const getResources = (req: AuthenticatedRequest, res: Response) => {
  const query = sanitizeText(req.query.q || "")
  const subject = sanitizeText(req.query.subject || "")
  const format = sanitizeText(req.query.format || "")
  const statusFilter = sanitizeText(req.query.status || "")

  let filtered = [...items]

  // Default: only approved and reported items for regular users
  if (!req.user || req.user.role !== "moderator") {
    filtered = filtered.filter(
      (it) => it.status === "approved" || it.status === "reported",
    )
  } else if (statusFilter) {
    filtered = filtered.filter((it) => it.status === statusFilter)
  }

  if (query) {
    const qLower = query.toLowerCase()
    filtered = filtered.filter(
      (it) =>
        it.title.toLowerCase().includes(qLower) ||
        it.subject.toLowerCase().includes(qLower) ||
        it.description.toLowerCase().includes(qLower) ||
        it.tags.some((t) => t.toLowerCase().includes(qLower)),
    )
  }

  if (subject) {
    filtered = filtered.filter((it) => it.subject === subject)
  }

  if (format && format !== "Any format") {
    filtered = filtered.filter((it) => it.format === format)
  }

  return res.status(200).json({
    success: true,
    data: filtered,
    total: filtered.length,
  })
}

export const getResourceById = (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Resource ID must be an integer.",
    })
  }

  const resource = items.find((it) => it.id === id)
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

export const uploadResource = (req: AuthenticatedRequest, res: Response) => {
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
    status: "pending", // Always lands in moderation queue first
    license: cleanLicense,
    attribution: sanitizeText(req.body.attribution || "Contributor original work"),
    link: cleanLink,
    file: cleanLink ? undefined : `s3://openshelf-files/${newId}/v1.pdf`,
    mine: true,
  }

  items.unshift(newItem)

  versions[newId] = [
    {
      number: 1,
      note: "Initial upload",
      author: authorName,
      when: "Just now",
      file: `s3://openshelf-files/${newId}/v1.pdf`,
      size: "1.5 MB",
    },
  ]

  // Add system note
  notes.unshift({
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

export const uploadRevision = (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Invalid resource ID",
    })
  }

  const target = items.find((it) => it.id === resourceId)
  if (!target) {
    return res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Resource does not exist.",
    })
  }

  const cleanNote = sanitizeText(req.body.note || "Community improvements")
  const authorName = req.user?.name || "Community Contributor"

  const existing = versions[resourceId] || []
  const newVersionNumber = (existing[0]?.number || target.versions) + 1

  const newVer: Version = {
    number: newVersionNumber,
    note: cleanNote,
    author: authorName,
    when: "Just now",
    file: `s3://openshelf-files/${resourceId}/v${newVersionNumber}.pdf`,
    size: "2.1 MB",
  }

  versions[resourceId] = [newVer, ...existing]
  target.versions = newVersionNumber
  target.updated = "Just now"

  return res.status(201).json({
    success: true,
    data: newVer,
  })
}

export const getVersions = (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, error: "Invalid resource ID" })
  }

  return res.status(200).json({
    success: true,
    data: versions[resourceId] || [],
  })
}

export const getFeedback = (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  if (isNaN(resourceId)) {
    return res.status(400).json({ success: false, error: "Invalid resource ID" })
  }

  return res.status(200).json({
    success: true,
    data: feedback[resourceId] || [],
  })
}

export const submitFeedback = (req: AuthenticatedRequest, res: Response) => {
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

  feedback[resourceId] = [newFeedback, ...(feedback[resourceId] || [])]

  // Update resource average rating
  const allRatings = feedback[resourceId].map((f) => f.rating).filter(Boolean)
  const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length
  const target = items.find((it) => it.id === resourceId)
  if (target) {
    target.rating = parseFloat(avg.toFixed(1))
  }

  return res.status(201).json({
    success: true,
    data: newFeedback,
  })
}

export const replyFeedback = (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id, 10)
  const feedbackId = parseInt(req.params.feedbackId, 10)

  if (isNaN(resourceId) || isNaN(feedbackId)) {
    return res.status(400).json({ success: false, error: "Invalid resource or feedback ID" })
  }

  const text = sanitizeText(req.body.text)
  if (!text) {
    return res.status(400).json({ success: false, error: "Reply text is required" })
  }

  const list = feedback[resourceId] || []
  const targetFeedback = list.find((f) => f.id === feedbackId)
  if (!targetFeedback) {
    return res.status(404).json({ success: false, error: "Feedback comment not found" })
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

  targetFeedback.replies = [...(targetFeedback.replies || []), reply]

  return res.status(201).json({
    success: true,
    data: reply,
  })
}

export const getPresignedDownloadUrl = (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const resourceId = parseInt(req.params.id, 10)
  const versionNum = parseInt(String(req.query.version || "1"), 10)

  if (isNaN(resourceId) || isNaN(versionNum)) {
    return res.status(400).json({ success: false, error: "Invalid resource or version" })
  }

  // Create HMAC SHA-256 signature for secure time-limited access (5 minutes)
  const expires = Math.floor(Date.now() / 1000) + 300 // 300 seconds
  const stringToSign = `GET\nopenshelf-files\n${resourceId}/v${versionNum}.pdf\n${expires}`
  const signature = crypto
    .createHmac("sha256", config.jwtSecret)
    .update(stringToSign)
    .digest("hex")

  const downloadUrl = `https://s3.amazonaws.com/openshelf-files/${resourceId}/v${versionNum}.pdf?token=${signature}&expires=${expires}`

  return res.status(200).json({
    success: true,
    downloadUrl,
    expiresInSeconds: 300,
  })
}

export const getCollections = (_req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    data: collections,
  })
}

export const createCollection = (req: AuthenticatedRequest, res: Response) => {
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

  collections.push(newCol)
  return res.status(201).json({ success: true, data: newCol })
}

export const getNotes = (_req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    data: notes,
  })
}

export const markNoteRead = (req: AuthenticatedRequest, res: Response) => {
  const noteId = parseInt(req.params.id, 10)
  const target = notes.find((n) => n.id === noteId)
  if (target) {
    target.read = true
  }
  return res.status(200).json({ success: true })
}

export { items }
