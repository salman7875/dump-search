import type { Request, Response } from 'express';
import { fileProcessQueue, queueType } from '@repo/queue';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../../libs/s3/index.js';

const getUploadUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;
    const s3Key = `uploads/${Date.now()}-${fileName}`;
    const contentType = fileType || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: 'my-bucket',
      Key: s3Key,
      ContentType: contentType,
    });

    let uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    if (process.env.NODE_ENV !== 'production' && process.env.AWS_ENDPOINT_URL) {
      uploadUrl = uploadUrl.replace(
        'http://floci:4566',
        'http://localhost:4566',
      );
    }

    res.status(201).json({ success: true, data: { uploadUrl, key: s3Key } });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
};

const uploadDoc = async (req: Request, res: Response) => {
  try {
    const { key, fileName } = req.body;

    const command = new GetObjectCommand({ Bucket: 'my-bucket', Key: key });
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    fileProcessQueue.add(
      queueType.FileProcessJobName.PROCESS_FILE,
      presignedUrl,
    );
    res.status(201).json({
      success: true,
      message: 'File is being added to the queue!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

export const uploadController = {
  getUploadUrl,
  uploadDoc,
};
