import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../utils/env.js";

const s3Client = new S3Client({});

const encodeS3Key = (key: string) =>
  key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

const normalizeFileName = (fileName: string) =>
  fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "-");

export const createFileUploadSignedUrl = async ({
  fileName,
  contentType,
}: {
  fileName: string;
  contentType?: string;
}) => {
  const bucketName = env("FILES_BUCKET_NAME");
  const region = env("AWS_REGION", "us-east-1");
  const normalizedFileName = normalizeFileName(fileName);
  const key = `uploads/${randomUUID()}-${normalizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadSignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 15,
  });
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodeS3Key(key)}`;

  return {
    uploadSignedUrl,
    publicUrl,
  };
};
