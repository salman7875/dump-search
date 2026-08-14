import { performance, PerformanceObserver } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import path from "node:path";

import { calculateDocFrequency } from "./calculating/calc-doc-freq.js";
import { calculateIdfScore } from "./calculating/calc-idf-score.js";
import { calculateScore } from "./calculating/calc-score.js";
import { storeDoc } from "./storing/store-doc.js";
import { storeScores } from "./storing/store-score.js";
import { storeTokens } from "./storing/store-token.js";
import { SandboxedJob } from "bullmq";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results: Record<string, number> = {};

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    results[entry.name] = Number(entry.duration.toFixed(2));
    console.log(`[Metric] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
  }
});

observer.observe({ entryTypes: ["measure"], buffered: true });

export default async function fileProcess(job: SandboxedJob) {
  const url = "../../../../../../apps/server/data";
  const filePath = path.join(__dirname, url, job.data);

  Object.keys(results).forEach((key) => delete results[key]);

  performance.mark("job-start");

  performance.mark("read-file-start");
  const data = await fs.readFile(filePath, "utf-8");
  performance.mark("read-file-end");
  performance.measure("read-file", "read-file-start", "read-file-end");

  performance.mark("parse-json-start");
  const parsedData = JSON.parse(data);
  performance.mark("parse-json-end");
  performance.measure("parse-json", "parse-json-start", "parse-json-end");

  performance.mark("store-doc-start");
  const { docData, docIds } = storeDoc(parsedData);
  performance.mark("store-doc-end");
  performance.measure("store-doc", "store-doc-start", "store-doc-end");

  performance.mark("calculate-doc-freq-start");
  const {
    docFrequency,
    processedToken,
    processedTitleTokens,
    unProcessedTitleTokens,
    unProcessedToken,
  } = calculateDocFrequency(docData);
  performance.mark("calculate-doc-freq-end");
  performance.measure(
    "calculate-doc-freq",
    "calculate-doc-freq-start",
    "calculate-doc-freq-end",
  );

  performance.mark("calculate-idf-score-start");
  const idfScore = calculateIdfScore(docData.length || 1, docFrequency);
  performance.mark("calculate-idf-score-end");
  performance.measure(
    "calculate-idf-score",
    "calculate-idf-score-start",
    "calculate-idf-score-end",
  );

  performance.mark("store-tokens-start");
  storeTokens(
    docData,
    unProcessedToken,
    unProcessedTitleTokens,
    idfScore,
  );
  performance.mark("store-tokens-end");
  performance.measure(
    "store-tokens",
    "store-tokens-start",
    "store-tokens-end",
  );

  performance.mark("calculate-score-start");
  const scoreMap = calculateScore(
    docData,
    processedToken,
    docIds,
    processedTitleTokens,
  );
  performance.mark("calculate-score-end");
  performance.measure(
    "calculate-score",
    "calculate-score-start",
    "calculate-score-end",
  );

  performance.mark("store-scores-start");
  storeScores(scoreMap);
  performance.mark("store-scores-end");
  performance.measure(
    "store-scores",
    "store-scores-start",
    "store-scores-end",
  );

  performance.mark("job-end");
  performance.measure("total-job-time", "job-start", "job-end");

  await new Promise((resolve) => setImmediate(resolve));

  const outputPath = path.join(__dirname, "performance-results.json");

  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        jobId: job.id,
        processedAt: new Date().toISOString(),
        metrics: results,
      },
      null,
      2,
    ),
    "utf-8",
  );

  performance.clearMarks();
  performance.clearMeasures();

  return {
    message: "Success!",
    metrics: results,
    outputPath,
  };
}