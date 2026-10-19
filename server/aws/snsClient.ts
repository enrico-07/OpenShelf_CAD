/**
 * Amazon SNS (Simple Notification Service) Client for OpenShelf
 * Dispatches real-time email notifications for resource updates,
 * community revisions, and moderation decisions.
 */

import {
  SNSClient,
  PublishCommand,
  SubscribeCommand,
  ListSubscriptionsByTopicCommand,
} from "@aws-sdk/client-sns"
import { awsConfig } from "./config.ts"

export const snsClient = new SNSClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

export interface NotificationResult {
  success: boolean
  messageId?: string
  topicArn?: string
  isSimulation: boolean
}

/**
 * Publishes a broadcast message to an Amazon SNS topic
 */
export async function publishToTopic(
  topicArn: string,
  subject: string,
  message: string
): Promise<NotificationResult> {
  if (awsConfig.isConfigured && topicArn) {
    try {
      const res = await snsClient.send(
        new PublishCommand({
          TopicArn: topicArn,
          Subject: subject.slice(0, 100), // SNS subject length limit
          Message: message,
        })
      )
      console.log(`[SNS] Dispatched message to ${topicArn} (ID: ${res.MessageId})`)
      return {
        success: true,
        messageId: res.MessageId,
        topicArn,
        isSimulation: false,
      }
    } catch (err: any) {
      console.warn(`[SNS] Publish failed, falling back: ${err.message}`)
    }
  }

  // Simulation mode
  console.log(`[SNS-Simulated] Dispatched "${subject}" to topic "${topicArn || 'local-topic'}"`)
  return {
    success: true,
    messageId: `sim-${Date.now()}`,
    topicArn,
    isSimulation: true,
  }
}

/**
 * Subscribes a student's email to resource updates via SNS
 */
export async function subscribeEmailToTopic(
  topicArn: string,
  email: string
): Promise<{ success: boolean; subscriptionArn?: string; isSimulation: boolean }> {
  if (awsConfig.isConfigured && topicArn) {
    try {
      const res = await snsClient.send(
        new SubscribeCommand({
          TopicArn: topicArn,
          Protocol: "email",
          Endpoint: email,
          ReturnSubscriptionArn: true,
        })
      )
      console.log(`[SNS] Subscribed ${email} to ${topicArn}`)
      return {
        success: true,
        subscriptionArn: res.SubscriptionArn,
        isSimulation: false,
      }
    } catch (err: any) {
      console.warn(`[SNS] Subscription error: ${err.message}`)
    }
  }

  return {
    success: true,
    subscriptionArn: `sim-sub-${Date.now()}`,
    isSimulation: true,
  }
}

/**
 * Dispatches notification when a new version of an educational resource is published
 */
export async function notifyResourceRevision(
  resourceTitle: string,
  versionNum: number,
  authorName: string,
  changeNote: string,
  subject: string
): Promise<NotificationResult> {
  const topicArn = awsConfig.sns.resourceUpdatesTopicArn
  const emailSubject = `OpenShelf Update: "${resourceTitle}" v${versionNum} is live!`
  const emailBody = `Hello from OpenShelf!

A new version has just been published for:
Title:   ${resourceTitle}
Version: v${versionNum}
Subject: ${subject}
Author:  ${authorName}

Changelog:
"${changeNote}"

Read the new version now on OpenShelf:
https://openshelf.edu/resources

--
OpenShelf Knowledge Exchange
Powered by Amazon SNS & AWS Cloud`

  return publishToTopic(topicArn, emailSubject, emailBody)
}

/**
 * Dispatches notification when a moderation action is taken
 */
export async function notifyModerationAction(
  resourceTitle: string,
  status: "approved" | "rejected" | "reported",
  moderatorNote?: string
): Promise<NotificationResult> {
  const topicArn = awsConfig.sns.moderationTopicArn
  const emailSubject = `OpenShelf Moderation Alert: "${resourceTitle}" is ${status.toUpperCase()}`
  const emailBody = `OpenShelf Moderation Update

Resource: "${resourceTitle}"
Status:   ${status.toUpperCase()}
${moderatorNote ? `Moderator Note: ${moderatorNote}` : ""}
Timestamp: ${new Date().toISOString()}

Check the moderation audit log in your OpenShelf dashboard.

--
OpenShelf Moderation Team`

  return publishToTopic(topicArn, emailSubject, emailBody)
}

export default {
  snsClient,
  publishToTopic,
  subscribeEmailToTopic,
  notifyResourceRevision,
  notifyModerationAction,
}
