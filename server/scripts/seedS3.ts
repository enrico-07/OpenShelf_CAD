import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { awsConfig } from "../aws/config.ts"

const s3 = new S3Client({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

const sampleMaterials = [
  {
    key: "resources/1/v1.pdf",
    title: "Computer Networks & Architecture Comprehensive Study Guide",
    subject: "Computer Science",
    author: "Alex Rivers",
    pages: 14,
  },
  {
    key: "resources/1/v2.pdf",
    title: "Computer Networks & Architecture (Community Revision 2)",
    subject: "Computer Science",
    author: "Elena Rostova",
    pages: 16,
  },
  {
    key: "resources/2/v1.pdf",
    title: "Discrete Mathematics & Graph Theory Exam Formula Sheet",
    subject: "Mathematics",
    author: "Marcus Chen",
    pages: 8,
  },
  {
    key: "resources/3/v1.pdf",
    title: "Operating Systems Memory Management & Concurrency Primitives",
    subject: "Computer Science",
    author: "Alex Rivers",
    pages: 22,
  },
  {
    key: "resources/4/v1.pdf",
    title: "Database Management Systems Relational Algebra & Normalization Guide",
    subject: "Computer Science",
    author: "Dr. Sarah Patel",
    pages: 18,
  },
  {
    key: "resources/5/v1.pdf",
    title: "Organic Chemistry Reaction Mechanisms & Synthesis Drills",
    subject: "Chemistry",
    author: "Liam O'Connor",
    pages: 12,
  },
]

function generateMinimalPdfBuffer(title: string, subject: string, author: string, pages: number): Buffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 20 Tf
50 720 Td
(OpenShelf Digital Library - Verified Study Resource) Tj
0 -30 Td
/F1 14 Tf
(Title: ${title.slice(0, 50)}) Tj
0 -20 Td
(Subject: ${subject} | Author: ${author} | Pages: ${pages}) Tj
0 -20 Td
(Storage: Amazon S3 Encrypted Object Store) Tj
0 -20 Td
(License: Creative Commons BY 4.0 Verified) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000495 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
566
%%EOF`

  return Buffer.from(content, "utf-8")
}

async function seedS3Bucket() {
  console.log("==================================================")
  console.log("   OpenShelf - Amazon S3 Study Materials Seeder   ")
  console.log("==================================================")
  const bucket = awsConfig.s3.bucketName
  console.log(`Target Bucket: ${bucket}`)
  console.log(`Region:        ${awsConfig.region}`)
  console.log("--------------------------------------------------")

  for (const item of sampleMaterials) {
    const pdfData = generateMinimalPdfBuffer(item.title, item.subject, item.author, item.pages)
    process.stdout.write(`Uploading '${item.key}' (${pdfData.length} bytes)... `)

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: item.key,
        Body: pdfData,
        ContentType: "application/pdf",
        Metadata: {
          "x-amz-meta-title": item.title.slice(0, 100),
          "x-amz-meta-subject": item.subject,
          "x-amz-meta-author": item.author,
          "x-amz-meta-managed-by": "OpenShelf-Core",
        },
      })
    )
    console.log("SUCCESS!")
  }

  console.log("--------------------------------------------------")
  console.log("Verifying objects in Amazon S3...")
  const listRes = await s3.send(new ListObjectsV2Command({ Bucket: bucket }))
  console.log(`Total objects currently in bucket '${bucket}': ${listRes.Contents?.length || 0}`)
  listRes.Contents?.forEach((obj) => {
    console.log(`  ✓ ${obj.Key} (${obj.Size} bytes, modified: ${obj.LastModified?.toISOString()})`)
  })
  console.log("==================================================")
}

seedS3Bucket().catch((err) => {
  console.error("Failed to seed S3 bucket:", err)
  process.exit(1)
})
