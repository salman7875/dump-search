import {
  CreateBucketCommand,
  ListBucketsCommand,
  PutBucketCorsCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  forcePathStyle: true,
  ...(process.env.AWS_ENDPOINT_URL && {
    endpoint: process.env.AWS_ENDPOINT_URL,
  }),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const initBucketCors = async (bucketName = 'my-bucket') => {
  try {
    const bucketInfo = await s3Client.send(
      new ListBucketsCommand({ BucketRegion: 'us-east-1' }),
    );

    if (bucketInfo.Buckets && bucketInfo.Buckets.length < 1) {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    }

    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
            },
          ],
        },
      }),
    );
    console.log(`CORS successfully configured for bucket: ${bucketName}`);
  } catch (err) {
    console.error('Failed to configure bucket CORS:', err);
  }
};

export default s3Client;
