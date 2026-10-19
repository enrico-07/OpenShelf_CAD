import jwt from "jsonwebtoken"
import type { Response } from "express"
import { config } from "../security/config.ts"
import {
  isValidEmail,
  sanitizeText,
} from "../security/validation.ts"
import type { AuthenticatedRequest } from "../security/middleware.ts"
import type { AuthTokenPayload, UserProfile } from "../types.ts"
import {
  cognitoSignUp,
  cognitoConfirmSignUp,
  cognitoSignIn,
} from "../aws/cognitoClient.ts"
import { awsConfig } from "../aws/config.ts"

export const loginUser = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, role, name, moderatorCode } = req.body

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "A valid email address is required.",
    })
  }

  let assignedRole: "learner" | "moderator" = role === "moderator" ? "moderator" : "learner"

  // Security Gate: Enforce passkey for moderator access
  if (role === "moderator") {
    const expectedKey = config.moderatorSecretKey || "OPENSHELF_MOD_2026"
    if (!moderatorCode || moderatorCode.trim() !== expectedKey.trim()) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Invalid or missing Moderator Security Passkey.",
      })
    }
  }

  // 1. If Cognito is configured and password is provided, attempt Cognito auth
  if (awsConfig.isConfigured && awsConfig.cognito.clientId && password) {
    const cognitoResult = await cognitoSignIn(email, password)
    if (cognitoResult.success && cognitoResult.token) {
      return res.status(200).json({
        success: true,
        token: cognitoResult.token,
        provider: "Amazon Cognito",
        user: {
          id: email,
          name: name || email.split("@")[0],
          email: email.trim().toLowerCase(),
          role: assignedRole,
        },
      })
    }
  }

  // 2. Standard local JWT fallback
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
    provider: "OpenShelf Local / Cognito Fallback",
    user: userProfile,
  })
}

export const registerUser = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, role, password, moderatorCode } = req.body

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

  let assignedRole: "learner" | "moderator" = role === "moderator" ? "moderator" : "learner"

  // Security Gate: Enforce passkey for moderator registration
  if (role === "moderator") {
    const expectedKey = config.moderatorSecretKey || "OPENSHELF_MOD_2026"
    if (!moderatorCode || moderatorCode.trim() !== expectedKey.trim()) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "A valid Moderator Security Passkey is required to create a moderator account.",
      })
    }
  }

  const cleanName = sanitizeText(name)
  const userId = `usr_${Date.now().toString(36)}`

  // Register in Amazon Cognito (or simulation)
  const cognitoRes = await cognitoSignUp(email, password, cleanName, assignedRole)

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
    id: cognitoRes.user?.id || userId,
    name: cleanName,
    email: email.trim().toLowerCase(),
    role: assignedRole,
    avatarInitials: cleanName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
  }

  return res.status(201).json({
    success: true,
    token,
    provider: cognitoRes.isSimulation ? "Local Simulation" : "Amazon Cognito",
    message: cognitoRes.message,
    user: userProfile,
  })
}

export const upgradeRole = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "You must be signed in to upgrade your role.",
    })
  }

  const { moderatorCode } = req.body
  const expectedKey = config.moderatorSecretKey || "OPENSHELF_MOD_2026"
  if (!moderatorCode || moderatorCode.trim() !== expectedKey.trim()) {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Invalid Moderator Security Passkey. Upgrade denied.",
    })
  }

  const payload: AuthTokenPayload = {
    userId: req.user.userId,
    name: req.user.name,
    email: req.user.email,
    role: "moderator",
  }

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" })

  return res.status(200).json({
    success: true,
    token,
    user: {
      id: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: "moderator",
    },
    message: "Role successfully upgraded to Community Moderator.",
  })
}

export const confirmUser = async (req: AuthenticatedRequest, res: Response) => {
  const { email, code } = req.body
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Email and verification code are required.",
    })
  }

  const result = await cognitoConfirmSignUp(email, code)
  return res.status(result.success ? 200 : 400).json(result)
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
