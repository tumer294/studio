
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Basic validation for environment variables
const {
  CLOUDFLARE_R2_ACCOUNT_ID,
  CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  CLOUDFLARE_R2_BUCKET_NAME,
} = process.env;

if (!CLOUDFLARE_R2_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY_ID || !CLOUDFLARE_R2_SECRET_ACCESS_KEY || !CLOUDFLARE_R2_BUCKET_NAME) {
  throw new Error('Cloudflare R2 environment variables are not properly configured.');
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: Request) {
  if (!s3Client) {
      return NextResponse.json({ error: 'Server not configured for file operations.' }, { status: 500 });
  }

  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Missing required field: key' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    });
    
    // Generate a pre-signed URL for download, valid for 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 

    return NextResponse.json({ signedUrl });

  } catch (error: any) {
    console.error('Error creating signed download URL:', error);
    return NextResponse.json({ error: 'Failed to process download request', details: error.message }, { status: 500 });
  }
}
