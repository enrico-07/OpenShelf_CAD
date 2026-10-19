/**
 * Amazon DynamoDB Client & DocumentClient Wrapper for OpenShelf
 * Configures marshalling to handle JavaScript native types cleanly.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { awsConfig } from "./config.ts"

// Initialize base client
export const rawDynamoClient = new DynamoDBClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

// Initialize DocumentClient with automatic object unmarshalling
export const dynamoDocClient = DynamoDBDocumentClient.from(rawDynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
})

export default dynamoDocClient
