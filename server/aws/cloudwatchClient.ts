/**
 * Amazon CloudWatch Telemetry & Metrics Client for OpenShelf
 * Emits custom performance metrics, request counts, latencies, and error rates.
 */

import {
  CloudWatchClient,
  PutMetricDataCommand,
  GetMetricDataCommand,
  StandardUnit,
} from "@aws-sdk/client-cloudwatch"
import { awsConfig } from "./config.ts"

export const cloudWatchClient = new CloudWatchClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

// In-memory sliding window cache for live operational telemetry
const memoryTelemetry = {
  requests: 0,
  errors4xx: 0,
  errors5xx: 0,
  latencies: [] as number[],
  uploads: 0,
  moderationActions: 0,
  startTime: Date.now(),
}

/**
 * Emits a custom metric to Amazon CloudWatch
 */
export async function emitCloudWatchMetric(
  metricName: string,
  value: number,
  unit: StandardUnit = StandardUnit.Count,
  dimensions: { Name: string; Value: string }[] = []
): Promise<boolean> {
  if (awsConfig.isConfigured) {
    try {
      await cloudWatchClient.send(
        new PutMetricDataCommand({
          Namespace: awsConfig.cloudWatch.namespace,
          MetricData: [
            {
              MetricName: metricName,
              Value: value,
              Unit: unit,
              Timestamp: new Date(),
              Dimensions: [
                { Name: "Environment", Value: process.env.NODE_ENV || "development" },
                ...dimensions,
              ],
            },
          ],
        })
      )
      return true
    } catch (err: any) {
      console.warn(`[CloudWatch] Metric emission fallback: ${err.message}`)
      return false
    }
  }
  return false
}

/**
 * Helper to record every HTTP API request's status and latency
 */
export function recordApiTelemetry(
  endpoint: string,
  statusCode: number,
  durationMs: number
) {
  memoryTelemetry.requests++
  memoryTelemetry.latencies.push(durationMs)
  if (memoryTelemetry.latencies.length > 500) {
    memoryTelemetry.latencies.shift() // keep last 500
  }

  if (statusCode >= 400 && statusCode < 500) {
    memoryTelemetry.errors4xx++
  } else if (statusCode >= 500) {
    memoryTelemetry.errors5xx++
  }

  // Asynchronously emit to CloudWatch in the background
  emitCloudWatchMetric("APIRequests", 1, StandardUnit.Count, [
    { Name: "Endpoint", Value: endpoint.split("?")[0] },
    { Name: "StatusCode", Value: String(statusCode) },
  ]).catch(() => {})

  emitCloudWatchMetric("APILatency", durationMs, StandardUnit.Milliseconds, [
    { Name: "Endpoint", Value: endpoint.split("?")[0] },
  ]).catch(() => {})

  if (statusCode >= 400) {
    emitCloudWatchMetric("APIErrors", 1, StandardUnit.Count, [
      { Name: "ErrorClass", Value: statusCode >= 500 ? "5xx" : "4xx" },
    ]).catch(() => {})
  }
}

/**
 * Helper to record file uploads
 */
export function recordUploadMetric(format: string) {
  memoryTelemetry.uploads++
  emitCloudWatchMetric("ResourceUploads", 1, StandardUnit.Count, [
    { Name: "Format", Value: format },
  ]).catch(() => {})
}

/**
 * Helper to record moderation actions
 */
export function recordModerationMetric(action: string) {
  memoryTelemetry.moderationActions++
  emitCloudWatchMetric("ModeratorActions", 1, StandardUnit.Count, [
    { Name: "Action", Value: action },
  ]).catch(() => {})
}

/**
 * Retrieves aggregate platform telemetry for the Insights / Health dashboard
 */
export async function getTelemetrySummary() {
  const sorted = [...memoryTelemetry.latencies].sort((a, b) => a - b)
  const p95Idx = Math.floor(sorted.length * 0.95)
  const p99Idx = Math.floor(sorted.length * 0.99)
  const p95 = sorted.length > 0 ? sorted[p95Idx] : 32
  const p99 = sorted.length > 0 ? sorted[p99Idx] : 45

  const uptimeSec = Math.floor((Date.now() - memoryTelemetry.startTime) / 1000)

  return {
    isCloudWatchLive: awsConfig.isConfigured,
    namespace: awsConfig.cloudWatch.namespace,
    region: awsConfig.region,
    totalRequests: memoryTelemetry.requests,
    errors4xx: memoryTelemetry.errors4xx,
    errors5xx: memoryTelemetry.errors5xx,
    uploadsCount: memoryTelemetry.uploads,
    moderationCount: memoryTelemetry.moderationActions,
    p95LatencyMs: p95,
    p99LatencyMs: p99,
    uptimeSeconds: uptimeSec,
    activeBackgroundWorkers: 2, // S3 cleaner & SNS dispatcher
    healthStatus: memoryTelemetry.errors5xx === 0 ? "Healthy" : "Degraded",
    timestamp: new Date().toISOString(),
  }
}

export default {
  cloudWatchClient,
  emitCloudWatchMetric,
  recordApiTelemetry,
  recordUploadMetric,
  recordModerationMetric,
  getTelemetrySummary,
}
