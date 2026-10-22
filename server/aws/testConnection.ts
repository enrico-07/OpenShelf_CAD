/**
 * AWS Connection & Diagnostic Tool for OpenShelf
 * Tests connection to STS, DynamoDB, S3, SNS, and CloudWatch.
 */

import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts"
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import { SNSClient, ListTopicsCommand } from "@aws-sdk/client-sns"
import { CloudWatchClient, ListMetricsCommand } from "@aws-sdk/client-cloudwatch"
import { PollyClient, DescribeVoicesCommand } from "@aws-sdk/client-polly"
import { TranslateClient, ListLanguagesCommand } from "@aws-sdk/client-translate"
import { awsConfig } from "./config.ts"

async function runDiagnostics() {
  console.log("==================================================")
  console.log("   OpenShelf - AWS Cloud Connectivity Diagnostic")
  console.log("==================================================")
  console.log(`Region configured: ${awsConfig.region}`)
  console.log(
    `Credentials mode: ${
      awsConfig.credentials
        ? "Explicit Access Key (from .env)"
        : "Default Credential Provider Chain (IAM Role / AWS CLI)"
    }`
  )
  console.log("--------------------------------------------------")

  const clientConfig = {
    region: awsConfig.region,
    ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
  }

  // 1. Test STS (Account Identity)
  try {
    process.stdout.write("1. Testing AWS Identity (STS)... ")
    const sts = new STSClient(clientConfig)
    const identity = await sts.send(new GetCallerIdentityCommand({}))
    console.log("SUCCESS!")
    console.log(`   - AWS Account: ${identity.Account}`)
    console.log(`   - IAM ARN:     ${identity.Arn}`)
    console.log(`   - User ID:     ${identity.UserId}`)
  } catch (err: any) {
    console.log("FAILED!")
    console.log(`   Error: ${err.message}`)
    console.log(
      "   Tip: If you haven't added your AWS keys yet, paste AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file."
    )
    return
  }

  // 2. Test S3
  try {
    process.stdout.write("2. Testing Amazon S3... ")
    const s3 = new S3Client(clientConfig)
    const buckets = await s3.send(new ListBucketsCommand({}))
    console.log("SUCCESS!")
    const bucketNames = buckets.Buckets?.map((b) => b.Name) || []
    console.log(`   - Total buckets: ${bucketNames.length}`)
    const targetFound = bucketNames.includes(awsConfig.s3.bucketName)
    console.log(
      `   - Target bucket '${awsConfig.s3.bucketName}': ${
        targetFound ? "EXISTS" : "NOT FOUND (can be created in Step 3)"
      }`
    )
  } catch (err: any) {
    console.log("FAILED!")
    console.log(`   Error: ${err.message}`)
  }

  // 3. Test DynamoDB
  try {
    process.stdout.write("3. Testing Amazon DynamoDB... ")
    const ddb = new DynamoDBClient(clientConfig)
    const tables = await ddb.send(new ListTablesCommand({}))
    console.log("SUCCESS!")
    const existing = tables.TableNames || []
    console.log(`   - Existing tables: ${existing.length}`)
    const openShelfTables = existing.filter((t) =>
      t.startsWith(awsConfig.dynamoDb.tablePrefix)
    )
    console.log(
      `   - OpenShelf tables found: ${openShelfTables.length} (${openShelfTables.join(
        ", "
      ) || "none yet, will be created in Step 2"})`
    )
  } catch (err: any) {
    console.log("FAILED!")
    console.log(`   Error: ${err.message}`)
  }

  // 4. Test SNS
  try {
    process.stdout.write("4. Testing Amazon SNS... ")
    const sns = new SNSClient(clientConfig)
    const topics = await sns.send(new ListTopicsCommand({}))
    console.log("SUCCESS!")
    console.log(`   - Existing topics: ${topics.Topics?.length || 0}`)
  } catch (err: any) {
    console.log("FAILED!")
    console.log(`   Error: ${err.message}`)
  }

  // 5. Test CloudWatch
  try {
    process.stdout.write("5. Testing Amazon CloudWatch... ")
    const cw = new CloudWatchClient(clientConfig)
    await cw.send(new ListMetricsCommand({ Namespace: awsConfig.cloudWatch.namespace }))
    console.log("SUCCESS!")
    console.log(`   - Metric namespace '${awsConfig.cloudWatch.namespace}' is accessible`)
  } catch (err: any) {
    console.log("FAILED!")
    console.log(`   Error: ${err.message}`)
  }

  // 6. Test Amazon Polly
  try {
    process.stdout.write("6. Testing Amazon Polly (Text-to-Speech)... ")
    const polly = new PollyClient(clientConfig)
    const voices = await polly.send(new DescribeVoicesCommand({ LanguageCode: "en-US" }))
    console.log("SUCCESS!")
    console.log(`   - Available US English voices: ${voices.Voices?.length || 0}`)
  } catch (err: any) {
    console.log("FAILED!")
    console.log(`   Error: ${err.message}`)
  }

  // 7. Test Amazon Translate
  try {
    process.stdout.write("7. Testing Amazon Translate (Neural Translation)... ")
    const translate = new TranslateClient(clientConfig)
    const languages = await translate.send(new ListLanguagesCommand({ MaxResults: 10 }))
    console.log("SUCCESS!")
    console.log(`   - Neural Translation engine accessible`)
  } catch (err: any) {
    console.log("FAILED!")
    console.log(`   Error: ${err.message}`)
  }

  console.log("==================================================")
  console.log("AWS Diagnostics Completed.")
  console.log("==================================================")
}

runDiagnostics()
