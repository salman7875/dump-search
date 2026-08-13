import type { Request, Response } from 'express';
import { fileProcessQueue, queueType } from '@repo/queue';

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
