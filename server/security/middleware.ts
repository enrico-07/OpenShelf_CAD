import helmet from "helmet"
import cors from "cors"
import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import { config } from "./config.ts"
import { stripDangerousKeys } from "./validation.ts"
import type { AuthTokenPayload } from "../types.ts"

// Extend Express Request type to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload
}

/** Configures Helmet with production-grade security headers */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "http:", "https:", "ws:", "wss:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: config.nodeEnv === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
})

/** Strict CORS configuration matching allowed client origins */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests, wildcard, whitelisted origins, or any Vercel domain
    if (
      !origin ||
      config.corsOrigins.includes("*") ||
      config.corsOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      config.nodeEnv !== "production"
    ) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy rejection: Origin ${origin} is not permitted`))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset", "Retry-After"],
  maxAge: 86400, // 24 hours preflight cache
})

/** Middleware to sanitize request body and prevent prototype pollution */
export const sanitizeRequestBody = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body && typeof req.body === "object") {
    req.body = stripDangerousKeys(req.body)
  }
  next()
}

/** Verifies JWT Token and attaches user payload if present */
export const authenticateJwt = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.substring(7).trim()
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload
    req.user = decoded
  } catch {
    // Invalid or expired token; req.user remains undefined
  }
  next()
}

/** Enforces that the request must be authenticated with a valid JWT */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Authentication token is missing, invalid, or expired.",
    })
  }
  next()
}

/** Enforces Role-Based Access Control (RBAC) */
export const requireRole = (role: "learner" | "moderator") => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "You must be logged in to perform this action.",
      })
    }
    if (req.user.role !== role && req.user.role !== "moderator") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: `Action requires ${role} privileges. Your role is ${req.user.role}.`,
      })
    }
    next()
  }
}

/** Centralized secure error handler */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.status || err.statusCode || 500
  const isProd = config.nodeEnv === "production"

  // Log error securely server-side without leaking in client response
  console.error(`[Server Error] [Status ${statusCode}]:`, err.message || err)

  res.status(statusCode).json({
    success: false,
    error: err.name || "InternalServerError",
    message: isProd && statusCode === 500 ? "An unexpected server error occurred." : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  })
}
