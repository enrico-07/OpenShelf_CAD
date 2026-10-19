/**
 * Automated Amazon S3 Bucket Provisioner for OpenShelf
 * Creates a private, secure S3 bucket with CORS and server-side encryption.
 */

import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketEncryptionCommand,
  PutPublicAccessBlockCommand,
} from "@aws-sdk/client-s3"
import { awsConfig } from "../aws/config.ts"

const s3 = new S3Client({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

async function initS3() {
  console.log("==================================================")
  console.log("   OpenShelf - Automated Amazon S3 Provisioning")
  console.log("==================================================")
  const bucketName = awsConfig.s3.bucketName
  console.log(`Region:      ${awsConfig.region}`)
  console.log(`Target Bucket: ${bucketName}`)
  console.log("--------------------------------------------------")

  try {
    let bucketExists = false

    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }))
      bucketExists = true
      console.log(`✓ Bucket '${bucketName}' already exists. Updating policies...`)
    } catch (err: any) {
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        bucketExists = false
      } else {
        // May still proceed to attempt creation or permissions check
        bucketExists = false
      }
    }

    if (!bucketExists) {
      process.stdout.write(`Creating private S3 bucket '${bucketName}'... `)
      const createParams: any = { Bucket: bucketName }
      if (awsConfig.region !== "us-east-1") {
        createParams.CreateBucketConfiguration = {
          LocationConstraint: awsConfig.region,
        }
      }
      await s3.send(new CreateBucketCommand(createParams))
      console.log("CREATED!")
    }

    // 1. Block Public Access (Enforce 100% private bucket)
    process.stdout.write("Applying Public Access Block (Private storage)... ")
    await s3.send(
      new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      })
    )
    console.log("SUCCESS!")

    // 2. Configure CORS for direct browser PUT uploads & reader GETs
    process.stdout.write("Configuring S3 CORS policy for browser upload/streaming... ")
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "HEAD"],
              AllowedOrigins: ["*"], // Allows local dev and production domains
              ExposeHeaders: ["ETag", "x-amz-server-side-encryption"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    )
    console.log("SUCCESS!")

    // 3. Enable Server-Side Encryption (AES-256)
    process.stdout.write("Enabling AES-256 Server-Side Encryption... ")
    await s3.send(
      new PutBucketEncryptionCommand({
        Bucket: bucketName,
        ServerSideEncryptionConfiguration: {
          Rules: [
            {
              ApplyServerSideEncryptionByDefault: {
                SSEAlgorithm: "AES256",
              },
            },
          ],
        },
      })
    )
    console.log("SUCCESS!")

    console.log("==================================================")
    console.log("Amazon S3 bucket configured successfully!")
    console.log("You can now view your bucket in the AWS S3 Console.")
    console.log("==================================================")
  } catch (err: any) {
    console.error("S3 Provisioning Error:", err.message)
    console.log("Tip: Bucket names in S3 must be globally unique across all AWS accounts.")
    console.log(`If '${bucketName}' is taken, adjust AWS_S3_BUCKET_NAME in .env and rerun.`)
  }
}

initS3()
