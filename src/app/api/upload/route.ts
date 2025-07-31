
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@/lib/firebase';
import { doc, getDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User, StorageStats } from '@/lib/types';

// Basic validation for environment variables
const {
  CLOUDFLARE_R2_ACCOUNT_ID,
  CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  CLOUDFLARE_R2_BUCKET_NAME,
} = process.env;

const s3Client = CLOUDFLARE_R2_ACCOUNT_ID && CLOUDFLARE_R2_ACCESS_KEY_ID && CLOUDFLARE_R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const DAILY_UPLOAD_LIMIT_MB = 200;
const DAILY_UPLOAD_LIMIT_BYTES = DAILY_UPLOAD_LIMIT_MB * 1024 * 1024;
const GLOBAL_STORAGE_LIMIT_GB = 9.9;
const GLOBAL_STORAGE_LIMIT_BYTES = GLOBAL_STORAGE_LIMIT_GB * 1024 * 1024 * 1024;

export async function POST(request: Request) {
  if (!s3Client || !CLOUDFLARE_R2_BUCKET_NAME) {
    return NextResponse.json({ error: 'Server not configured for file uploads.' }, { status: 500 });
  }

  try {
    const { filename, contentType, size, userId } = await request.json();

    // 1. Basic validation
    if (!filename || !contentType || !size || !userId) {
      return NextResponse.json({ error: 'Missing required fields: filename, contentType, size, userId' }, { status: 400 });
    }

    // 2. Per-file size limit check
    if (size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: `File size cannot exceed ${MAX_FILE_SIZE_MB}MB.` }, { status: 400 });
    }

    const userRef = doc(db, 'users', userId);
    const storageStatsRef = doc(db, 'storageStats', 'global');

    const [userDoc, storageStatsDoc] = await Promise.all([
      getDoc(userRef),
      getDoc(storageStatsRef),
    ]);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userData = userDoc.data() as User;
    let storageStatsData = storageStatsDoc.data() as StorageStats | undefined;

    // 3. Global storage limit check
    const now = new Date();
    let currentCycleStart = storageStatsData?.currentCycleStart?.toDate() || new Date(0);
    
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Check if the cycle needs to be reset
    if (currentCycleStart < oneMonthAgo) {
      storageStatsData = { totalStorageUsed: 0, currentCycleStart: Timestamp.fromDate(now) };
    }

    if (!storageStatsData) {
         storageStatsData = { totalStorageUsed: 0, currentCycleStart: Timestamp.fromDate(now) };
    }

    if (storageStatsData.totalStorageUsed + size > GLOBAL_STORAGE_LIMIT_BYTES) {
      const nextResetDate = new Date(currentCycleStart);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      return NextResponse.json({ 
        error: `Global storage limit reached. Please try again after ${nextResetDate.toLocaleDateString()}.` 
      }, { status: 429 });
    }


    // 4. Daily user upload limit check
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyUploads = userData.dailyUploads || {};
    const todayUploads = dailyUploads[today] || 0;

    if (todayUploads + size > DAILY_UPLOAD_LIMIT_BYTES) {
      return NextResponse.json({ error: `You have reached your daily upload limit of ${DAILY_UPLOAD_LIMIT_MB}MB.` }, { status: 429 });
    }
    
    // 5. Generate pre-signed URL for upload
    const command = new PutObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
      ContentLength: size,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // URL expires in 5 minutes

    // 6. Update stats in a batch
    const batch = writeBatch(db);
    
    // Update user's daily upload
    batch.update(userRef, {
      [`dailyUploads.${today}`]: todayUploads + size
    });
    
    // Update global storage stats
    batch.set(storageStatsRef, {
      totalStorageUsed: (storageStatsData.totalStorageUsed || 0) + size,
      currentCycleStart: storageStatsData.currentCycleStart,
    }, { merge: true });

    await batch.commit();

    // Return the signed URL and the object key (filename)
    return NextResponse.json({ 
        signedUrl,
        key: filename 
    });

  } catch (error: any) {
    console.error('Error creating signed URL:', error);
    return NextResponse.json({ error: 'Failed to process upload request', details: error.message }, { status: 500 });
  }
}
