/**
 * Automated DynamoDB Table Provisioner for OpenShelf
 * Creates all required DynamoDB tables using Pay-Per-Request (On-Demand) billing
 * to avoid any idle AWS charges (Free Tier friendly).
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb"
import { awsConfig } from "../aws/config.ts"

const ddb = new DynamoDBClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

const tablesToCreate = [
  {
    TableName: awsConfig.dynamoDb.tables.resources,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" as const }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" as const }],
    Description: "Stores core educational resources metadata, status, ratings, and authors",
  },
  {
    TableName: awsConfig.dynamoDb.tables.resourceVersions,
    KeySchema: [
      { AttributeName: "resourceId", KeyType: "HASH" as const },
      { AttributeName: "version", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "resourceId", AttributeType: "N" as const },
      { AttributeName: "version", AttributeType: "N" as const },
    ],
    Description: "Stores version history, changelogs, contributor attribution, and S3 file pointers",
  },
  {
    TableName: awsConfig.dynamoDb.tables.feedback,
    KeySchema: [
      { AttributeName: "resourceId", KeyType: "HASH" as const },
      { AttributeName: "id", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "resourceId", AttributeType: "N" as const },
      { AttributeName: "id", AttributeType: "N" as const },
    ],
    Description: "Stores community ratings, peer reviews, comments, and replies",
  },
  {
    TableName: awsConfig.dynamoDb.tables.collections,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" as const }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" as const }],
    Description: "Stores custom curated shelves, playlists, and study tracks",
  },
  {
    TableName: awsConfig.dynamoDb.tables.users,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" as const }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" as const }],
    Description: "Stores user profiles, roles (learner/moderator), and preferences",
  },
]

async function initDynamoDb() {
  console.log("==================================================")
  console.log("   OpenShelf - Automated DynamoDB Provisioning")
  console.log("==================================================")
  console.log(`Region: ${awsConfig.region}`)
  console.log(`Prefix: ${awsConfig.dynamoDb.tablePrefix}`)
  console.log("--------------------------------------------------")

  try {
    const listRes = await ddb.send(new ListTablesCommand({}))
    const existing = new Set(listRes.TableNames || [])

    for (const schema of tablesToCreate) {
      process.stdout.write(`Checking '${schema.TableName}'... `)

      if (existing.has(schema.TableName)) {
        console.log("ALREADY EXISTS")
        continue
      }

      console.log("CREATING...")
      await ddb.send(
        new CreateTableCommand({
          TableName: schema.TableName,
          KeySchema: schema.KeySchema,
          AttributeDefinitions: schema.AttributeDefinitions,
          BillingMode: "PAY_PER_REQUEST", // Zero idle cost!
        })
      )
      console.log(`✓ Table '${schema.TableName}' created successfully!`)
    }

    console.log("==================================================")
    console.log("All OpenShelf DynamoDB tables provisioned!")
    console.log("You can now open AWS DynamoDB Console and view your tables.")
    console.log("==================================================")
  } catch (err: any) {
    console.error("DynamoDB Provisioning Error:", err.message)
    console.log("Ensure your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env are active.")
  }
}

initDynamoDb()
