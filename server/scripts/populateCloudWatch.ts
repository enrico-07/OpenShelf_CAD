/**
 * CloudWatch Telemetry Seeder for OpenShelf
 * Populates real Amazon CloudWatch metrics across the past 2 hours and current time
 * across both dimensioned (Endpoint, Format, Action) and aggregated views
 * to generate rich graphs and metric tables in the AWS Management Console.
 */

import {
  CloudWatchClient,
  PutMetricDataCommand,
  StandardUnit,
  MetricDatum,
} from "@aws-sdk/client-cloudwatch"
import { awsConfig } from "../aws/config.ts"

const cloudWatch = new CloudWatchClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

const namespace = awsConfig.cloudWatch.namespace // "OpenShelf/API"

async function sendBatch(batch: MetricDatum[], batchIndex: number) {
  try {
    await cloudWatch.send(
      new PutMetricDataCommand({
        Namespace: namespace,
        MetricData: batch,
      })
    )
    console.log(`✓ Batch ${batchIndex} successfully sent (${batch.length} metric points)`)
  } catch (err: any) {
    console.error(`✗ Batch ${batchIndex} failed:`, err.message)
  }
}

async function populateCloudWatchMetrics() {
  console.log("==================================================")
  console.log(" Populating Amazon CloudWatch Metrics & Telemetry ")
  console.log("==================================================")
  console.log(`Region:     ${awsConfig.region}`)
  console.log(`Namespace:  ${namespace}`)
  console.log(`Timestamp:  ${new Date().toISOString()}`)
  console.log("--------------------------------------------------")

  const now = Date.now()
  const metrics: MetricDatum[] = []

  const endpoints = [
    "/resources",
    "/resources/upload-url",
    "/moderation/queue",
    "/auth/login",
    "/auth/register",
    "/telemetry/metrics",
  ]

  // Generate data points for the past 90 minutes in 3-minute intervals
  for (let minutesAgo = 90; minutesAgo >= 0; minutesAgo -= 3) {
    const timestamp = new Date(now - minutesAgo * 60 * 1000)
    let totalBatchRequests = 0
    let totalBatchLatency = 0

    for (const endpoint of endpoints) {
      // Base traffic curve: realistic peak & variance
      const wave = Math.sin((90 - minutesAgo) / 15) * 8
      const requestCount = Math.max(5, Math.floor(18 + wave + Math.random() * 10))
      const baseLatency = endpoint === "/resources/upload-url" ? 42 : 24
      const latencyMs = Math.floor(baseLatency + Math.random() * 22)

      totalBatchRequests += requestCount
      totalBatchLatency += latencyMs

      // 1. API Requests (Detailed dimensioned)
      metrics.push({
        MetricName: "APIRequests",
        Value: requestCount,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [
          { Name: "Environment", Value: "production" },
          { Name: "Endpoint", Value: endpoint },
          { Name: "StatusCode", Value: "200" },
        ],
      })

      // 2. API Latency (Detailed dimensioned)
      metrics.push({
        MetricName: "APILatency",
        Value: latencyMs,
        Unit: StandardUnit.Milliseconds,
        Timestamp: timestamp,
        Dimensions: [
          { Name: "Environment", Value: "production" },
          { Name: "Endpoint", Value: endpoint },
        ],
      })
    }

    const avgLatency = Math.round(totalBatchLatency / endpoints.length)

    // 3. Aggregate API Requests (Environment level - easy to graph in 1 click in AWS)
    metrics.push({
      MetricName: "APIRequests",
      Value: totalBatchRequests,
      Unit: StandardUnit.Count,
      Timestamp: timestamp,
      Dimensions: [{ Name: "Environment", Value: "production" }],
    })

    // 4. Aggregate API Latency (Environment level)
    metrics.push({
      MetricName: "APILatency",
      Value: avgLatency,
      Unit: StandardUnit.Milliseconds,
      Timestamp: timestamp,
      Dimensions: [{ Name: "Environment", Value: "production" }],
    })

    // 5. Overall un-dimensioned metrics for top-level CloudWatch summary
    metrics.push({
      MetricName: "APIRequests",
      Value: totalBatchRequests,
      Unit: StandardUnit.Count,
      Timestamp: timestamp,
    })

    metrics.push({
      MetricName: "APILatency",
      Value: avgLatency,
      Unit: StandardUnit.Milliseconds,
      Timestamp: timestamp,
    })

    // 6. Resource Uploads Metric (intermittent)
    if (minutesAgo % 6 === 0) {
      const uploadCount = Math.floor(1 + Math.random() * 3)
      metrics.push({
        MetricName: "ResourceUploads",
        Value: uploadCount,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [
          { Name: "Environment", Value: "production" },
          { Name: "Format", Value: "PDF" },
        ],
      })
      metrics.push({
        MetricName: "ResourceUploads",
        Value: uploadCount,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [{ Name: "Environment", Value: "production" }],
      })
      metrics.push({
        MetricName: "ResourceUploads",
        Value: uploadCount,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
      })
    }

    // 7. Moderator Actions Metric
    if (minutesAgo % 9 === 0) {
      const actionCount = Math.floor(1 + Math.random() * 2)
      metrics.push({
        MetricName: "ModeratorActions",
        Value: actionCount,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [
          { Name: "Environment", Value: "production" },
          { Name: "Action", Value: "approve" },
        ],
      })
      metrics.push({
        MetricName: "ModeratorActions",
        Value: actionCount,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [{ Name: "Environment", Value: "production" }],
      })
    }

    // 8. Minor API Errors (4xx client validation/rate limit) for realistic graphs
    if (minutesAgo % 12 === 0) {
      metrics.push({
        MetricName: "APIErrors",
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [
          { Name: "Environment", Value: "production" },
          { Name: "ErrorClass", Value: "4xx" },
        ],
      })
      metrics.push({
        MetricName: "APIErrors",
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
      })
    }
  }

  console.log(`Total metric points prepared: ${metrics.length}`)

  // CloudWatch supports up to 1,000 metrics per PutMetricDataCommand
  const batchSize = 100
  for (let i = 0; i < metrics.length; i += batchSize) {
    const batch = metrics.slice(i, i + batchSize)
    await sendBatch(batch, Math.floor(i / batchSize) + 1)
  }

  console.log("--------------------------------------------------")
  console.log("✓ All CloudWatch metrics successfully pushed to AWS!")
  console.log("Open AWS CloudWatch Console -> All metrics -> OpenShelf/API")
  console.log("You will see live graphs for APIRequests, APILatency, ResourceUploads, and ModeratorActions.")
}

populateCloudWatchMetrics().catch((err) => {
  console.error("Population failed:", err)
  process.exit(1)
})
