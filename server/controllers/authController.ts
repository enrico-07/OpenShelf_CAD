import jwt from "jsonwebtoken"
import type { Response } from "express"
import { config } from "../security/config.ts"
import {
  isValidEmail,
  sanitizeText,
} from "../security/validation.ts"
import type { AuthenticatedRequest } from "../security/middleware.ts"
import type { AuthTokenPayload, UserProfile } from "../types.ts"

export const loginUser = (req: AuthenticatedRequest, res: Response) => {
  const { email, role, name } = req.body

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "A valid email address is required.",
    })
  }

  const assignedRole = role === "moderator" ? "moderator" : "learner"
  const cleanName = sanitizeText(name) || (assignedRole === "moderator" ? "Community Moderator" : "Learner")
  const userId = `usr_${Date.now().toString(36)}`

  const payload: AuthTokenPayload = {
    userId,
    name: cleanName,
    email: email.trim().toLowerCase(),
    role: assignedRole,
  }

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: "7d",
  })

  const userProfile: UserProfile = {
    id: userId,
    name: cleanName,
    email: email.trim().toLowerCase(),
    role: assignedRole,
    avatarInitials: cleanName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
  }

  return res.status(200).json({
    success: true,
    token,
    user: userProfile,
  })
}

export const registerUser = (req: AuthenticatedRequest, res: Response) => {
  const { name, email, role, password } = req.body

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Full name must be at least 2 characters long.",
    })
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "A valid email address is required.",
    })
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Password must be at least 8 characters long.",
    })
  }

  const cleanName = sanitizeText(name)
  const assignedRole = role === "moderator" ? "moderator" : "learner"
  const userId = `usr_${Date.now().toString(36)}`

  const payload: AuthTokenPayload = {
    userId,
    name: cleanName,
    email: email.trim().toLowerCase(),
    role: assignedRole,
  }

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: "7d",
  })

  const userProfile: UserProfile = {
    id: userId,
    name: cleanName,
    email: email.trim().toLowerCase(),
    role: assignedRole,
    avatarInitials: cleanName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
  }

  return res.status(201).json({
    success: true,
    token,
    user: userProfile,
  })
}

export const getCurrentUser = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "No active session found.",
    })
  }

  return res.status(200).json({
    success: true,
    user: {
      id: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  })
}
