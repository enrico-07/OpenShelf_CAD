/**
 * Automated Amazon SNS Provisioner for OpenShelf
 * Creates notification topics for resource revisions and moderation decisions.
 */

import {
  SNSClient,
  CreateTopicCommand,
  ListTopicsCommand,
} from "@aws-sdk/client-sns"
import { awsConfig } from "../aws/config.ts"

const sns = new SNSClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

async function initSns() {
  console.log("==================================================")
  console.log("   OpenShelf - Automated Amazon SNS Provisioning")
  console.log("==================================================")
  console.log(`Region: ${awsConfig.region}`)
  console.log("--------------------------------------------------")

  const topicsToCreate = [
    {
      name: "OpenShelf-ResourceUpdates-Topic",
      envKey: "AWS_SNS_RESOURCE_UPDATES_TOPIC_ARN",
      desc: "Sends real-time email alerts when a study guide or revision is published",
    },
    {
      name: "OpenShelf-Moderation-Topic",
      envKey: "AWS_SNS_MODERATION_TOPIC_ARN",
      desc: "Sends alerts to moderators when content is reported or reviewed",
    },
  ]

  const arns: Record<string, string> = {}

  try {
    for (const topic of topicsToCreate) {
      process.stdout.write(`Provisioning topic '${topic.name}'... `)
      const res = await sns.send(
        new CreateTopicCommand({
          Name: topic.name,
        })
      )
      const arn = res.TopicArn || ""
      arns[topic.envKey] = arn
      console.log("SUCCESS!")
      console.log(`   ARN: ${arn}`)
    }

    console.log("==================================================")
    console.log("Amazon SNS Topics configured successfully!")
    console.log("Copy these two lines into your .env file:")
    console.log("--------------------------------------------------")
    for (const [key, val] of Object.entries(arns)) {
      console.log(`${key}=${val}`)
    }
    console.log("--------------------------------------------------")
    console.log("Tip for Presentation:")
    console.log("Open AWS SNS Console -> Topics -> OpenShelf-ResourceUpdates-Topic")
    console.log("Click 'Create subscription' and enter your email. You will receive an activation email from AWS!")
    console.log("==================================================")
  } catch (err: any) {
    console.error("SNS Provisioning Error:", err.message)
    console.log("Verify that your AWS credentials in .env have SNS permissions (sns:*).")
  }
}

initSns()
