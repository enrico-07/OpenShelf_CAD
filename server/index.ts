import express from "express"
import { config } from "./security/config.ts"
import {
  helmetMiddleware,
  corsMiddleware,
  sanitizeRequestBody,
  authenticateJwt,
  errorHandler,
} from "./security/middleware.ts"
import { globalRateLimiter } from "./security/rateLimiters.ts"
import { telemetryMiddleware } from "./aws/telemetryMiddleware.ts"
import apiRoutes from "./routes/api.ts"

const app = express()

// Trust first proxy if behind reverse proxy/load balancer
app.set("trust proxy", 1)

// 0. CloudWatch Live Telemetry Tracker
app.use(telemetryMiddleware)

// 1. Security Headers via Helmet
app.use(helmetMiddleware)

// 2. Strict Cross-Origin Resource Sharing (CORS)
app.use(corsMiddleware)

// 3. Global DoS & Brute-force Rate Limiting
app.use(globalRateLimiter)

// 4. Body parsing with strict payload size caps to prevent memory exhaustion
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))

// 5. Prototype pollution & input sanitization
app.use(sanitizeRequestBody)

// 6. JWT Authentication & Context Extraction
app.use(authenticateJwt)

// 7. Mount Core API Endpoints
app.use("/api", apiRoutes)

// 8. 404 Handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "NotFound",
    message: "The requested API resource does not exist.",
  })
})

// 9. Centralized Error Handler (no stack leaks in production)
app.use(errorHandler)

// Start Server if directly executed
const port = config.port
const server = app.listen(port, () => {
  console.log(`[OpenShelf Server] Running securely on port ${port} in ${config.nodeEnv} mode`)
})

export { app, server }
export default app
