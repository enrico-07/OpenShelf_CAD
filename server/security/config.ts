// Automatically load .env file if available (Node 20+)
try {
  process.loadEnvFile?.()
} catch {}

export interface SecurityConfig {
  port: number
  nodeEnv: string
  jwtSecret: string
  jwtExpiresIn: string
  moderatorSecretKey: string
  corsOrigins: string[]
  maxUploadSizeBytes: number
  rateLimits: {
    globalWindowMs: number
    globalMax: number
    authWindowMs: number
    authMax: number
    uploadWindowMs: number
    uploadMax: number
    actionWindowMs: number
    actionMax: number
  }
}

export const config: SecurityConfig = {
  port: parseInt(process.env.BACKEND_PORT || process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret:
    process.env.JWT_SECRET ||
    "openshelf-dev-secure-jwt-secret-key-change-in-production-random-256",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  moderatorSecretKey: process.env.MODERATOR_SECRET_KEY || "OPENSHELF_MOD_2026",
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : [
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
  maxUploadSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || "26214400", 10), // 25 MB
  rateLimits: {
    globalWindowMs: 15 * 60 * 1000, // 15 minutes
    globalMax: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || "200", 10),
    authWindowMs: 15 * 60 * 1000, // 15 minutes
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10", 10), // 10 attempts
    uploadWindowMs: 60 * 60 * 1000, // 1 hour
    uploadMax: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || "25", 10),
    actionWindowMs: 15 * 60 * 1000, // 15 minutes
    actionMax: parseInt(process.env.RATE_LIMIT_ACTION_MAX || "40", 10),
  },
}
