const {
  S3Client,
  PutObjectCommand
} = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

const bucket = process.env.R2_BUCKET;
const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

const uploadBuffer = async ({
  buffer,
  key,
  contentType
}) => {
  if (!buffer) {
    throw new Error('R2 upload buffer is required');
  }

  if (!key) {
    throw new Error('R2 object key is required');
  }

  if (!bucket) {
    throw new Error('R2_BUCKET is not configured');
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream'
    })
  );

  if (!publicUrl) {
    throw new Error('R2_PUBLIC_URL is not configured');
  }

  return `${publicUrl}/${key}`;
};

module.exports = {
  uploadBuffer
};
