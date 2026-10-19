/**
 * AWS Lambda Function: OpenShelf Scheduled Weekly Digest & S3 Cleanup
 * Triggered periodically by Amazon EventBridge (Rule: cron(0 12 ? * MON *)).
 *
 * Responsibilities:
 * 1. Queries DynamoDB for trending resources.
 * 2. Compiles a weekly digest email.
 * 3. Publishes digest via Amazon SNS to subscribed students.
 * 4. Emits execution status metrics to Amazon CloudWatch.
 */

import { dynamoDbService } from "../services/dynamoDbService.ts"
import { publishToTopic } from "../aws/snsClient.ts"
import { emitCloudWatchMetric } from "../aws/cloudwatchClient.ts"
import { awsConfig } from "../aws/config.ts"
import { StandardUnit } from "@aws-sdk/client-cloudwatch"

export interface ScheduledEvent {
  source?: string
  "detail-type"?: string
  time?: string
}

export const handler = async (event: ScheduledEvent = {}) => {
  console.log("[Lambda EventBridge] Weekly Digest Task Triggered at:", event.time || new Date().toISOString())
  const startTime = Date.now()

  try {
    // 1. Query Top Rated & Recent Resources from DynamoDB
    const items = await dynamoDbService.getResources({ isModerator: false })
    const topItems = [...items]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)

    console.log(`[Lambda] Found ${items.length} total resources; selected top ${topItems.length} for digest.`)

    // 2. Format Digest Message
    const digestContent = topItems
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.title} (${it.subject}) - ★ ${it.rating || "New"} | By ${it.author}`
      )
      .join("\n")

    const emailSubject = "📚 OpenShelf Weekly Digest: Top Study Materials"
    const emailBody = `Hello OpenShelf Community!

Here are the top-rated educational resources shared this week:

${digestContent || "New resources are being reviewed by moderators!"}

Visit OpenShelf to explore, download, and contribute improved revisions:
https://openshelf.edu/discover

--
Automated Weekly Digest
Powered by AWS Lambda & Amazon EventBridge`

    // 3. Publish via Amazon SNS Topic
    const topicArn = awsConfig.sns.resourceUpdatesTopicArn
    if (topicArn) {
      await publishToTopic(topicArn, emailSubject, emailBody)
      console.log("[Lambda] Successfully dispatched weekly digest via Amazon SNS.")
    } else {
      console.log("[Lambda] SNS topic ARN not configured, simulated dispatch complete.")
    }

    // 4. Emit Success Telemetry to Amazon CloudWatch
    const duration = Date.now() - startTime
    await emitCloudWatchMetric("ScheduledDigestSuccess", 1, StandardUnit.Count)
    await emitCloudWatchMetric("ScheduledDigestDuration", duration, StandardUnit.Milliseconds)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Weekly digest published successfully via EventBridge + Lambda + SNS",
        topItemsCount: topItems.length,
        executionDurationMs: duration,
      }),
    }
  } catch (err: any) {
    console.error("[Lambda Error] Failed to generate digest:", err.message)
    await emitCloudWatchMetric("ScheduledDigestFailure", 1, StandardUnit.Count)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "ScheduledDigestFailed",
        message: err.message,
      }),
    }
  }
}

// Allow local standalone execution: node server/lambda/scheduledDigest.ts
if (process.argv[1] && process.argv[1].includes("scheduledDigest")) {
  handler({ source: "local-cli", time: new Date().toISOString() }).then((res) => {
    console.log("Local execution result:", res)
  })
}

export default handler
