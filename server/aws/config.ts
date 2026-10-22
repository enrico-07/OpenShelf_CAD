/**
 * AWS Centralized Configuration for OpenShelf
 * Supports local environment variables, AWS CLI profiles, and EC2 IAM roles.
 */

// Automatically load .env file if available (Node 20+)
try {
  process.loadEnvFile?.()
} catch {}

export interface AwsConfig {
  region: string
  credentials?: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  isConfigured: boolean
  s3: {
    bucketName: string
    presignedExpirySeconds: number
  }
  dynamoDb: {
    tablePrefix: string
    tables: {
      users: string
      resources: string
      resourceVersions: string
      userLibrary: string
      feedback: string
      moderation: string
      userFollows: string
      collections: string
    }
  }
  sns: {
    resourceUpdatesTopicArn: string
    moderationTopicArn: string
  }
  cloudWatch: {
    namespace: string
    logGroupName: string
  }
  cognito: {
    userPoolId: string
    clientId: string
  }
}

const region = process.env.AWS_REGION || "us-east-1"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || ""
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ""
const sessionToken = process.env.AWS_SESSION_TOKEN || ""

// True if explicit credentials or standard AWS environment is detected
const isConfigured = Boolean(
  (accessKeyId && secretAccessKey) ||
  process.env.AWS_PROFILE ||
  process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
  process.env.AWS_EXECUTION_ENV
)

const tablePrefix = process.env.AWS_DYNAMODB_TABLE_PREFIX || "OpenShelf-"

export const awsConfig: AwsConfig = {
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        }
      : undefined,
  isConfigured,
  s3: {
    bucketName: process.env.AWS_S3_BUCKET_NAME || "openshelf-learning-files-926642724952",
    presignedExpirySeconds: parseInt(process.env.AWS_S3_PRESIGNED_EXPIRY || "900", 10), // 15 mins
  },
  dynamoDb: {
    tablePrefix,
    tables: {
      users: `${tablePrefix}Users`,
      resources: `${tablePrefix}Resources`,
      resourceVersions: `${tablePrefix}ResourceVersions`,
      userLibrary: `${tablePrefix}UserLibrary`,
      feedback: `${tablePrefix}Feedback`,
      moderation: `${tablePrefix}Moderation`,
      userFollows: `${tablePrefix}UserFollows`,
      collections: `${tablePrefix}Collections`,
    },
  },
  sns: {
    resourceUpdatesTopicArn: process.env.AWS_SNS_RESOURCE_UPDATES_TOPIC_ARN || "",
    moderationTopicArn: process.env.AWS_SNS_MODERATION_TOPIC_ARN || "",
  },
  cloudWatch: {
    namespace: process.env.AWS_CLOUDWATCH_NAMESPACE || "OpenShelf/API",
    logGroupName: process.env.AWS_CLOUDWATCH_LOG_GROUP || "/aws/openshelf/api",
  },
  cognito: {
    userPoolId: process.env.AWS_COGNITO_USER_POOL_ID || "",
    clientId: process.env.AWS_COGNITO_CLIENT_ID || "",
  },
}

export default awsConfig
