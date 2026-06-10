import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

import { uploadService } from './upload.services.js';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

const uploadDoc = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    performance.mark('reading-doc-start');
    const data = await fs.readFile(
      path.join(__dirname, '../../../data', req.file.filename),
      'utf-8',
    );

    performance.mark('reading-doc-end');

    performance.mark('storing-doc-data-start');
    const { docData, docIds } = uploadService.storeDocData(data);
    performance.mark('storing-doc-data-end');

    performance.mark('calculating-doc-freq-start');
    const { docFrequency, processedToken } =
      uploadService.calculateDocFrequency(docData);

    performance.mark('calculating-doc-freq-end');

    performance.mark('calculating-idf-score-start');
    const idfScore = uploadService.calculateIdfScore(docData, docFrequency);
    performance.mark('calculating-idf-score-end');

    performance.mark('storing-token-start');
    uploadService.storeTokens(docData, processedToken, idfScore);
    performance.mark('storing-token-end');

    performance.mark('calculating-score-start');
    const scoreMap = uploadService.calculateScore(
      docData,
      processedToken,
      docIds,
    );
    performance.mark('calculating-score-end');

    performance.mark('storing-score-start');
    uploadService.storeScores(scoreMap);
    performance.mark('storing-score-end');

    // 1. Compute the performance measurements
    performance.measure(
      '1. Read File From Disk',
      'reading-doc-start',
      'reading-doc-end',
    );
    performance.measure(
      '2. Store Doc Data Structure',
      'storing-doc-data-start',
      'storing-doc-data-end',
    );
    performance.measure(
      '3. Calculate Doc Frequency',
      'calculating-doc-freq-start',
      'calculating-doc-freq-end',
    );
    performance.measure(
      '4. Calculate IDF Scores',
      'calculating-idf-score-start',
      'calculating-idf-score-end',
    );
    performance.measure(
      '5. Database: Store Tokens',
      'storing-token-start',
      'storing-token-end',
    );
    performance.measure(
      '6. Calculate Search Scores',
      'calculating-score-start',
      'calculating-score-end',
    );
    performance.measure(
      '7. Database: Store Scores',
      'storing-score-start',
      'storing-score-end',
    );

    // 2. Format the file output string
    let report = `\n==================================================\n`;
    report += `BENCHMARK RUN: ${new Date().toLocaleString()}\n`;
    report += `FILE PROCESSED: ${req.file.filename}\n`;
    report += `--------------------------------------------------\n`;

    const measures = performance.getEntriesByType('measure');
    measures.forEach((m) => {
      report += `⏱️  ${m.name.padEnd(30)} : ${(m.duration / 1000).toFixed(3)} seconds\n`;
    });
    report += `==================================================\n`;

    // 3. Write/Append the report to a file named 'benchmark_results.txt' in your root directory
    const logPath = path.join(
      __dirname,
      '../../../optimized_benchmark_results.txt',
    );
    await fs.appendFile(logPath, report, 'utf-8');

    // 4. Clean up markers from memory
    performance.clearMarks();
    performance.clearMeasures();

    res.status(201).json({
      success: true,
      message:
        'File uploaded successfully! Check benchmark_results.txt for metrics.',
    });
  } catch (error) {
    // Clean up memory even if a failure happens
    performance.clearMarks();
    performance.clearMeasures();

    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      err: error,
    });
  }
};

export const uploadController = {
  uploadDoc,
};
