import type { Request, Response } from 'express';
import { fileProcessQueue, queueType } from '@repo/queue';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../../libs/s3/index.js';

const getUploadUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;
    const s3Key = `uploads/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: 'my-bucket',
      Key: s3Key,
      ContentType: fileType,
    });

    const uploadUrl = getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.status(201).json({ success: true, data: { uploadUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
};

const uploadDoc = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    fileProcessQueue.add(
      queueType.FileProcessJobName.PROCESS_FILE,
      req.file.filename,
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
  uploadDoc,
};
