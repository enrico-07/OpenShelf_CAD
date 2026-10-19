/**
 * Telemetry Middleware for OpenShelf
 * Automatically captures request latency and response status for CloudWatch.
 */

import type { Request, Response, NextFunction } from "express"
import { recordApiTelemetry } from "./cloudwatchClient.ts"

export function telemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - startTime
    // Don't track static asset requests or health checks to prevent metric spam
    if (req.path.startsWith("/api") && !req.path.includes("/health")) {
      recordApiTelemetry(req.baseUrl + req.path, res.statusCode, duration)
    }
  })

  next()
}

export default telemetryMiddleware
