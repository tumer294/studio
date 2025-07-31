
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Missing required field: key' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
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
