/**
 * Amazon S3 Client & Presigned URL Generator for OpenShelf
 * Handles direct-to-S3 pre-signed upload (PUT) and download (GET) URLs.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "node:crypto"
import { awsConfig } from "./config.ts"
import { config as appConfig } from "../security/config.ts"

export const s3Client = new S3Client({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

export interface PresignedUrlResult {
  url: string
  s3Key: string
  bucket: string
  expiresInSeconds: number
  isMock: boolean
}

/**
 * Generates an Amazon S3 pre-signed PUT URL for secure browser uploads
 */
export async function generatePresignedUploadUrl(
  s3Key: string,
  contentType: string = "application/pdf",
  expiresInSeconds: number = awsConfig.s3.presignedExpirySeconds
): Promise<PresignedUrlResult> {
  const bucket = awsConfig.s3.bucketName

  if (awsConfig.isConfigured) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        ContentType: contentType,
      })

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: expiresInSeconds,
      })

      return {
        url,
        s3Key,
        bucket,
        expiresInSeconds,
        isMock: false,
      }
    } catch (err: any) {
      console.warn(`[S3] Presigned PUT fallback: ${err.message}`)
    }
  }

  // Fallback signature simulation for offline/local testing
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds
  const signature = crypto
    .createHmac("sha256", appConfig.jwtSecret)
    .update(`PUT\n${bucket}\n${s3Key}\n${expires}`)
    .digest("hex")

  const simulatedUrl = `https://${bucket}.s3.${awsConfig.region}.amazonaws.com/${s3Key}?X-Amz-Signature=${signature}&expires=${expires}&simulation=true`

  return {
    url: simulatedUrl,
    s3Key,
    bucket,
    expiresInSeconds,
    isMock: true,
  }
}

/**
 * Generates an Amazon S3 pre-signed GET URL for secure, time-limited reading & download
 */
export async function generatePresignedDownloadUrl(
  s3Key: string,
  expiresInSeconds: number = awsConfig.s3.presignedExpirySeconds
): Promise<PresignedUrlResult> {
  const bucket = awsConfig.s3.bucketName

  if (awsConfig.isConfigured) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      })

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: expiresInSeconds,
      })

      return {
        url,
        s3Key,
        bucket,
        expiresInSeconds,
        isMock: false,
      }
    } catch (err: any) {
      console.warn(`[S3] Presigned GET fallback: ${err.message}`)
    }
  }

  // Fallback signature simulation for offline/local testing
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds
  const signature = crypto
    .createHmac("sha256", appConfig.jwtSecret)
    .update(`GET\n${bucket}\n${s3Key}\n${expires}`)
    .digest("hex")

  const simulatedUrl = `https://${bucket}.s3.${awsConfig.region}.amazonaws.com/${s3Key}?X-Amz-Signature=${signature}&expires=${expires}&simulation=true`

  return {
    url: simulatedUrl,
    s3Key,
    bucket,
    expiresInSeconds,
    isMock: true,
  }
}

/**
 * Deletes an object from S3 (e.g. upon rejected resource moderation or cleanup)
 */
export async function deleteS3Object(s3Key: string): Promise<boolean> {
  if (!awsConfig.isConfigured) return true
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: awsConfig.s3.bucketName,
        Key: s3Key,
      })
    )
    return true
  } catch (err: any) {
    console.warn(`[S3] Delete object failed: ${err.message}`)
    return false
  }
}

export default {
  s3Client,
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteS3Object,
}
