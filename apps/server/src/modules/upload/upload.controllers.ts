import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

import type { Request, Response } from 'express';
import { fileProcessQueue, queueType } from '@repo/queue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

const uploadDoc = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const data = await fs.readFile(
      path.join(__dirname, '../../../data', req.file.filename),
      'utf-8',
    );
    const parsedData = JSON.parse(data);

    fileProcessQueue.add(queueType.FileProcessJobName.PROCESS_FILE, parsedData);
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
