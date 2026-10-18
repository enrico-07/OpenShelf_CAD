import rateLimit from "express-rate-limit"
import { config } from "./config.ts"
import type { Request, Response } from "express"

const createRateLimiterResponse = (message: string) => {
  return (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too Many Requests",
      message,
      retryAfterSeconds: Math.ceil(
        Number(res.getHeader("Retry-After") || 60),
      ),
    })
  }
}

/** Global Rate Limiter to protect all API endpoints against DoS */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimits.globalWindowMs,
  max: config.rateLimits.globalMax,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: createRateLimiterResponse(
    "Overall request rate limit exceeded. Please wait a few minutes before trying again.",
  ),
})

/** Strict Rate Limiter for Authentication endpoints to prevent brute-force attacks */
export const authRateLimiter = rateLimit({
  windowMs: config.rateLimits.authWindowMs,
  max: config.rateLimits.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimiterResponse(
    "Too many login or registration attempts. For security reasons, please try again in 15 minutes.",
  ),
})

/** Rate Limiter for Resource uploads and revisions to prevent storage flooding */
export const uploadRateLimiter = rateLimit({
  windowMs: config.rateLimits.uploadWindowMs,
  max: config.rateLimits.uploadMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimiterResponse(
    "Upload rate limit reached. To maintain platform quality, you can submit up to 25 items per hour.",
  ),
})

/** Rate Limiter for User interactions (feedback, comments, reports) to prevent spam */
export const actionRateLimiter = rateLimit({
  windowMs: config.rateLimits.actionWindowMs,
  max: config.rateLimits.actionMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimiterResponse(
    "Action rate limit exceeded. Please wait a moment before posting additional feedback or reports.",
  ),
})
